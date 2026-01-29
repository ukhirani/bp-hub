package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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

func main() {
	fmt.Println("API is running on http://localhost" + Port)
	http.HandleFunc("/login", loginHandler)

	if err := http.ListenAndServe(Port, nil); err != nil {
		fmt.Println("Server error:", err)
		os.Exit(1)
	}
}
