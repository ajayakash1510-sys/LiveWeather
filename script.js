/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SkyCast Weather App (script.js)
 * Powered by Open-Meteo (Free weather & geocoding APIs, no key required)
 * 
 * Step 1: Geocoding API -> Convert city name to latitude & longitude
 * Step 2: Forecast API -> Fetch current weather & 3-day daily forecast
 * Step 3: DOM Updates -> Render temperature, emoji, wind speed, & forecast
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

// Educational guide toggle elements
const toggleGuideBtn = document.getElementById('toggle-guide-btn');
const guideContent = document.getElementById('guide-content');
const guideArrow = document.getElementById('guide-arrow');

// Quick city buttons
const chipButtons = document.querySelectorAll('.chip-btn');


// ============================================================================
// 2. WMO Weather Code Interpreter
// Converts numerical WMO codes (0-99) into human-readable descriptions & emojis
// ============================================================================
function getWeatherInterpretation(code) {
  // WMO Code Table reference from Open-Meteo documentation
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
// 3. Helper: Format Date & Day Name
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
// 4. UI State Handlers (Loading, Errors, Results)
// ============================================================================
function showLoading() {
  loadingSpinner.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  weatherResults.style.opacity = '0.5';
  weatherResults.style.pointerEvents = 'none';
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
  weatherResults.style.opacity = '1';
  weatherResults.style.pointerEvents = 'auto';
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
// 5. Core Weather Fetch Logic using async/await
// ============================================================================
async function getWeatherForCity(cityName) {
  const cleanCity = cityName.trim();

  // Validate empty input
  if (!cleanCity) {
    showError('Please type a city name in the search box.');
    return;
  }

  showLoading();
  hideError();

  try {
    // ------------------------------------------------------------------------
    // STEP 1: Geocoding API Call
    // Convert the plain-text city name (e.g. "Chennai") to latitude & longitude
    // ------------------------------------------------------------------------
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=en&format=json`;
    
    const geoResponse = await fetch(geoUrl);
    
    // Check for HTTP errors
    if (!geoResponse.ok) {
      throw new Error(`Geocoding server responded with status: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    // Check if the city was found
    if (!geoData.results || geoData.results.length === 0) {
      showError(`City "${cleanCity}" not found. Please verify spelling (e.g., Chennai, London).`);
      return;
    }

    // Extract location info
    const location = geoData.results[0];
    const { name, latitude, longitude, country, admin1 } = location;

    // ------------------------------------------------------------------------
    // STEP 2: Forecast API Call
    // Fetch live current weather + 3-day daily forecast for the coordinates
    // ------------------------------------------------------------------------
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`;

    const weatherResponse = await fetch(forecastUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Weather server responded with status: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // ------------------------------------------------------------------------
    // STEP 3: Render Current Weather & 3-Day Forecast to DOM
    // ------------------------------------------------------------------------
    renderCurrentWeather(name, admin1, country, latitude, longitude, weatherData.current);
    renderForecast(weatherData.daily);

    hideLoading();
  } catch (error) {
    console.error('Fetch error:', error);
    // Friendly error message for offline or network issues
    if (!navigator.onLine) {
      showError('No internet connection. Please check your network and try again.');
    } else {
      showError('Unable to connect to weather service. Please check your connection and try again.');
    }
  }
}


// ============================================================================
// 6. Render Functions
// ============================================================================

// Render the main glass weather card
function renderCurrentWeather(name, admin1, country, lat, lon, current) {
  cityNameEl.textContent = name;
  
  // Format regional details (e.g. "Tamil Nadu, India")
  const detailsParts = [admin1, country].filter(Boolean);
  cityDetailsEl.textContent = detailsParts.join(', ') || 'Live Location';

  // Format temperature
  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;

  // Get matching emoji and description for WMO code
  const weatherInfo = getWeatherInterpretation(current.weather_code);
  weatherIconEl.textContent = weatherInfo.emoji;
  weatherDescEl.textContent = weatherInfo.desc;

  // Extra meteorological details
  windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  coordsEl.textContent = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

// Render the 3-day forecast cards
function renderForecast(daily) {
  // Clear previous cards
  forecastContainer.innerHTML = '';

  const { time, weather_code, temperature_2m_max, temperature_2m_min } = daily;

  // Loop through the 3 days provided by Open-Meteo
  for (let i = 0; i < time.length; i++) {
    const dayName = formatDayName(time[i], i);
    const dateFormatted = formatDateMonth(time[i]);
    const maxTemp = Math.round(temperature_2m_max[i]);
    const minTemp = Math.round(temperature_2m_min[i]);
    const weatherInfo = getWeatherInterpretation(weather_code[i]);

    // Build the forecast card HTML element
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
// 7. Event Listeners (Button clicks, Enter key, Quick chips, Guide toggle)
// ============================================================================

// Form submission handler (triggers on click or Enter key inside the form)
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  getWeatherForCity(cityInput.value);
});

// Explicit Enter key handler on input
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    getWeatherForCity(cityInput.value);
  }
});

// Quick city chips (Chennai, London, Tokyo, New York)
chipButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const city = btn.getAttribute('data-city');
    cityInput.value = city;
    getWeatherForCity(city);
  });
});

// Toggle educational guide
toggleGuideBtn.addEventListener('click', () => {
  const isOpen = guideContent.classList.toggle('open');
  guideArrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
});


// ============================================================================
// 8. Initial App Bootstrap
// Automatically load Chennai's live weather on first page load
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Pre-fill input with Chennai and load live data
  cityInput.value = 'Chennai';
  getWeatherForCity('Chennai');
});
