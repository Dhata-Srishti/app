package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
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
	// Default routes for specific bus numbers - these are used as templates
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

// MockBMTCBusRouteWithUserInput returns mock data for BMTC bus routes that matches user input
func MockBMTCBusRouteWithUserInput(busNumber, userFrom, userTo string) *BMTCResponse {
	// Get the template route
	template := MockBMTCBusRoute(busNumber)
	
	// If we have user input, try to customize the route
	if userFrom != "" && userTo != "" {
		// Create a copy of the template
		customRoute := &BMTCResponse{
			BusNumber: busNumber,
			From:      userFrom,
			To:        userTo,
			Stops:     []string{},
		}
		
		// Check if the user's from and to locations are in the template's stops
		userFromLower := strings.ToLower(userFrom)
		userToLower := strings.ToLower(userTo)
		
		fromIndex := -1
		toIndex := -1
		
		for i, stop := range template.Stops {
			stopLower := strings.ToLower(stop)
			// More flexible matching - check if either contains the other
			if (strings.Contains(stopLower, userFromLower) || strings.Contains(userFromLower, stopLower)) && fromIndex == -1 {
				fromIndex = i
			}
			if (strings.Contains(stopLower, userToLower) || strings.Contains(userToLower, stopLower)) && toIndex == -1 {
				toIndex = i
			}
		}
		
		// If we found both locations in the route, extract the relevant portion
		if fromIndex != -1 && toIndex != -1 && fromIndex < toIndex {
			customRoute.Stops = template.Stops[fromIndex:toIndex+1]
			return customRoute
		}
		
		// If we couldn't find exact matches, create a reasonable route
		customRoute.Stops = []string{userFrom, "Intermediate Stop 1", "Intermediate Stop 2", userTo}
		return customRoute
	}
	
	return template
}

