package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

const secureTokenURL = "https://securetoken.googleapis.com/v1/token"

type refreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type firebaseRefreshRequest struct {
	GrantType    string `json:"grant_type"`
	RefreshToken string `json:"refresh_token"`
}

type firebaseRefreshResponse struct {
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    string `json:"expires_in"`
}

type refreshResponse struct {
	IDToken      string `json:"idToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
}

func RefreshTokenHandler(ctx context.Context) http.HandlerFunc {
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

		var req refreshRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_JSON"}})
			return
		}

		if req.RefreshToken == "" {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "MISSING_REFRESH_TOKEN"}})
			return
		}

		apiKey := os.Getenv("FIREBASE_WEB_API_KEY")
		if apiKey == "" {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "FIREBASE_WEB_API_KEY_NOT_SET"}})
			return
		}

		payload := firebaseRefreshRequest{
			GrantType:    "refresh_token",
			RefreshToken: req.RefreshToken,
		}

		body, err := json.Marshal(payload)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INTERNAL_ERROR"}})
			return
		}

		url := fmt.Sprintf("%s?key=%s", secureTokenURL, apiKey)
		httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INTERNAL_ERROR"}})
			return
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "REFRESH_SERVICE_ERROR"}})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INTERNAL_ERROR"}})
			return
		}

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INVALID_REFRESH_TOKEN"}})
			return
		}

		var fbResp firebaseRefreshResponse
		if err := json.Unmarshal(respBody, &fbResp); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(types.AuthErrorResponse{Error: types.AuthErrorDetail{Message: "INTERNAL_ERROR"}})
			return
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(refreshResponse{
			IDToken:      fbResp.IDToken,
			RefreshToken: fbResp.RefreshToken,
			ExpiresIn:    fbResp.ExpiresIn,
		})
	}
}
