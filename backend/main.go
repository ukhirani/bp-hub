package main

import (
	"fmt"
	"net/http"
)

const Port = ":8080"

func server(w http.ResponseWriter, r *http.Request) {
	_, err := fmt.Fprintf(w, "Server started . . . . /n")
	if err != nil {
		fmt.Println(err)
	}
}

func main() {
	fmt.Println("Starting server on", Port)
	http.HandleFunc("/", server)
	if err := http.ListenAndServe(Port, nil); err != nil {
		fmt.Printf("Error Printing on port %v - %v", Port, err)
	}
}
