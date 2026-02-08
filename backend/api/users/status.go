package users

import (
	"context"
	"encoding/json"
	"net/http"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

func UserStatusHandler(client *firestore.Client, authClient *auth.Client, ctx context.Context) http.HandlerFunc {
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

		var req types.UserStatusRequest
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

		verifiedToken, err := authClient.VerifyIDToken(ctx, req.IDToken)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_ID_TOKEN"}})
			return
		}

		uid := verifiedToken.UID
		iter := client.Collection("users").Where("uid", "==", uid).Limit(1).Documents(ctx)
		docs, err := iter.GetAll()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_LOOKUP_FAILED"}})
			return
		}

		if len(docs) == 0 {
			legacyIter := client.Collection("users").Where("UID", "==", uid).Limit(1).Documents(ctx)
			legacyDocs, legacyErr := legacyIter.GetAll()
			if legacyErr != nil {
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "USER_LOOKUP_FAILED"}})
				return
			}
			if len(legacyDocs) == 0 {
				w.WriteHeader(http.StatusOK)
				_ = json.NewEncoder(w).Encode(types.UserStatusResponse{HasProfile: false})
				return
			}
			docs = legacyDocs
		}

		username := docs[0].Ref.ID
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(types.UserStatusResponse{HasProfile: true, Username: username})
	}
}