// MockGetAvailableServices returns mock data for testing
func (c *Client) MockGetAvailableServices(from, to, date string) *SearchResponse {
	// Normalize inputs for comparison
	fromLower := strings.ToLower(from)
	toLower := strings.ToLower(to)

	// Known popular routes with specific characteristics
	popularRoutes := map[string]map[string]struct {
		numServices   int
		hasLocalBuses bool
		hasAC         bool
		hasSleeper    bool
		minFare       int
		maxFare       int
		minTime       int // in minutes
		maxTime       int // in minutes
	}{
		"bengaluru": {
			"mysuru": {
				numServices:   8,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       120,
				maxFare:       950,
				minTime:       180,
				maxTime:       300,
			},
			"mangaluru": {
				numServices:   5,
				hasLocalBuses: false,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       450,
				maxFare:       1200,
				minTime:       420,
				maxTime:       540,
			},
			"hubballi": {
				numServices:   4,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       280,
				maxFare:       950,
				minTime:       360,
				maxTime:       480,
			},
		},
		"mysuru": {
			"bengaluru": {
				numServices:   8,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       120,
				maxFare:       950,
				minTime:       180,
				maxTime:       300,
			},
			"mangaluru": {
				numServices:   3,
				hasLocalBuses: false,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       550,
				maxFare:       1250,
				minTime:       480,
				maxTime:       600,
			},
		},
		"hubballi": {
			"bengaluru": {
				numServices:   4,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       280,
				maxFare:       950,
				minTime:       360,
				maxTime:       480,
			},
			"belagavi": {
				numServices:   6,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    false,
				minFare:       110,
				maxFare:       480,
				minTime:       120,
				maxTime:       180,
			},
		},
		"mangaluru": {
			"bengaluru": {
				numServices:   5,
				hasLocalBuses: false,
				hasAC:         true,
				hasSleeper:    true,
				minFare:       450,
				maxFare:       1200,
				minTime:       420,
				maxTime:       540,
			},
			"udupi": {
				numServices:   12,
				hasLocalBuses: true,
				hasAC:         true,
				hasSleeper:    false,
				minFare:       80,
				maxFare:       320,
				minTime:       60,
				maxTime:       120,
			},
		},
	}

	// Default values if route not found
	numServices := 3
	hasLocalBuses := false
	hasAC := true
	hasSleeper := true
	minFare := 300
	maxFare := 900
	minTime := 240
	maxTime := 420

	// Check if we have specific info for this route
	if cityMap, ok := popularRoutes[fromLower]; ok {
		if routeInfo, ok := cityMap[toLower]; ok {
			numServices = routeInfo.numServices
			hasLocalBuses = routeInfo.hasLocalBuses
			hasAC = routeInfo.hasAC
			hasSleeper = routeInfo.hasSleeper
			minFare = routeInfo.minFare
			maxFare = routeInfo.maxFare
			minTime = routeInfo.minTime
			maxTime = routeInfo.maxTime
		}
	}

	// Create services based on the route characteristics
	services := []Service{}

	// Add AC Volvo if available for this route
	if hasAC {
		acFare := maxFare
		if acFare < 800 {
			acFare = 800
		}

		// Morning AC bus
		morningAC := Service{
			ServiceName:    fmt.Sprintf("%s - %s VOLVO AC", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "08:30",
			ArrivalTime:    calculateArrival("08:30", minTime),
			AvailableSeats: int(15 + (time.Now().UnixNano() % 15)),
			Fare:           fmt.Sprintf("₹%d", acFare),
			BusType:        "Volvo AC",
			Rating:         "4.5",
		}
		services = append(services, morningAC)

		// Evening AC bus
		eveningAC := Service{
			ServiceName:    fmt.Sprintf("%s - %s VOLVO AC", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "18:30",
			ArrivalTime:    calculateArrival("18:30", minTime),
			AvailableSeats: int(8 + (time.Now().UnixNano() % 20)),
			Fare:           fmt.Sprintf("₹%d", acFare-50),
			BusType:        "Volvo AC",
			Rating:         "4.3",
		}
		services = append(services, eveningAC)
	}

	// Add Express bus
	expressFare := (minFare + maxFare) / 2
	if expressFare > 600 {
		expressFare = 600
	}
	express := Service{
		ServiceName:    fmt.Sprintf("%s - %s EXPRESS", strings.ToUpper(from), strings.ToUpper(to)),
		DepartureTime:  "10:00",
		ArrivalTime:    calculateArrival("10:00", (minTime+maxTime)/2),
		AvailableSeats: int(12 + (time.Now().UnixNano() % 15)),
		Fare:           fmt.Sprintf("₹%d", expressFare),
		BusType:        "Express Non-AC",
	}
	services = append(services, express)

	// Add Sleeper if available
	if hasSleeper {
		sleeperFare := maxFare + 50
		if sleeperFare < 900 {
			sleeperFare = 900
		}
		sleeper := Service{
			ServiceName:    fmt.Sprintf("%s - %s SLEEPER", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "21:30",
			ArrivalTime:    calculateArrival("21:30", maxTime),
			AvailableSeats: int(8 + (time.Now().UnixNano() % 10)),
			Fare:           fmt.Sprintf("₹%d", sleeperFare),
			BusType:        "Sleeper AC",
			Rating:         "4.2",
		}
		services = append(services, sleeper)
	}

	// Add local buses if available
	if hasLocalBuses {
		// Sarige (early morning)
		sarige := Service{
			ServiceName:    fmt.Sprintf("%s - %s SARIGE", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "07:15",
			ArrivalTime:    calculateArrival("07:15", maxTime),
			AvailableSeats: int(30 + (time.Now().UnixNano() % 8)),
			Fare:           fmt.Sprintf("₹%d", minFare+5),
			BusType:        "Sarige",
		}
		services = append(services, sarige)

		// Ordinary (mid-morning)
		ordinary := Service{
			ServiceName:    fmt.Sprintf("%s - %s ORDINARY", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "09:30",
			ArrivalTime:    calculateArrival("09:30", maxTime),
			AvailableSeats: int(35 + (time.Now().UnixNano() % 6)),
			Fare:           fmt.Sprintf("₹%d", minFare),
			BusType:        "Ordinary",
		}
		services = append(services, ordinary)

		// Gramantara (afternoon)
		gramantara := Service{
			ServiceName:    fmt.Sprintf("%s - %s GRAMANTARA", strings.ToUpper(from), strings.ToUpper(to)),
			DepartureTime:  "14:45",
			ArrivalTime:    calculateArrival("14:45", maxTime),
			AvailableSeats: int(28 + (time.Now().UnixNano() % 10)),
			Fare:           fmt.Sprintf("₹%d", minFare+10),
			BusType:        "Gramantara",
		}
		services = append(services, gramantara)
	}

	// Limit to the specified number of services for this route
	if len(services) > numServices {
		services = services[:numServices]
	}

	return &SearchResponse{
		Services: services,
	}
}

// calculateArrival adds minutes to a departure time and returns formatted arrival time
func calculateArrival(departure string, minutes int) string {
	// Parse departure time
	var hour, min int
	fmt.Sscanf(departure, "%d:%d", &hour, &min)

	// Add minutes
	min += minutes
	hour += min / 60
	min %= 60
	hour %= 24

	return fmt.Sprintf("%02d:%02d", hour, min)
}

// Get default bus numbers for BMTC search
func getDefaultBusNumbers() []string {
	return []string{"500D", "500C", "401K", "500M", "501D", "401M", "600"}
}

// readInput reads a line of input from the user with a prompt
func readInput(prompt string) string {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print(prompt)
	input, _ := reader.ReadString('\n')
	return strings.TrimSpace(input)
}

// formatDate formats a date string to DD-MM-YYYY format
func formatDate(input string) string {
	// If input is empty or "today", use today's date
	if input == "" || strings.ToLower(input) == "today" {
		return time.Now().Format("02-01-2006")
	}

	// If input is "tomorrow", use tomorrow's date
	if strings.ToLower(input) == "tomorrow" {
		return time.Now().AddDate(0, 0, 1).Format("02-01-2006")
	}

	// Try to parse the date
	layouts := []string{"2006-01-02", "02-01-2006", "2/1/2006", "02/01/2006"}
	for _, layout := range layouts {
		t, err := time.Parse(layout, input)
		if err == nil {
			return t.Format("02-01-2006")
		}
	}

	// If parsing fails, return the original input
	return input
}

// isLocalBus returns true for plain non-AC, non-Volvo, non-Express services
func isLocalBus(svc Service) bool {
	bad := []string{"VOLVO", "AC", "EXPRESS", "SLEEPER"}
	// if any bad keyword appears in service name or bus type, skip it
	for _, kw := range bad {
		if strings.Contains(strings.ToUpper(svc.ServiceName), kw) ||
			strings.Contains(strings.ToUpper(svc.BusType), kw) {
			return false
		}
	}
	// also skip very high fares
	fare := strings.TrimPrefix(svc.Fare, "₹")
	var f float64
	fmt.Sscanf(fare, "%f", &f)
	if f > 150 {
		return false
	}
	return true
}

// GetBMTCBusesBetweenLocations returns a list of BMTC bus numbers that pass through both locations
func GetBMTCBusesBetweenLocations(from, to string) []string {
	// Map of common routes between Bangalore locations
	commonRoutes := map[string]map[string][]string{
		"mg road": {
			"silk board":      {"500D", "V-500D", "500M", "301K"},
			"electronic city": {"500K", "V-500K", "501D"},
			"hebbal":          {"500D", "V-500D", "201C"},
			"whitefield":      {"401K", "335E", "KIAS-8"},
			"majestic":        {"294C", "KIAS-5", "KIAS-8"},
			"indiranagar":     {"201B", "505F", "301K"},
			"koramangala":     {"201G", "500D", "V-500D"},
			"btm layout":      {"500D", "501C", "301K"},
			"jp nagar":        {"500D", "501L", "304"},
		},
		"majestic": {
			"silk board":      {"500C", "500K", "600"},
			"electronic city": {"356CW", "501D", "600"},
			"hebbal":          {"500C", "500A", "G-4"},
			"whitefield":      {"401K", "303", "304"},
			"airport":         {"KIAS-5", "KIAS-8", "KIAS-4A"},
			"yeshwanthpur":    {"249", "252E", "252F"},
			"jayanagar":       {"12K", "15", "16"},
			"koramangala":     {"171", "201", "213"},
			"btm layout":      {"500D", "500C", "600"},
			"jp nagar":        {"500D", "501L", "304"},
		},
		"silk board": {
			"electronic city": {"500K", "501K", "V-500K"},
			"hebbal":          {"500D", "V-500D", "500"},
			"whitefield":      {"500M", "500", "V-500"},
			"majestic":        {"500C", "500K", "600"},
			"mg road":         {"500D", "V-500D", "301K"},
			"jayanagar":       {"500D", "V-500D", "342D"},
			"koramangala":     {"201", "500D", "V-500D"},
			"btm layout":      {"201", "500D", "V-500D"},
			"jp nagar":        {"201", "500D", "501D"},
		},
		"hebbal": {
			"silk board":      {"500D", "V-500D", "501"},
			"electronic city": {"501D", "600", "501"},
			"whitefield":      {"500M", "501", "G-4"},
			"majestic":        {"500C", "500A", "G-4"},
			"mg road":         {"500D", "V-500D", "201C"},
			"yeshwanthpur":    {"401M", "G-2", "G-3"},
			"airport":         {"KIAS-8", "KIAS-5", "401"},
		},
		"whitefield": {
			"silk board":      {"500M", "500", "V-500"},
			"electronic city": {"500M", "501", "V-500"},
			"hebbal":          {"500M", "501", "G-4"},
			"majestic":        {"401K", "303", "304"},
			"mg road":         {"401K", "335E", "KIAS-8"},
			"indiranagar":     {"401K", "500F", "ITPL-2"},
			"marathahalli":    {"500L", "ITPL-1", "ITPL-3"},
		},
		"electronic city": {
			"silk board": {"500K", "501K", "V-500K"},
			"hebbal":     {"501D", "600", "501"},
			"whitefield": {"500M", "501", "V-500"},
			"majestic":   {"356CW", "501D", "600"},
			"mg road":    {"500K", "V-500K", "501D"},
			"jayanagar":  {"500K", "501D", "356"},
			"btm layout": {"500K", "501K", "356"},
			"jp nagar":   {"500K", "501D", "356"},
		},
		"jayanagar": {
			"mg road":         {"500D", "210E", "210F"},
			"majestic":        {"500C", "15", "16"},
			"silk board":      {"500D", "V-500D", "342D"},
			"electronic city": {"500K", "501D", "356"},
			"btm layout":      {"210", "220", "221"},
			"jp nagar":        {"15A", "15C", "15D"},
		},
		"indiranagar": {
			"mg road":     {"201B", "505F", "301K"},
			"majestic":    {"201", "304", "305"},
			"whitefield":  {"401K", "500F", "ITPL-2"},
			"airport":     {"KIAS-9", "KIAS-8", "KIAS-10"},
			"koramangala": {"201G", "201", "342"},
		},
		"btm layout": {
			"silk board":      {"201", "500D", "V-500D"},
			"electronic city": {"500K", "501K", "356"},
			"mg road":         {"500D", "501C", "301K"},
			"majestic":        {"500D", "500C", "600"},
			"jayanagar":       {"210", "220", "221"},
			"jp nagar":        {"201", "210A", "G-8"},
			"koramangala":     {"201", "201G", "221C"},
		},
		"koramangala": {
			"silk board":      {"201", "500D", "V-500D"},
			"electronic city": {"500K", "501K", "356"},
			"mg road":         {"201G", "500D", "V-500D"},
			"majestic":        {"171", "201", "213"},
			"indiranagar":     {"201G", "201", "342"},
			"btm layout":      {"201", "201G", "221C"},
			"hsr layout":      {"500K", "V-500K", "171C"},
		},
		"jp nagar": {
			"mg road":         {"500D", "501L", "304"},
			"majestic":        {"500D", "501L", "304"},
			"silk board":      {"201", "500D", "501D"},
			"electronic city": {"500K", "501D", "356"},
			"jayanagar":       {"15A", "15C", "15D"},
			"btm layout":      {"201", "210A", "G-8"},
		},
		"marathahalli": {
			"whitefield":  {"500L", "ITPL-1", "ITPL-3"},
			"majestic":    {"304", "305", "306"},
			"indiranagar": {"500F", "ITPL-4", "ITPL-5"},
			"koramangala": {"500M", "V-500", "V-500K"},
		},
		"hsr layout": {
			"silk board":      {"V-500K", "V-500", "V-501"},
			"electronic city": {"V-500K", "V-501", "356"},
			"btm layout":      {"201", "221", "G-8"},
			"koramangala":     {"500K", "V-500K", "171C"},
		},
		"yeshwanthpur": {
			"majestic":    {"249", "252E", "252F"},
			"hebbal":      {"401M", "G-2", "G-3"},
			"malleswaram": {"61", "62", "252"},
			"rajajinagar": {"80", "81", "82"},
		},
		"basavanagudi": {
			"majestic":     {"15", "16", "17"},
			"jayanagar":    {"37", "38", "40"},
			"shivajinagar": {"210", "211", "212"},
			"jp nagar":     {"15A", "16A", "17A"},
		},
		"malleswaram": {
			"majestic":     {"80", "81", "82"},
			"yeshwanthpur": {"61", "62", "252"},
			"rajajinagar":  {"91", "92", "93"},
			"shivajinagar": {"94", "95", "96"},
		},
	}

	// Normalize inputs for comparison
	fromLower := strings.ToLower(from)
	toLower := strings.ToLower(to)

	var busNumbers []string

	// Check if we have direct routes between these locations
	if fromMap, exists := commonRoutes[fromLower]; exists {
		if buses, exists := fromMap[toLower]; exists {
			busNumbers = buses
		}
	}

	// If no direct routes found, check for reverse routes
	if len(busNumbers) == 0 {
		if toMap, exists := commonRoutes[toLower]; exists {
			if buses, exists := toMap[fromLower]; exists {
				busNumbers = buses
			}
		}
	}

	// If still no routes found, return a few common buses as fallback
	if len(busNumbers) == 0 {
		busNumbers = []string{"500D", "500C", "500K"}
	}

	return busNumbers
}

func main() {
	fmt.Println("\n╔════════════════════════════════════════════╗")
	fmt.Println("║        🚌 Bus Information System 🚌        ║")
	fmt.Println("╚════════════════════════════════════════════╝")

	// Get user input for start and end locations
	from := readInput("Enter your starting location: ")
	if from == "" {
		fmt.Println("⚠️ Starting location cannot be empty")
		return
	}

	to := readInput("Enter your destination: ")
	if to == "" {
		fmt.Println("⚠️ Destination cannot be empty")
		return
	}

	// Normalize locations for case-insensitive comparison
	normalizedFrom := strings.ToLower(from)
	normalizedTo := strings.ToLower(to)

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

	// Check if both locations are within Bangalore (BMTC service area)
	if bangaloreLocations[normalizedFrom] && bangaloreLocations[normalizedTo] {
		// Use BMTC service
		fmt.Printf("\nSearching for BMTC buses from \"%s\" to \"%s\"...\n\n", from, to)

		// Get BMTC buses between locations
		busNumbers := GetBMTCBusesBetweenLocations(from, to)

		if len(busNumbers) == 0 {
			fmt.Printf("\n❌ No direct buses found from \"%s\" to \"%s\".\n\n", from, to)
			fmt.Println("You might need to use multiple buses or try these popular routes:")
			fmt.Println("• MG Road to Silk Board: 500D, V-500D")
			fmt.Println("• Majestic to Whitefield: 401K")
			fmt.Println("• Hebbal to Electronic City: 501D")
			fmt.Println("• Indiranagar to Airport: KIAS-9")
		} else {
			// Show found buses
			fmt.Printf("\n🚌 Found %d buses from \"%s\" to \"%s\":\n\n", len(busNumbers), from, to)

			for _, busNumber := range busNumbers {
				// Get route details
				route := MockBMTCBusRouteWithUserInput(busNumber, from, to)

				fmt.Printf("🔢 Bus Number: %s\n", busNumber)
				fmt.Printf("📍 From: %s\n", route.From)
				fmt.Printf("🏁 To: %s\n", route.To)

				// Show some key stops on the route
				fmt.Println("🛑 Key stops:")
				maxStops := 5
				if len(route.Stops) < maxStops {
					maxStops = len(route.Stops)
				}

				for i := 0; i < maxStops; i++ {
					fmt.Printf("   • %s\n", route.Stops[i])
				}
				if len(route.Stops) > maxStops {
					fmt.Printf("   • ... and %d more stops\n", len(route.Stops)-maxStops)
				}

				fmt.Println("─────────────────────────────────────")
			}
		}
	} else {
		// Use KSRTC service for intercity travel
		fmt.Printf("\nSearching for KSRTC buses from \"%s\" to \"%s\"...\n", from, to)

		// Ask for date if using KSRTC
		dateInput := readInput("Enter travel date (DD-MM-YYYY, default: today): ")
		date := formatDate(dateInput)

		// Format the date nicely for display
		displayDate := date
		parsedDate, err := time.Parse("02-01-2006", date)
		if err == nil {
			displayDate = parsedDate.Format("Monday, 02 Jan 2006")
		}

		fmt.Printf("\nSearching for buses from %s to %s on %s\n", from, to, displayDate)

		client := NewClient()

		// Try to get real data
		results, err := client.GetAvailableServices(from, to, date)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			fmt.Println("\nUsing mock data instead...")
			results = client.MockGetAvailableServices(from, to, date)
		}

		if len(results.Services) == 0 {
			fmt.Println("No services found")
			return
		}

		// Show all available services
		fmt.Printf("\nFound %d services\n\n", len(results.Services))

		// Group buses by type for better organization
		luxuryBuses := []Service{}
		expressBuses := []Service{}
		localBuses := []Service{}

		// Categorize buses
		for _, svc := range results.Services {
			if isLocalBus(svc) {
				localBuses = append(localBuses, svc)
			} else if strings.Contains(strings.ToUpper(svc.ServiceName), "EXPRESS") ||
				strings.Contains(strings.ToUpper(svc.BusType), "EXPRESS") {
				expressBuses = append(expressBuses, svc)
			} else {
				luxuryBuses = append(luxuryBuses, svc)
			}
		}

		// Display buses by category
		if len(luxuryBuses) > 0 {
			fmt.Println("🌟 LUXURY BUSES (AC/VOLVO/SLEEPER) 🌟")
			fmt.Println("─────────────────────────────────────")
			for i, service := range luxuryBuses {
				fmt.Printf("🔢 Service #%d\n", i+1)
				fmt.Println("🚌", service.ServiceName)
				fmt.Println("⏰ Departure:", service.DepartureTime)
				fmt.Println("🎯 Arrival:", service.ArrivalTime)
				fmt.Println("🪑 Seats Available:", service.AvailableSeats)
				fmt.Println("💰 Fare:", service.Fare)
				fmt.Println("🚍 Bus Type:", service.BusType)
				if service.Rating != "" {
					fmt.Println("⭐ Rating:", service.Rating)
				}
				fmt.Println("─────────────────────────────────────")
			}
		}

		if len(expressBuses) > 0 {
			fmt.Println("\n🚀 EXPRESS BUSES 🚀")
			fmt.Println("─────────────────────────────────────")
			for i, service := range expressBuses {
				fmt.Printf("🔢 Service #%d\n", i+1)
				fmt.Println("🚌", service.ServiceName)
				fmt.Println("⏰ Departure:", service.DepartureTime)
				fmt.Println("🎯 Arrival:", service.ArrivalTime)
				fmt.Println("🪑 Seats Available:", service.AvailableSeats)
				fmt.Println("💰 Fare:", service.Fare)
				fmt.Println("🚍 Bus Type:", service.BusType)
				if service.Rating != "" {
					fmt.Println("⭐ Rating:", service.Rating)
				}
				fmt.Println("─────────────────────────────────────")
			}
		}

		if len(localBuses) > 0 {
			fmt.Println("\n🚶 LOCAL BUSES (ORDINARY/SARIGE) 🚶")
			fmt.Println("─────────────────────────────────────")
			for i, service := range localBuses {
				fmt.Printf("🔢 Service #%d\n", i+1)
				fmt.Println("🚌", service.ServiceName)
				fmt.Println("⏰ Departure:", service.DepartureTime)
				fmt.Println("🎯 Arrival:", service.ArrivalTime)
				fmt.Println("🪑 Seats Available:", service.AvailableSeats)
				fmt.Println("💰 Fare:", service.Fare)
				fmt.Println("🚍 Bus Type:", service.BusType)
				if service.Rating != "" {
					fmt.Println("⭐ Rating:", service.Rating)
				}
				fmt.Println("─────────────────────────────────────")
			}
		}
	}

	fmt.Println("\n✅ Search completed successfully!")
}
