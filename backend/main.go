package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

const Port = ":8080"

type LoginResponse struct {
	Token string `json:"token"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	response := LoginResponse{
		Token: "test123",
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	fmt.Println("API is running on http://localhost" + Port)
	http.HandleFunc("/login", loginHandler)

	if err := http.ListenAndServe(Port, nil); err != nil {
		fmt.Println("Server error:", err)
	}
}
