package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	firebase "firebase.google.com/go/v4"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"

	"github.com/ukhirani/bp-hub/backend/api/auth"
	"github.com/ukhirani/bp-hub/backend/api/templates"
	"github.com/ukhirani/bp-hub/backend/api/users"
)

func main() {
	ctx := context.Background()

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: could not load .env: %v", err)
	}
	if os.Getenv("FIREBASE_CREDENTIALS_PATH") == "" {
		_ = godotenv.Load("backend/.env")
	}

	firebasePath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if firebasePath == "" {
		log.Fatal("FIREBASE_CREDENTIALS_PATH is not set")
	}

	resolvedPath := firebasePath
	if !filepath.IsAbs(firebasePath) {
		if _, err := os.Stat(firebasePath); err != nil {
			candidate := filepath.Join("backend", firebasePath)
			if _, err := os.Stat(candidate); err == nil {
				resolvedPath = candidate
			}
		}
	}
	if _, err := os.Stat(resolvedPath); err != nil {
		log.Fatalf("FIREBASE_CREDENTIALS_PATH not found: %s", resolvedPath)
	}

	opt := option.WithCredentialsFile(resolvedPath)

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

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error getting Firebase Auth client: %v\n", err)
	}

	http.HandleFunc("/login", auth.LoginHandler(client, ctx))
	http.HandleFunc("/signup", auth.SignupHandler(client, ctx))
	http.HandleFunc("/registerUserDetails", users.RegisterUserDetailsHandler(client, authClient, ctx))
	http.HandleFunc("/checkUsername", users.CheckUsernameHandler(client, authClient, ctx))
	http.HandleFunc("/userStatus", users.UserStatusHandler(client, authClient, ctx))
	http.HandleFunc("/getTemplates", templates.GetTemplatesHandler(client, ctx))
	http.HandleFunc("/addTemplate", templates.AddTemplateHandler(client, ctx))
	http.HandleFunc("/setTemplate", templates.SetTemplateHandler(client, ctx))

	fmt.Println("Listening server on :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Server error:", err)
		os.Exit(1)
	}
}
