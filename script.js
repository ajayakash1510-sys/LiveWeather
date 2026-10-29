/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SkyCast Weather App (script.js)
 * Powered by Open-Meteo (Free weather & geocoding APIs, no key required)
 * 
 * Features:
 * 1. Geocoding API: City or neighborhood search -> Latitude & Longitude
 * 2. Forecast API: Live current weather & 3-day forecast
 * 3. In & Around Chennai Hub: Real-time temperature & updates for 18 areas across Greater Chennai
 * 4. Microclimate zone filters: Central/Coast, IT Corridor/South, Industrial/West, Nearby Towns
 * 5. Friendly error handling, loading states, Enter-key support & WMO emoji decoding
 */

// ============================================================================
// 1. DOM Element References
// ============================================================================
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');

const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

const weatherResults = document.getElementById('weather-results');
const cityNameEl = document.getElementById('city-name');
const cityDetailsEl = document.getElementById('city-details');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weather-desc');
const windSpeedEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const coordsEl = document.getElementById('coords');
const forecastContainer = document.getElementById('forecast-container');

// Chennai Region Elements
const chennaiPlacesGrid = document.getElementById('chennai-places-grid');
const chennaiPlacesLoading = document.getElementById('chennai-places-loading');
const refreshChennaiBtn = document.getElementById('refresh-chennai-btn');
const zoneTabs = document.querySelectorAll('.zone-tab');

// Educational guide toggle elements
const toggleGuideBtn = document.getElementById('toggle-guide-btn');
const guideContent = document.getElementById('guide-content');
const guideArrow = document.getElementById('guide-arrow');

// Quick city buttons
const chipButtons = document.querySelectorAll('.chip-btn');


// ============================================================================
// 2. Curated Locations In and Around Chennai
// Covers Central, IT Corridor (OMR), Suburbs, Industrial Hubs & Satellite Towns
// ============================================================================
const CHENNAI_PLACES = [
  // Central & Coastal Hubs
  { id: 'central', name: 'Chennai Central', admin: 'Chennai', zone: 'central', tag: 'Central / Railway', lat: 13.0827, lon: 80.2707 },
  { id: 'marina', name: 'Marina Beach & Mylapore', admin: 'Chennai', zone: 'central', tag: 'Coast & Culture', lat: 13.0336, lon: 80.2677 },
  { id: 'tnagar', name: 'T. Nagar', admin: 'Chennai', zone: 'central', tag: 'Shopping & Commercial', lat: 13.0418, lon: 80.2341 },
  { id: 'adyar', name: 'Adyar & Besant Nagar', admin: 'Chennai', zone: 'central', tag: 'Coastal Breeze', lat: 13.0012, lon: 80.2565 },
  { id: 'annanagar', name: 'Anna Nagar', admin: 'Chennai', zone: 'central', tag: 'North-Central Hub', lat: 13.0850, lon: 80.2101 },

  // IT Corridor (OMR) & South Suburbs
  { id: 'velachery', name: 'Velachery', admin: 'Chennai', zone: 'south', tag: 'Residential & Tech', lat: 12.9759, lon: 80.2212 },
  { id: 'omr', name: 'OMR / Sholinganallur', admin: 'Chennai', zone: 'south', tag: 'IT Expressway', lat: 12.9010, lon: 80.2279 },
  { id: 'siruseri', name: 'Siruseri SIPCOT', admin: 'Chengalpattu', zone: 'south', tag: 'IT Tech Park', lat: 12.8250, lon: 80.2167 },
  { id: 'tambaram', name: 'Tambaram', admin: 'Chengalpattu', zone: 'south', tag: 'Southern Gateway', lat: 12.9249, lon: 80.1299 },
  { id: 'airport', name: 'Pallavaram (Airport)', admin: 'Chennai', zone: 'south', tag: 'Aviation Zone', lat: 12.9675, lon: 80.1491 },

  // Industrial & West Chennai
  { id: 'porur', name: 'Porur', admin: 'Chennai', zone: 'west', tag: 'Tech & Medical', lat: 13.0382, lon: 80.1565 },
  { id: 'ambattur', name: 'Ambattur', admin: 'Chennai', zone: 'west', tag: 'Industrial Estate', lat: 13.1143, lon: 80.1548 },
  { id: 'avadi', name: 'Avadi', admin: 'Tiruvallur', zone: 'west', tag: 'Defense & Rail', lat: 13.1147, lon: 80.1009 },
  { id: 'sriperumbudur', name: 'Sriperumbudur', admin: 'Kanchipuram', zone: 'west', tag: 'Automotive Hub', lat: 12.9733, lon: 79.9422 },

  // Outskirts & Nearby Towns
  { id: 'mahabalipuram', name: 'Mahabalipuram', admin: 'Chengalpattu', zone: 'nearby', tag: 'ECR Coast / Heritage', lat: 12.6269, lon: 80.1927 },
  { id: 'kanchipuram', name: 'Kanchipuram', admin: 'Kanchipuram', zone: 'nearby', tag: 'Silk & Temple City', lat: 12.8342, lon: 79.7036 },
  { id: 'chengalpattu', name: 'Chengalpattu', admin: 'Chengalpattu', zone: 'nearby', tag: 'South Satellite Town', lat: 12.6819, lon: 79.9888 },
  { id: 'ennore', name: 'Ennore Port', admin: 'Tiruvallur', zone: 'nearby', tag: 'North Marine Port', lat: 13.2000, lon: 80.3200 }
];

