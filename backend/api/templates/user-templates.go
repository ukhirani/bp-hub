package templates

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"cloud.google.com/go/firestore"

	"github.com/ukhirani/bp-hub/backend/utils"
)

func GetUserTemplatesHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
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
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "USERNAME_REQUIRED"})
			return
		}

		iter := client.Collection("templates").Where("Username", "==", username).Documents(ctx)
		docs, err := iter.GetAll()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "TEMPLATE_LOOKUP_FAILED"})
			return
		}

		if len(docs) == 0 {
			legacyIter := client.Collection("templates").Where("username", "==", username).Documents(ctx)
			legacyDocs, legacyErr := legacyIter.GetAll()
			if legacyErr != nil {
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "TEMPLATE_LOOKUP_FAILED"})
				return
			}
			docs = legacyDocs
		}

		templates := make([]map[string]interface{}, 0, len(docs))
		for _, doc := range docs {
			templates = append(templates, doc.Data())
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(templates)
	}
}
