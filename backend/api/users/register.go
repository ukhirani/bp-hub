package users

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

func RegisterUserDetailsHandler(client *firestore.Client, authClient *auth.Client, ctx context.Context) http.HandlerFunc {
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

		var req types.UserDetailsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_JSON"}})
			return
		}

		req.Username = normalizeUsername(req.Username)
		if req.IDToken == "" {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "MISSING_ID_TOKEN"}})
			return
		}
		if !isValidUsername(req.Username) {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_USERNAME"}})
			return
		}
		if req.GithubLink == "" || !strings.HasPrefix(req.GithubLink, "http") {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_GITHUB_LINK"}})
			return
		}
		if strings.TrimSpace(req.ProfileDescription) == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "PROFILE_DESCRIPTION_REQUIRED"}})
			return
		}
		if len(req.ProfileDescription) > 5000 {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "PROFILE_DESCRIPTION_TOO_LONG"}})
			return
		}

		verifiedToken, err := authClient.VerifyIDToken(ctx, req.IDToken)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_ID_TOKEN"}})
			return
		}

		uid := verifiedToken.UID

		userIter := client.Collection("users").Where("uid", "==", uid).Limit(1).Documents(ctx)
		userDocs, err := userIter.GetAll()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_LOOKUP_FAILED"}})
			return
		}
		if len(userDocs) > 0 {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_ALREADY_REGISTERED"}})
			return
		}

		if _, err := client.Collection("users").Doc(req.Username).Get(ctx); err == nil {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USERNAME_TAKEN"}})
			return
		}

		profile := types.UserProfile{
			Username:           req.Username,
			UID:                uid,
			GithubLink:         req.GithubLink,
			ProfileDescription: req.ProfileDescription,
			Templates:          map[string]string{},
			CreatedAt:          time.Now().Unix(),
		}

		if _, err := client.Collection("users").Doc(req.Username).Set(ctx, profile); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_CREATE_FAILED"}})
			return
		}

		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(types.UsernameCheckResponse{Available: true, Username: req.Username})
	}
}
