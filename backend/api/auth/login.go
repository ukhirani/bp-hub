package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"cloud.google.com/go/firestore"

	"github.com/ukhirani/bp-hub/backend/types"
	"github.com/ukhirani/bp-hub/backend/utils"
)

func LoginHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		utils.ConfigureHeader(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		response := types.LoginResponse{
			Token: "token from backend",
		}

		if err := json.NewEncoder(w).Encode(response); err != nil {
			fmt.Println("error encoding response to writer : ", err)
		}
	}
}
