package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Request/Response structs for API
type BusSearchRequest struct {
	From string `json:"from"`
	To   string `json:"to"`
	Date string `json:"date,omitempty"`
}

type BusRouteRequest struct {
	BusNumber string `json:"busNumber"`
}

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func main() {
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api/transport").Subrouter()

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	// Transport Help endpoints
	api.HandleFunc("/search-buses", searchBusesHandler).Methods("POST", "OPTIONS")
	api.HandleFunc("/bus-route", getBusRouteHandler).Methods("POST", "OPTIONS")
	api.HandleFunc("/bmtc-buses", getBMTCBusesHandler).Methods("POST", "OPTIONS")
	api.HandleFunc("/health", healthCheckHandler).Methods("GET")

	// Wrap router with CORS
	handler := c.Handler(r)

	fmt.Println("🚌 Transport Help API Server starting on :8087")
	fmt.Println("Available endpoints:")
	fmt.Println("  POST /api/transport/search-buses")
	fmt.Println("  POST /api/transport/bus-route")
	fmt.Println("  POST /api/transport/bmtc-buses")
	fmt.Println("  GET  /api/transport/health")

	log.Fatal(http.ListenAndServe(":8087", handler))
}

// Health check endpoint
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Data: map[string]string{
			"status":  "healthy",
			"service": "Transport Help API",
			"time":    time.Now().Format(time.RFC3339),
		},
	})
}

// Search buses endpoint (KSRTC for intercity, BMTC for local)
func searchBusesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		return
	}

	var req BusSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	if req.From == "" || req.To == "" {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "From and To locations are required",
		})
		return
	}

	// Determine if it's local or intercity travel
	fromLower := strings.ToLower(req.From)
	toLower := strings.ToLower(req.To)

	// Common BMTC locations within Bangalore
	bangaloreLocations := map[string]bool{
		"mg road": true, "majestic": true, "silk board": true, "hebbal": true,
		"whitefield": true, "electronic city": true, "jayanagar": true,
		"indiranagar": true, "marathahalli": true, "btm layout": true,
		"koramangala": true, "hsr layout": true, "jp nagar": true,
		"channasandra": true, "kengeri": true, "bannerghatta road": true,
		"airport": true, "yeshwanthpur": true, "shivajinagar": true,
		"kr puram": true, "tin factory": true, "domlur": true,
		"brigade road": true, "richmond road": true, "commercial street": true,
		"vijayanagar": true, "banashankari": true, "yelahanka": true,
		"malleswaram": true, "basavanagudi": true, "rajajinagar": true,
	}

	if bangaloreLocations[fromLower] && bangaloreLocations[toLower] {
		// Use BMTC service - return mock data
		json.NewEncoder(w).Encode(ApiResponse{
			Success: true,
			Data: map[string]interface{}{
				"serviceType": "BMTC",
				"buses": []map[string]interface{}{
					{
						"busNumber": "500D",
						"from":      req.From,
						"to":        req.To,
						"stops":     []string{req.From, "Intermediate Stop", req.To},
						"type":      "BMTC",
					},
					{
						"busNumber": "500C",
						"from":      req.From,
						"to":        req.To,
						"stops":     []string{req.From, "Another Stop", req.To},
						"type":      "BMTC",
					},
				},
				"from": req.From,
				"to":   req.To,
			},
		})
	} else {
		// Use KSRTC service for intercity travel - return mock data
		date := req.Date
		if date == "" {
			date = time.Now().Format("02-01-2006")
		}

		json.NewEncoder(w).Encode(ApiResponse{
			Success: true,
			Data: map[string]interface{}{
				"serviceType": "KSRTC",
				"from":        req.From,
				"to":          req.To,
				"date":        date,
				"luxuryBuses": []map[string]interface{}{
					{
						"serviceName":    "AIRAVAT",
						"departureTime":  "06:00",
						"arrivalTime":    "10:30",
						"availableSeats": 25,
						"fare":           "₹450",
						"busType":        "AC Volvo",
						"rating":         "4.2/5",
					},
				},
				"expressBuses": []map[string]interface{}{
					{
						"serviceName":    "RAJAHAMSA EXPRESS",
						"departureTime":  "08:15",
						"arrivalTime":    "12:45",
						"availableSeats": 18,
						"fare":           "₹380",
						"busType":        "AC Semi-Sleeper",
						"rating":         "4.0/5",
					},
				},
				"localBuses": []map[string]interface{}{
					{
						"serviceName":    "ORDINARY EXPRESS",
						"departureTime":  "09:30",
						"arrivalTime":    "14:30",
						"availableSeats": 32,
						"fare":           "₹180",
						"busType":        "Ordinary",
						"rating":         "3.5/5",
					},
				},
			},
		})
	}
}

// Get bus route endpoint
func getBusRouteHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		return
	}

	var req BusRouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	if req.BusNumber == "" {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "Bus number is required",
		})
		return
	}

	// Return mock data
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Data: map[string]interface{}{
			"busNumber": req.BusNumber,
			"from":      "Origin",
			"to":        "Destination",
			"stops":     []string{"Origin", "Stop 1", "Stop 2", "Destination"},
		},
	})
}

// Get BMTC buses between locations endpoint
func getBMTCBusesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		return
	}

	var req BusSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	if req.From == "" || req.To == "" {
		json.NewEncoder(w).Encode(ApiResponse{
			Success: false,
			Error:   "From and To locations are required",
		})
		return
	}

	// Return mock data
	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Data: map[string]interface{}{
			"buses": []map[string]interface{}{
				{
					"busNumber": "500D",
					"from":      req.From,
					"to":        req.To,
					"stops":     []string{req.From, "Intermediate Stop", req.To},
				},
				{
					"busNumber": "500C",
					"from":      req.From,
					"to":        req.To,
					"stops":     []string{req.From, "Another Stop", req.To},
				},
			},
			"from": req.From,
			"to":   req.To,
		},
	})
}
