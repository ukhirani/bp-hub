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

func CheckUsernameHandler(client *firestore.Client, authClient *auth.Client, ctx context.Context) http.HandlerFunc {
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

		var req types.UsernameCheckRequest
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

		if _, err := authClient.VerifyIDToken(ctx, req.IDToken); err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_ID_TOKEN"}})
			return
		}

		available := true
		if _, err := client.Collection("users").Doc(req.Username).Get(ctx); err == nil {
			available = false
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(types.UsernameCheckResponse{Available: available, Username: req.Username})
	}
}