let activeZoneFilter = 'all';
let currentActivePlaceId = 'central';


// ============================================================================
// 3. WMO Weather Code Interpreter
// Converts numerical WMO codes (0-99) into human-readable descriptions & emojis
// ============================================================================
function getWeatherInterpretation(code) {
  switch (code) {
    case 0:
      return { emoji: '☀️', desc: 'Clear sky' };
    case 1:
      return { emoji: '🌤️', desc: 'Mainly clear' };
    case 2:
      return { emoji: '⛅', desc: 'Partly cloudy' };
    case 3:
      return { emoji: '☁️', desc: 'Overcast' };
    case 45:
    case 48:
      return { emoji: '🌫️', desc: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { emoji: '🌦️', desc: 'Drizzle' };
    case 56:
    case 57:
      return { emoji: '🌧️', desc: 'Freezing drizzle' };
    case 61:
    case 63:
    case 65:
      return { emoji: '🌧️', desc: 'Rain' };
    case 66:
    case 67:
      return { emoji: '🌨️', desc: 'Freezing rain' };
    case 71:
    case 73:
    case 75:
      return { emoji: '❄️', desc: 'Snow fall' };
    case 77:
      return { emoji: '❄️', desc: 'Snow grains' };
    case 80:
    case 81:
    case 82:
      return { emoji: '🌦️', desc: 'Rain showers' };
    case 85:
    case 86:
      return { emoji: '🌨️', desc: 'Snow showers' };
    case 95:
      return { emoji: '⛈️', desc: 'Thunderstorm' };
    case 96:
    case 99:
      return { emoji: '⛈️', desc: 'Thunderstorm with hail' };
    default:
      return { emoji: '🌤️', desc: 'Fair weather' };
  }
}


// ============================================================================
// 4. Date & Day Formatting Helpers
// ============================================================================
function formatDayName(dateString, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDateMonth(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


// ============================================================================
// 5. UI State Management (Loading, Error, Active Highlight)
// ============================================================================
function showLoading() {
  loadingSpinner.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  weatherResults.style.opacity = '0.65';
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
  weatherResults.style.opacity = '1';
}

function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove('hidden');
  hideLoading();
}

function hideError() {
  errorMessage.classList.add('hidden');
}


// ============================================================================
// 6. Primary Weather Fetch Logic (City Name OR Exact Coordinates)
// ============================================================================

// Fetch via city name input using Geocoding API
async function getWeatherForCity(cityName) {
  const cleanCity = cityName.trim();

  if (!cleanCity) {
    showError('Please type a city name or area in the search box.');
    return;
  }

  // Check if user typed a known Chennai locality name directly
  const localMatch = CHENNAI_PLACES.find(p => 
    p.name.toLowerCase().includes(cleanCity.toLowerCase()) || 
    cleanCity.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
  );

  if (localMatch) {
    await fetchAndDisplayCoordinates(
      localMatch.name,
      `${localMatch.admin}, Tamil Nadu`,
      'India',
      localMatch.lat,
      localMatch.lon
    );
    currentActivePlaceId = localMatch.id;
    updatePlaceCardsHighlight();
    return;
  }

  showLoading();
  hideError();

  try {
    // Step 1: Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding server responded with status: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      showError(`Location "${cleanCity}" not found. Try searching a major city or Chennai area (e.g. Velachery, Tambaram).`);
      return;
    }

    const location = geoData.results[0];
    const { name, latitude, longitude, country, admin1 } = location;

    // Step 2: Fetch weather for coordinates
    await fetchAndDisplayCoordinates(name, admin1, country, latitude, longitude);
  } catch (error) {
    console.error('Fetch error:', error);
    if (!navigator.onLine) {
      showError('No internet connection. Please check your network and try again.');
    } else {
      showError('Unable to connect to weather service. Please check your connection and try again.');
    }
  }
}

// Fetch weather for exact coordinates (used by Chennai area cards and geocoder)
async function fetchAndDisplayCoordinates(name, admin1, country, latitude, longitude) {
  showLoading();
  hideError();

  try {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;

    const weatherResponse = await fetch(forecastUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Weather server error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Render primary glass card and 3-day forecast
    renderCurrentWeather(name, admin1, country, latitude, longitude, weatherData.current);
    renderForecast(weatherData.daily);

    hideLoading();
  } catch (err) {
    console.error('Forecast error:', err);
    showError('Failed to fetch weather forecast. Please try again.');
  }
}


// ============================================================================
// 7. Render Functions for Main Weather Card & 3-Day Forecast
// ============================================================================
function renderCurrentWeather(name, admin1, country, lat, lon, current) {
  cityNameEl.textContent = name;

  const detailsParts = [admin1, country].filter(Boolean);
  cityDetailsEl.textContent = detailsParts.join(', ') || 'Live Location';

  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;

  const weatherInfo = getWeatherInterpretation(current.weather_code);
  weatherIconEl.textContent = weatherInfo.emoji;
  weatherDescEl.textContent = weatherInfo.desc;

  windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  coordsEl.textContent = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

function renderForecast(daily) {
  forecastContainer.innerHTML = '';
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = daily;

  for (let i = 0; i < time.length; i++) {
    const dayName = formatDayName(time[i], i);
    const dateFormatted = formatDateMonth(time[i]);
    const maxTemp = Math.round(temperature_2m_max[i]);
    const minTemp = Math.round(temperature_2m_min[i]);
    const weatherInfo = getWeatherInterpretation(weather_code[i]);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-date">${dateFormatted}</span>
      <span class="forecast-icon" aria-label="${weatherInfo.desc}">${weatherInfo.emoji}</span>
      <div class="forecast-temps">
        <span class="temp-max">${maxTemp}°</span>
        <span class="temp-min">${minTemp}°</span>
      </div>
      <span class="forecast-desc">${weatherInfo.desc}</span>
    `;

    forecastContainer.appendChild(card);
  }
}


// ============================================================================
// 8. In & Around Chennai Live Hub Logic
// Fetches live microclimate temperatures for all 18 Chennai locations in 1 batch
// ============================================================================
async function loadChennaiRegionsWeather() {
  chennaiPlacesLoading.classList.remove('hidden');
  chennaiPlacesGrid.innerHTML = '';

  try {
    // Open-Meteo allows comma-separated latitudes and longitudes for batch query
    const lats = CHENNAI_PLACES.map(p => p.lat).join(',');
    const lons = CHENNAI_PLACES.map(p => p.lon).join(',');

    const batchUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

    const response = await fetch(batchUrl);
    if (!response.ok) throw new Error('Batch weather fetch failed');

    const data = await response.json();
    
    // Open-Meteo returns an array when querying multiple coordinates
    const weatherList = Array.isArray(data) ? data : [data];

    // Attach current weather data to our CHENNAI_PLACES array
    CHENNAI_PLACES.forEach((place, idx) => {
      if (weatherList[idx] && weatherList[idx].current) {
        place.current = weatherList[idx].current;
      }
    });

    chennaiPlacesLoading.classList.add('hidden');
    renderChennaiPlaceCards();
  } catch (err) {
    console.error('Error fetching Chennai neighborhood weather:', err);
    chennaiPlacesLoading.innerHTML = `<span>⚠️ Could not load Chennai microclimates. Click Refresh to retry.</span>`;
  }
}

// Render place cards according to selected zone filter
function renderChennaiPlaceCards() {
  chennaiPlacesGrid.innerHTML = '';

  const filteredPlaces = activeZoneFilter === 'all' 
    ? CHENNAI_PLACES 
    : CHENNAI_PLACES.filter(p => p.zone === activeZoneFilter);

  filteredPlaces.forEach(place => {
    const card = document.createElement('article');
    card.className = `place-card ${place.id === currentActivePlaceId ? 'active-place' : ''}`;
    card.setAttribute('data-id', place.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    let weatherMarkup = '';
    if (place.current) {
      const info = getWeatherInterpretation(place.current.weather_code);
      const temp = Math.round(place.current.temperature_2m);
      weatherMarkup = `
        <div class="place-card-top">
          <span class="place-name">${place.name}</span>
          <span class="place-tag">${place.tag}</span>
        </div>
        <div class="place-card-middle">
          <div class="place-temp-group">
            <span class="place-temp">${temp}°C</span>
          </div>
          <span class="place-icon" aria-label="${info.desc}">${info.emoji}</span>
        </div>
        <div class="place-card-bottom">
          <span class="place-desc">${info.desc}</span>
          <span class="place-wind">💨 ${place.current.wind_speed_10m} km/h</span>
        </div>
        <span class="place-cta">Tap for 3-Day Forecast ➔</span>
      `;
    } else {
      weatherMarkup = `
        <div class="place-card-top">
          <span class="place-name">${place.name}</span>
          <span class="place-tag">${place.tag}</span>
        </div>
        <div class="place-card-middle">
          <span class="place-temp">--°C</span>
        </div>
      `;
    }

    card.innerHTML = weatherMarkup;

    // Click handler to load this place in the main card + 3-day forecast
    card.addEventListener('click', () => {
      selectChennaiPlace(place);
    });

    // Keyboard accessibility for Enter / Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectChennaiPlace(place);
      }
    });

    chennaiPlacesGrid.appendChild(card);
  });
}

// Select a place in Chennai: updates main card, input, and smoothly scrolls to view
function selectChennaiPlace(place) {
  currentActivePlaceId = place.id;
  cityInput.value = place.name;
  
  fetchAndDisplayCoordinates(
    place.name,
    `${place.admin}, Tamil Nadu`,
    'India',
    place.lat,
    place.lon
  );

  updatePlaceCardsHighlight();

  // Smooth scroll back to top weather card
  const weatherCard = document.getElementById('weather-card');
  if (weatherCard) {
    weatherCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Update the glowing border on the selected place card
function updatePlaceCardsHighlight() {
  const cards = document.querySelectorAll('.place-card');
  cards.forEach(card => {
    if (card.getAttribute('data-id') === currentActivePlaceId) {
      card.classList.add('active-place');
    } else {
      card.classList.remove('active-place');
    }
  });
}


// ============================================================================
// 9. Event Listeners
// ============================================================================

// Search form submit
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  getWeatherForCity(cityInput.value);
});

// Enter key in input
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    getWeatherForCity(cityInput.value);
  }
});

// Quick chips (Chennai, T. Nagar, Velachery, Tambaram, Mahabalipuram)
chipButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const city = btn.getAttribute('data-city');
    cityInput.value = city;
    getWeatherForCity(city);
  });
});

// Zone filter tabs (All, Central, IT Corridor, Industrial, Nearby)
zoneTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    zoneTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeZoneFilter = tab.getAttribute('data-zone');
    renderChennaiPlaceCards();
  });
});

// Refresh Chennai places live data button
refreshChennaiBtn.addEventListener('click', async () => {
  const icon = refreshChennaiBtn.querySelector('.refresh-icon');
  if (icon) icon.style.animation = 'spin 0.8s linear infinite';
  await loadChennaiRegionsWeather();
  if (icon) icon.style.animation = 'none';
});

// Toggle educational guide
toggleGuideBtn.addEventListener('click', () => {
  const isOpen = guideContent.classList.toggle('open');
  guideArrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
});


// ============================================================================
// 10. Initial App Bootstrap
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Pre-fill input with Chennai and load live data
  cityInput.value = 'Chennai';
  getWeatherForCity('Chennai');

  // Load all 18 Chennai neighborhood and suburban live temperatures
  loadChennaiRegionsWeather();
});
