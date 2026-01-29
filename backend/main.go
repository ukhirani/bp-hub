package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"context"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

const Port = ":8080"

type LoginResponse struct {
	Token string `json:"token"`
}

func configureHeader(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	configureHeader(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	response := LoginResponse{
		Token: "token from backend",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Println("error encoding response to writer : ", err)
	}
}

// YvbkJF4nRemBdAsE

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}
	mongoURI := os.Getenv("MONGO_DB_URI")
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(mongoURI).SetServerAPIOptions(serverAPI)
	client, err := mongo.Connect(opts)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err = client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	// Send a ping to confirm a successful connection
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")

	fmt.Println("API is running on http://localhost" + Port)
	http.HandleFunc("/login", loginHandler)

	if err := http.ListenAndServe(Port, nil); err != nil {
		fmt.Println("Server error:", err)
	}
}
