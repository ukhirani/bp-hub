package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ukhirani/bp-hub/backend/types"
)

const firebaseAuthBaseURL = "https://identitytoolkit.googleapis.com/v1"

func callFirebaseAuth(ctx context.Context, apiKey string, endpoint string, payload types.FirebaseAuthRequest) (types.AuthResponse, *types.AuthErrorResponse, int, error) {
	var authResp types.AuthResponse
	var authErr types.AuthErrorResponse

	url := fmt.Sprintf("%s/%s?key=%s", firebaseAuthBaseURL, endpoint, apiKey)
	body, err := json.Marshal(payload)
	if err != nil {
		return authResp, nil, 0, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return authResp, nil, 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return authResp, nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return authResp, nil, 0, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if err := json.Unmarshal(respBody, &authErr); err != nil {
			return authResp, nil, 0, err
		}
		return authResp, &authErr, resp.StatusCode, nil
	}

	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return authResp, nil, 0, err
	}

	return authResp, nil, resp.StatusCode, nil
}

func callFirebaseAuthOob(ctx context.Context, apiKey string, payload types.FirebaseOobRequest) (*types.AuthErrorResponse, int, error) {
	var authErr types.AuthErrorResponse

	url := fmt.Sprintf("%s/%s?key=%s", firebaseAuthBaseURL, "accounts:sendOobCode", apiKey)
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, 0, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if err := json.Unmarshal(respBody, &authErr); err != nil {
			return nil, 0, err
		}
		return &authErr, resp.StatusCode, nil
	}

	return nil, resp.StatusCode, nil
}

func callFirebaseAuthLookup(ctx context.Context, apiKey string, payload types.FirebaseLookupRequest) (types.FirebaseLookupResponse, *types.AuthErrorResponse, int, error) {
	var lookupResp types.FirebaseLookupResponse
	var authErr types.AuthErrorResponse

	url := fmt.Sprintf("%s/%s?key=%s", firebaseAuthBaseURL, "accounts:lookup", apiKey)
	body, err := json.Marshal(payload)
	if err != nil {
		return lookupResp, nil, 0, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return lookupResp, nil, 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return lookupResp, nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return lookupResp, nil, 0, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if err := json.Unmarshal(respBody, &authErr); err != nil {
			return lookupResp, nil, 0, err
		}
		return lookupResp, &authErr, resp.StatusCode, nil
	}

	if err := json.Unmarshal(respBody, &lookupResp); err != nil {
		return lookupResp, nil, 0, err
	}

	return lookupResp, nil, resp.StatusCode, nil
}
