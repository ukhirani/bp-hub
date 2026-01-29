package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
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

	fmt.Println("\nRetrieving documents from 'users' collection:")
	iter := client.Collection("users").Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		log.Fatalf("Failed to iterate through documents: %v", err)
	}
	for _, doc := range docs {
		fmt.Printf("Document ID: %s, Data: %v\n", doc.Ref.ID, doc.Data())
	}
}
