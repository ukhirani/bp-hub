package templates

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"

	"github.com/ukhirani/bp-hub/backend/types"
)

func AddTemplateHandler(client *firestore.Client, ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		randomTemplate := types.Template{
			TemplateID:         11111112,
			Username:           fmt.Sprintf("user%d", rand.Intn(1000)),
			TemplateName:       fmt.Sprintf("Template%d", rand.Intn(1000)),
			Type:               types.TemplateType("boilerplate"),
			GithubRepoLink:     "",
			PreCmds:            []types.Cmd{},
			PostCmds:           []types.Cmd{types.Cmd("go mod tidy"), types.Cmd("go build")},
			Tags:               []string{"go", "example"},
			Code:               "package main\nfunc main() {}",
			Stars:              rand.Intn(100),
			Clones:             rand.Intn(100),
			Usage:              "go run main.go",
			ForkOf:             111111,
			ForkedBoilerplates: []types.ID{},
			Description:        "A random template for demonstration.",
			Documentation:      "Usage: go run main.go",
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}

		// Add the random template to the "templates" collection
		docRef, _, err := client.Collection("templates").Add(ctx, randomTemplate)
		if err != nil {
			log.Fatalf("Failed to add random template: %v", err)
		}
		fmt.Printf("Random template added with ID: %s\n", docRef.ID)
	}
}
