package templates

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
)

func GetTemplatesHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Handler logic to get templates

		fmt.Println("\nRetrieving documents from 'templates' collection:")
		iter := client.Collection("templates").Documents(ctx)
		docs, err := iter.GetAll()
		if err != nil {
			log.Fatalf("Failed to iterate through documents: %v", err)
		}
		for _, doc := range docs {
			fmt.Printf("Document ID: %s, Data: %v\n", doc.Ref.ID, doc.Data())
		}
	}
}
