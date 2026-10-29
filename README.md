# 🌤️ SkyCast Weather App

A lightweight, modern, and beginner-friendly weather web application powered by the free [Open-Meteo API](https://open-meteo.com/) (no API key required). Features real-time weather retrieval, 3-day forecasting, dynamic weather emoji mapping, robust error handling, and an interactive glassmorphic UI.

---

## 📖 Description

SkyCast demonstrates how web browsers communicate with external REST APIs using modern vanilla JavaScript (`fetch` with `async/await`), semantic HTML5, and responsive CSS3. It resolves human-entered city names into geographic coordinates using Open-Meteo's Geocoding API, then requests live meteorological measurements and a multi-day forecast.

---

## ✨ Features

- **Free Weather Data (No API Key):** Built on the Open-Meteo API, requiring zero registration or API keys.
- **2-Step API Flow:**
  1. **Geocoding API:** Translates city names (e.g. *"Chennai"*, *"London"*) into geographical coordinates (`latitude` & `longitude`).
  2. **Forecast API:** Fetches current temperature, weather code, wind speed, relative humidity, and daily min/max forecasts.
- **Glassmorphic UI:** Modern sky-blue gradient backdrop with frosted glass card effects (`backdrop-filter`).
- **Dynamic Weather Emojis & Descriptions:** Translates official WMO (World Meteorological Organization) weather codes into friendly emojis (☀️, ⛅, 🌧️, ⛈️, ❄️) and readable text descriptions.
- **3-Day Forecast Section:** Displays day name (*Today*, *Tomorrow*, weekday), weather icon, and daily maximum and minimum temperatures.
- **User-Friendly Experience:**
  - "Loading..." spinner while fetching.
  - Friendly error messages for misspelt cities, blank input, or offline state.
  - Pressing **Enter** key or clicking **Get Weather** triggers the search.
  - One-click quick chips for popular cities (Chennai, London, Tokyo, New York).
  - Pre-loads Chennai's live weather automatically on startup.
- **Fully Mobile Responsive:** Adapts seamlessly between smartphones, tablets, and wide monitors.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup (`<main>`, `<header>`, `<article>`, `<section>`, `<form>`).
- **CSS3:** Custom properties, flexbox, CSS grid, glassmorphism (`backdrop-filter`), animations, and media queries.
- **Vanilla JavaScript (ES6+):** Async/await `fetch()`, DOM manipulation, WMO code parser, event handling.
- **No external heavy libraries or frameworks required!**

---

## 🌐 APIs Used

Both APIs are free and require no authentication or API keys:

1. **Open-Meteo Geocoding API:**
   ```http
   GET https://geocoding-api.open-meteo.com/v1/search?name={CITY_NAME}&count=1&language=en&format=json
   ```
2. **Open-Meteo Forecast API (e.g. for Chennai):**
   ```http
   GET https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3
   ```

---

## 🧪 Test Cases

Use these test cases to verify the application's functionality and resilience:

| # | Test Case Scenario | Input / Action | Expected Result |
|---|--------------------|----------------|-----------------|
| 1 | **Valid City (Default)** | Load page or type `Chennai` and press Enter | Displays *"Chennai"*, *"Tamil Nadu, India"*, live temperature in °C, weather emoji (e.g., ☀️/⛅), wind speed, humidity, coordinates, and 3-day forecast cards. |
| 2 | **Valid International City** | Type `Tokyo` or `Paris` and click *Get Weather* | Successfully resolves city name, updates card with local temperature and 3-day forecast. |
| 3 | **Quick-Select Chips** | Click the `London 🇬🇧` chip | Populates search input with "London" and immediately loads London's live weather. |
| 4 | **Misspelt / Non-existent City** | Type `Xyzqwerty123` and click *Get Weather* | Shows a friendly error banner: *"City 'Xyzqwerty123' not found. Please verify spelling."* |
| 5 | **Empty / Whitespace Input** | Leave input blank (or type spaces) and press Enter | Shows friendly alert: *"Please type a city name in the search box."* |
| 6 | **Keyboard Navigation** | Type `Berlin` and hit the **Enter** key | Form triggers search seamlessly without needing mouse click on the button. |
| 7 | **Network / Offline Disconnection** | Turn on Airplane Mode or toggle browser DevTools Network to *Offline*, then search | Displays friendly error banner: *"No internet connection. Please check your network and try again."* |
| 8 | **Loading State** | Search for any city on slow connection | Shows spinner and message: *"Fetching live weather data..."* with results dimmed until data arrives. |

---

## 🚀 How to Run Locally

### Option A: Open directly in your browser
Because this is pure HTML, CSS, and JavaScript:
1. Download or clone this repository.
2. Double click `index.html` or right-click -> **Open with Google Chrome / Firefox / Safari / Edge**.

### Option B: Using VS Code Live Server
1. Open the project folder in [Visual Studio Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and choose **"Open with Live Server"**.
4. The app will launch at `http://127.0.0.1:5500/index.html`.

### Option C: Using Node.js / npx
```bash
# Using Python built-in server
python3 -m http.server 3000

# OR using Node.js npx serve
npx serve .
```
Open `http://localhost:3000` in your browser.

---

## 🚢 Steps to Publish on GitHub Pages (Free Hosting)

Publishing your weather app live on the internet takes under 2 minutes:

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** icon in the top right and select **New repository**.
3. Name your repository (e.g., `skycast-weather-app`).
4. Keep it **Public** and leave "Add a README" unchecked (since you already have one).
5. Click **Create repository**.

### Step 2: Push Your Code
In your project folder on your computer terminal:
```bash
# 1. Initialize git
git init

# 2. Stage all files (index.html, style.css, script.js, README.md)
git add .

# 3. Commit your code
git commit -m "Initial commit of SkyCast Weather App"

# 4. Rename main branch
git branch -M main

# 5. Link to your remote GitHub repo (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/skycast-weather-app.git

# 6. Push code to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages in Settings
1. On your GitHub repository page, click the **Settings** tab (gear icon).
2. On the left sidebar under the "Code and automation" section, click **Pages**.
3. Under **Build and deployment**:
   - **Source:** Select `Deploy from a branch`.
   - **Branch:** Select `main` from the dropdown, and set the folder to `/ (root)`.
4. Click **Save**.

### Step 4: Access Your Live Website
- Wait about 30 to 60 seconds.
- Refresh the **Pages** settings tab.
- You will see a banner at the top:
  > **"Your site is live at `https://YOUR_USERNAME.github.io/skycast-weather-app/`"**
- Click the link to view your live weather app! You can share this link with anyone or include it in your portfolio.

---

## 📜 License & Acknowledgements

- Weather data provided by [Open-Meteo](https://open-meteo.com/) under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.
- Free for non-commercial and commercial use without API keys.
