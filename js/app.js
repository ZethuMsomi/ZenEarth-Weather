async function fetchWeatherByCoordinates(latitude, longitude, locationName) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Update current weather
        const temp = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = data.current.wind_speed_10m;
        
        document.querySelector('.location-info h1').textContent = locationName;
        document.querySelector('.temperature-display').textContent = `${temp}°C`;
        document.querySelector('.condition-display').textContent = "Live Atmosphere";
        document.querySelector('.humidity-display').textContent = `${humidity}%`;
        document.querySelector('.wind-display').textContent = `${windSpeed} km/h`;

        // Update hourly forecast
        const hourItems = document.querySelectorAll('.hour-item');
        const currentHourIndex = new Date().getHours();
        
        hourItems.forEach((item, index) => {
            const forecastTemp = Math.round(data.hourly.temperature_2m[currentHourIndex + index]);
            const tempStrong = item.querySelector('strong');
            if (tempStrong && !isNaN(forecastTemp)) {
                tempStrong.textContent = `${forecastTemp}°`;
            }
        });

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        document.querySelector('.condition-display').textContent = "Fetch Error";
    }
}

// Search location using Open-Meteo Geocoding API
async function searchLocation(query) {
    if (!query.trim()) return;
    
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`;
    
    try {
        document.querySelector('.condition-display').textContent = "Searching...";
        const response = await fetch(geoUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const lat = result.latitude;
            const lon = result.longitude;
            const name = `${result.name}, ${result.country || ''}`;
            
            fetchWeatherByCoordinates(lat, lon, name);
        } else {
            document.querySelector('.condition-display').textContent = "Location not found";
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        document.querySelector('.condition-display').textContent = "Search error";
    }
}

// Add event listener to the search input for the 'Enter' key
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchLocation(searchInput.value);
            searchInput.value = ''; // Clear input after searching
        }
    });
}

// Default load on startup: Sandton, Johannesburg
fetchWeatherByCoordinates(-26.1076, 28.0567, "Sandton, Johannesburg");