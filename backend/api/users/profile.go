package users

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

func GetUserProfileHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		utils.ConfigureHeader(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		username := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("username")))
		if username == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USERNAME_REQUIRED"}})
			return
		}

		snap, err := client.Collection("users").Doc(username).Get(ctx)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_NOT_FOUND"}})
			return
		}

		var profile types.UserProfile
		if err := snap.DataTo(&profile); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_DECODE_FAILED"}})
			return
		}

		if profile.Username == "" {
			data := snap.Data()
			if value, ok := data["Username"].(string); ok {
				profile.Username = value
			}
			if value, ok := data["GithubLink"].(string); ok {
				profile.GithubLink = value
			}
			if value, ok := data["ProfileDescription"].(string); ok {
				profile.ProfileDescription = value
			}
			if profile.Username == "" {
				profile.Username = username
			}
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(profile)
	}
}

func UpdateUserProfileHandler(client *firestore.Client, authClient *auth.Client, ctx context.Context) http.HandlerFunc {
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

		var req types.UserProfileUpdateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_JSON"}})
			return
		}

		if req.IDToken == "" {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "MISSING_ID_TOKEN"}})
			return
		}

		if strings.TrimSpace(req.GithubLink) == "" || !strings.HasPrefix(req.GithubLink, "http") {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_GITHUB_LINK"}})
			return
		}

		if strings.TrimSpace(req.ProfileDescription) == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "PROFILE_DESCRIPTION_REQUIRED"}})
			return
		}

		verifiedToken, err := authClient.VerifyIDToken(ctx, req.IDToken)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_ID_TOKEN"}})
			return
		}

		username, err := lookupUsernameByUID(ctx, client, verifiedToken.UID)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_PROFILE_NOT_FOUND"}})
			return
		}

		updates := map[string]interface{}{
			"github_link":         strings.TrimSpace(req.GithubLink),
			"profile_description": strings.TrimSpace(req.ProfileDescription),
		}

		if _, err := client.Collection("users").Doc(username).Set(ctx, updates, firestore.MergeAll); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_UPDATE_FAILED"}})
			return
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(types.UserProfileUpdateResponse{Username: username})
	}
}
