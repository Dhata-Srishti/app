package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// KSRTC API client
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// Service represents a bus service
type Service struct {
	ServiceName    string `json:"serviceName"`
	DepartureTime  string `json:"departureTime"`
	ArrivalTime    string `json:"arrivalTime"`
	AvailableSeats int    `json:"availableSeats"`
	Fare           string `json:"fare"`
	BusType        string `json:"busType"`
	Rating         string `json:"rating,omitempty"`
}

// SearchResponse represents the response from the API
type SearchResponse struct {
	Services []Service `json:"services"`
}

// Struct to match the BMTC API response
type BMTCResponse struct {
	BusNumber string   `json:"busNumber"`
	From      string   `json:"from"`
	To        string   `json:"to"`
	Stops     []string `json:"stops"`
}

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

// NewClient creates a new KSRTC API client
func NewClient() *Client {
	return &Client{
		BaseURL: "https://ksrtc.in/oprs-web/avail/services.do",
		HTTPClient: &http.Client{
			Timeout: time.Second * 30,
		},
	}
}

// GetAvailableServices fetches available bus services between two locations
func (c *Client) GetAvailableServices(from, to, date string) (*SearchResponse, error) {
	// Create request URL
	params := url.Values{}
	params.Add("fromPlaceName", from)
	params.Add("toPlaceName", to)
	params.Add("journeyDate", date)

	// Make request
	requestURL := c.BaseURL + "?" + params.Encode()
	fmt.Println("Requesting:", requestURL)

	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "application/json")

	// Send request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Debug response
	fmt.Println("Status Code:", resp.StatusCode)
	fmt.Println("Content-Type:", resp.Header.Get("Content-Type"))

	// Check if response is HTML (likely an error page)
	if strings.Contains(resp.Header.Get("Content-Type"), "text/html") || strings.HasPrefix(string(body), "<") {
		return &SearchResponse{Services: []Service{}}, fmt.Errorf("received HTML response instead of JSON")
	}

	// Parse response
	var result SearchResponse
	if err := json.Unmarshal(body, &result); err != nil {
		// Print first 200 characters of response for debugging
		preview := string(body)
		if len(preview) > 200 {
			preview = preview[:200] + "..."
		}
		return nil, fmt.Errorf("error parsing JSON: %v\nResponse preview: %s", err, preview)
	}

	return &result, nil
}

