package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

func SignupHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
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

		var req types.AuthRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_JSON"}})
			return
		}

		if req.Email == "" || req.Password == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "EMAIL_PASSWORD_REQUIRED"}})
			return
		}

		apiKey := os.Getenv("FIREBASE_WEB_API_KEY")
		if apiKey == "" {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "FIREBASE_WEB_API_KEY_NOT_SET"}})
			return
		}

		payload := types.FirebaseAuthRequest{
			Email:             req.Email,
			Password:          req.Password,
			ReturnSecureToken: true,
		}

		authResp, authErr, statusCode, err := callFirebaseAuth(ctx, apiKey, "accounts:signUp", payload)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "AUTH_SERVICE_ERROR"}})
			return
		}

		if authErr != nil {
			w.WriteHeader(statusCode)
			_ = json.NewEncoder(w).Encode(authErr)
			return
		}

		oobErr, _, err := callFirebaseAuthOob(ctx, apiKey, types.FirebaseOobRequest{
			RequestType: "VERIFY_EMAIL",
			IDToken:     authResp.IDToken,
		})
		if err != nil || oobErr != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "VERIFICATION_EMAIL_FAILED"}})
			return
		}

		if err := json.NewEncoder(w).Encode(types.AuthStatusResponse{Status: "VERIFICATION_EMAIL_SENT", Email: req.Email}); err != nil {
			fmt.Println("error encoding response to writer : ", err)
		}
	}
}
