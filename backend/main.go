package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	firebase "firebase.google.com/go/v4"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"

	"github.com/ukhirani/bp-hub/backend/api/auth"
	"github.com/ukhirani/bp-hub/backend/api/templates"
)

func main() {
	ctx := context.Background()

	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	firebasePath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	opt := option.WithCredentialsFile(firebasePath)

	config := &firebase.Config{ProjectID: "bp-hub-c995a"}
	app, err := firebase.NewApp(ctx, config, opt)
	if err != nil {
		log.Fatalf("Error initializing Firebase app: %v\n", err)
	}
	fmt.Println("Firebase app initialized successfully!")

	// --- Step 2: Get a Firestore client ---
	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error getting Firestore client: %v\n", err)
	}
	defer client.Close() // Close the client when main exits
	fmt.Println("Firestore client obtained.")

	http.HandleFunc("/login", auth.LoginHandler(client, ctx))
	http.HandleFunc("/getTemplates", templates.GetTemplatesHandler(client, ctx))

	fmt.Println("Listening server on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Server error:", err)
		os.Exit(1)
	}
}
