package templates

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"

	"github.com/ukhirani/bp-hub/backend/utils"
)

func GetTemplatesHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Handler logic to get templates
		utils.ConfigureHeader(w)

		fmt.Println("\nRetrieving documents from 'templates' collection:")
		iter := client.Collection("templates").Documents(ctx)
		docs, err := iter.GetAll()
		if err != nil {
			log.Fatalf("Failed to iterate through documents: %v", err)
		}
		// for _, doc := range docs {
		// 	fmt.Printf("Document ID: %s, Data: %v\n", doc.Ref.ID, doc.Data())
		// }

		w.WriteHeader(http.StatusOK)
		// Prepare a slice to hold the templates data
		templates := make([]map[string]interface{}, 0, len(docs))
		for _, doc := range docs {
			templates = append(templates, doc.Data())
		}

		// Encode the templates slice as JSON and write to the response
		if err := json.NewEncoder(w).Encode(templates); err != nil {
			http.Error(w, "Failed to encode templates", http.StatusInternalServerError)
			return
		}
	}
}