// GetBMTCBusRoute fetches BMTC bus route information
func GetBMTCBusRoute(busNumber string) (*BMTCResponse, error) {
	url := fmt.Sprintf("https://mybmtcroute.herokuapp.com/busNumber/%s", busNumber)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result BMTCResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// MockBMTCBusRoute returns mock data for BMTC bus routes
func MockBMTCBusRoute(busNumber string) *BMTCResponse {
	mockRoutes := map[string]BMTCResponse{
		"500D": {
			BusNumber: "500D",
			From:      "Hebbal",
			To:        "Silk Board",
			Stops: []string{
				"Hebbal", "Veeranna Palya", "Manyata Tech Park",
				"Nagawara", "Hennur Cross", "Kalyan Nagar",
				"HRBR Layout", "Banaswadi", "Maruthi Sevanagar",
				"Ulsoor", "Trinity Circle", "MG Road",
				"Shivajinagar", "Richmond Circle", "Lalbagh West Gate",
				"South End Circle", "Jayanagar 4th Block",
				"JP Nagar 3rd Phase", "BTM Layout", "Silk Board",
			},
		},
		"500C": {
			BusNumber: "500C",
			From:      "Hebbal",
			To:        "Banashankari TTMC",
			Stops: []string{
				"Hebbal", "Mekhri Circle", "Sadashivanagar",
				"Palace Guttahalli", "Majestic", "KR Market",
				"Lalbagh West Gate", "South End Circle",
				"Jayanagar 4th Block", "Jayanagar 5th Block",
				"Banashankari Temple", "Banashankari TTMC",
			},
		},
		"401K": {
			BusNumber: "401K",
			From:      "Kadugodi",
			To:        "Majestic",
			Stops: []string{
				"Kadugodi", "Whitefield", "Hope Farm",
				"Varthur", "Marathahalli", "HAL",
				"Indiranagar", "Ulsoor", "MG Road",
				"Shivajinagar", "Majestic",
			},
		},
	}

	if route, exists := mockRoutes[busNumber]; exists {
		return &route
	}

	// Return a generic route if the bus number doesn't match
	return &BMTCResponse{
		BusNumber: busNumber,
		From:      "Origin Terminal",
		To:        "Destination Terminal",
		Stops:     []string{"Stop 1", "Stop 2", "Stop 3", "Stop 4", "Stop 5"},
	}
}

// isLocalBus checks if a service is a local bus
func isLocalBus(svc Service) bool {
	busType := strings.ToUpper(svc.BusType)
	serviceName := strings.ToUpper(svc.ServiceName)
	
	// Check for common local bus indicators
	localIndicators := []string{
		"ORDINARY", "SARIGE", "LOCAL", "REGULAR",
		"NON-AC", "PUSH BACK", "CITY", "TOWN",
	}
	
	for _, indicator := range localIndicators {
		if strings.Contains(busType, indicator) || strings.Contains(serviceName, indicator) {
			return true
		}
	}
	
	return false
}

// GetBMTCBusesBetweenLocations returns bus numbers that operate between two locations
func GetBMTCBusesBetweenLocations(from, to string) []string {
	// Normalize location names
	fromLower := strings.ToLower(from)
	toLower := strings.ToLower(to)
	
	// Common bus routes in Bangalore
	routes := map[string][]string{
		"mg road": {"500D", "500C", "401K", "201", "330E", "500A"},
		"majestic": {"500C", "401K", "330E", "500A", "201", "500K"},
		"silk board": {"500D", "335E", "335P", "201A", "500K"},
		"hebbal": {"500D", "500C", "500A", "500K"},
		"whitefield": {"401K", "500P", "335E", "G4"},
		"electronic city": {"335E", "335P", "500D", "500K"},
		"jayanagar": {"201", "201A", "500C", "500K"},
		"indiranagar": {"401K", "500P", "G4", "201"},
		"marathahalli": {"401K", "500P", "G4", "330E"},
		"btm layout": {"335E", "335P", "201A", "500D"},
		"koramangala": {"335E", "201A", "500P", "G4"},
		"hsr layout": {"335E", "335P", "201A"},
		"jp nagar": {"201", "201A", "500C"},
		"banashankari": {"500C", "201", "201A"},
		"yelahanka": {"500A", "500K", "KIA"},
	}
	
	// Get buses for both locations
	fromBuses := routes[fromLower]
	toBuses := routes[toLower]
	
	// Find common buses
	busNumbers := []string{}
	busMap := make(map[string]bool)
	
	// Add buses that serve both locations
	if fromBuses != nil && toBuses != nil {
		for _, bus := range fromBuses {
			busMap[bus] = true
		}
		for _, bus := range toBuses {
			if busMap[bus] {
				busNumbers = append(busNumbers, bus)
			}
		}
	}
	
	// If no common buses found, try to find buses that connect through major hubs
	if len(busNumbers) == 0 {
		majorHubs := []string{"majestic", "mg road", "silk board"}
		for _, hub := range majorHubs {
			hubBuses := routes[hub]
			if hubBuses != nil {
				// Check if both locations connect to this hub
				fromConnects := false
				toConnects := false
				
				if fromBuses != nil {
					for _, bus := range fromBuses {
						for _, hubBus := range hubBuses {
							if bus == hubBus {
								fromConnects = true
								break
							}
						}
					}
				}
				
				if toBuses != nil {
					for _, bus := range toBuses {
						for _, hubBus := range hubBuses {
							if bus == hubBus {
								toConnects = true
								break
							}
						}
					}
				}
				
				if fromConnects && toConnects {
					// Add connecting buses through this hub
					for _, bus := range hubBuses {
						if !busMap[bus] {
							busNumbers = append(busNumbers, bus)
							busMap[bus] = true
						}
					}
				}
			}
		}
	}
	
	// If still no routes found, return a few common buses as fallback
	if len(busNumbers) == 0 {
		busNumbers = []string{"500D", "500C", "500K"}
	}
	
	return busNumbers
}

// MockGetAvailableServices returns mock data for testing
func (c *Client) MockGetAvailableServices(from, to, date string) *SearchResponse {
	// Create mock services
	services := []Service{
		{
			ServiceName:    "AIRAVAT",
			DepartureTime:  "06:00",
			ArrivalTime:    "10:30",
			AvailableSeats: 25,
			Fare:           "₹450",
			BusType:        "AC Volvo",
			Rating:         "4.2/5",
		},
		{
			ServiceName:    "RAJAHAMSA EXECUTIVE",
			DepartureTime:  "08:15",
			ArrivalTime:    "12:45",
			AvailableSeats: 18,
			Fare:           "₹380",
			BusType:        "AC Semi-Sleeper",
			Rating:         "4.0/5",
		},
		{
			ServiceName:    "ORDINARY EXPRESS",
			DepartureTime:  "09:30",
			ArrivalTime:    "14:30",
			AvailableSeats: 32,
			Fare:           "₹180",
			BusType:        "Ordinary",
			Rating:         "3.5/5",
		},
	}
	
	return &SearchResponse{Services: services}
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

	fmt.Println("🚌 Transport Help API Server starting on :8081")
	fmt.Println("Available endpoints:")
	fmt.Println("  POST /api/transport/search-buses")
	fmt.Println("  POST /api/transport/bus-route")
	fmt.Println("  POST /api/transport/bmtc-buses")
	fmt.Println("  GET  /api/transport/health")
	
	log.Fatal(http.ListenAndServe(":8081", handler))
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
		// Use BMTC service
		busNumbers := GetBMTCBusesBetweenLocations(req.From, req.To)
		buses := make([]map[string]interface{}, 0)
		
		for _, busNumber := range busNumbers {
			route := MockBMTCBusRoute(busNumber)
			buses = append(buses, map[string]interface{}{
				"busNumber": busNumber,
				"from":      route.From,
				"to":        route.To,
				"stops":     route.Stops,
				"type":      "BMTC",
			})
		}

		json.NewEncoder(w).Encode(ApiResponse{
			Success: true,
			Data: map[string]interface{}{
				"serviceType": "BMTC",
				"buses":       buses,
				"from":        req.From,
				"to":          req.To,
			},
		})
	} else {
		// Use KSRTC service for intercity travel
		client := NewClient()
		
		// Format date
		date := req.Date
		if date == "" {
			date = time.Now().Format("02-01-2006")
		}

		// Try to get real data, fallback to mock
		results, err := client.GetAvailableServices(req.From, req.To, date)
		if err != nil || len(results.Services) == 0 {
			results = client.MockGetAvailableServices(req.From, req.To, date)
		}

		// Categorize buses
		response := map[string]interface{}{
			"serviceType": "KSRTC",
			"from":        req.From,
			"to":          req.To,
			"date":        date,
			"luxuryBuses": []Service{},
			"expressBuses": []Service{},
			"localBuses": []Service{},
		}

		for _, svc := range results.Services {
			if isLocalBus(svc) {
				response["localBuses"] = append(response["localBuses"].([]Service), svc)
			} else if strings.Contains(strings.ToUpper(svc.ServiceName), "EXPRESS") ||
				strings.Contains(strings.ToUpper(svc.BusType), "EXPRESS") {
				response["expressBuses"] = append(response["expressBuses"].([]Service), svc)
			} else {
				response["luxuryBuses"] = append(response["luxuryBuses"].([]Service), svc)
			}
		}

		json.NewEncoder(w).Encode(ApiResponse{
			Success: true,
			Data:    response,
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

	// Try to get real BMTC data, fallback to mock
	route, err := GetBMTCBusRoute(req.BusNumber)
	if err != nil {
		route = MockBMTCBusRoute(req.BusNumber)
	}

	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Data:    route,
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

	busNumbers := GetBMTCBusesBetweenLocations(req.From, req.To)
	buses := make([]map[string]interface{}, 0)
	
	for _, busNumber := range busNumbers {
		route := MockBMTCBusRoute(busNumber)
		buses = append(buses, map[string]interface{}{
			"busNumber": busNumber,
			"from":      route.From,
			"to":        route.To,
			"stops":     route.Stops,
		})
	}

	json.NewEncoder(w).Encode(ApiResponse{
		Success: true,
		Data: map[string]interface{}{
			"buses": buses,
			"from":  req.From,
			"to":    req.To,
		},
	})
} 