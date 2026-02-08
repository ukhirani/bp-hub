package templates

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

var errTemplateNameTaken = errors.New("template name taken")

func AddTemplateHandler(client *firestore.Client, authClient *auth.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		utils.ConfigureHeader(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var req types.TemplateCreateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_JSON"}})
			return
		}

		req.TemplateName = strings.TrimSpace(req.TemplateName)
		if req.IDToken == "" {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "MISSING_ID_TOKEN"}})
			return
		}
		if req.TemplateName == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "TEMPLATE_NAME_REQUIRED"}})
			return
		}

		templateType := types.TemplateType(strings.ToLower(strings.TrimSpace(req.Type)))
		if templateType != types.TypeFile && templateType != types.TypeDir {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_TEMPLATE_TYPE"}})
			return
		}

		verifiedToken, err := authClient.VerifyIDToken(ctx, req.IDToken)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_ID_TOKEN"}})
			return
		}

		uid := verifiedToken.UID
		username, err := lookupUsername(ctx, client, uid)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_PROFILE_NOT_FOUND"}})
			return
		}

		if templateType == types.TypeFile {
			if strings.TrimSpace(req.Code) == "" {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "CODE_REQUIRED"}})
				return
			}
			if strings.TrimSpace(req.FileName) == "" {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "FILE_NAME_REQUIRED"}})
				return
			}
		}

		if templateType == types.TypeDir {
			if strings.TrimSpace(req.GithubRepoLink) == "" || !strings.HasPrefix(req.GithubRepoLink, "http") {
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_GITHUB_LINK"}})
				return
			}
		}

		now := time.Now()
		templateRef := client.Collection("templates").NewDoc()
		template := types.Template{
			TemplateID:         types.ID(now.Unix()),
			Username:           username,
			TemplateName:       req.TemplateName,
			Type:               templateType,
			GithubRepoLink:     strings.TrimSpace(req.GithubRepoLink),
			FileName:           strings.TrimSpace(req.FileName),
			PreCmds:            []types.Cmd{},
			PostCmds:           []types.Cmd{},
			Tags:               sanitizeTags(req.Tags),
			Code:               req.Code,
			Stars:              0,
			Clones:             0,
			Usage:              "",
			ForkedBoilerplates: []types.ID{},
			Description:        "",
			Documentation:      "",
			CreatedAt:          now,
			UpdatedAt:          now,
		}

		if err := client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
			userRef := client.Collection("users").Doc(username)
			userSnap, err := tx.Get(userRef)
			if err != nil {
				return err
			}

			data := userSnap.Data()
			existing := map[string]interface{}{}
			if templatesMap, ok := data["templates"].(map[string]interface{}); ok {
				existing = templatesMap
			}

			if _, ok := existing[req.TemplateName]; ok {
				return errTemplateNameTaken
			}

			existing[req.TemplateName] = templateRef.ID
			if err := tx.Set(templateRef, template); err != nil {
				return err
			}
			return tx.Set(userRef, map[string]interface{}{"templates": existing}, firestore.MergeAll)
		}); err != nil {
			if errors.Is(err, errTemplateNameTaken) {
				w.WriteHeader(http.StatusConflict)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "TEMPLATE_NAME_TAKEN"}})
				return
			}
			if status.Code(err) == codes.NotFound {
				w.WriteHeader(http.StatusNotFound)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_PROFILE_NOT_FOUND"}})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "TEMPLATE_CREATE_FAILED"}})
			return
		}

		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(types.TemplateCreateResponse{
			TemplateName: req.TemplateName,
			TemplateID:   templateRef.ID,
			Username:     username,
		})
	}
}

func sanitizeTags(tags []string) []string {
	cleaned := make([]string, 0, len(tags))
	seen := map[string]bool{}
	for _, tag := range tags {
		trimmed := strings.ToLower(strings.TrimSpace(tag))
		if trimmed == "" || seen[trimmed] {
			continue
		}
		seen[trimmed] = true
		cleaned = append(cleaned, trimmed)
	}
	return cleaned
}

func lookupUsername(ctx context.Context, client *firestore.Client, uid string) (string, error) {
	errUserNotFound := errors.New("user profile not found")
	iter := client.Collection("users").Where("uid", "==", uid).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return "", err
	}
	if len(docs) == 0 {
		legacy := client.Collection("users").Where("UID", "==", uid).Limit(1).Documents(ctx)
		legacyDocs, legacyErr := legacy.GetAll()
		if legacyErr != nil {
			return "", legacyErr
		}
		if len(legacyDocs) == 0 {
			return "", errUserNotFound
		}
		docs = legacyDocs
	}

	return docs[0].Ref.ID, nil
}
