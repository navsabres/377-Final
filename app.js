// DOM Elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherCard = document.getElementById('weather-card');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const unitToggle = document.getElementById('unit-toggle');
const weatherChart = document.getElementById('weather-chart');

// Global variables
let currentUnits = 'celsius';
let currentTheme = 'light';
const userId = generateUserId();
let weatherChartInstance = null;
let weatherHistoryData = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadUserPreferences();
  fetchWeatherHistory();
  initializeChart();
});

// Generate a random user ID for demo purposes
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// Initialize Chart.js
function initializeChart() {
  const ctx = weatherChart.getContext('2d');
  weatherChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Temperature (°C)',
        data: [],
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'City'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}°C`;
            }
          }
        }
      }
    }
  });
}

// Update chart with weather history data
function updateChart(historyData) {
  if (!weatherChartInstance || historyData.length === 0) return;
  
  // Get the last 5 entries (or fewer if there are less than 5)
  const dataToShow = historyData.slice(0, 5).reverse();
  
  const labels = dataToShow.map(item => item.city);
  const temperatures = dataToShow.map(item => parseFloat(item.temperature));
  
  weatherChartInstance.data.labels = labels;
  weatherChartInstance.data.datasets[0].data = temperatures;
  
  // Update chart title based on current units
  if (currentUnits === 'fahrenheit') {
    weatherChartInstance.options.scales.y.title.text = 'Temperature (°F)';
    weatherChartInstance.data.datasets[0].label = 'Temperature (°F)';
    
    // Convert temperatures to Fahrenheit
    weatherChartInstance.data.datasets[0].data = temperatures.map(temp => (temp * 9/5) + 32);
    
    // Update tooltip
    weatherChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
      return `${context.dataset.label}: ${context.raw.toFixed(1)}°F`;
    };
  } else {
    weatherChartInstance.options.scales.y.title.text = 'Temperature (°C)';
    weatherChartInstance.data.datasets[0].label = 'Temperature (°C)';
    
    // Update tooltip
    weatherChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
      return `${context.dataset.label}: ${context.raw.toFixed(1)}°C`;
    };
  }
  
  weatherChartInstance.update();
}

// Load user preferences from the database
async function loadUserPreferences() {
  try {
    const response = await fetch(`/api/user-preferences/${userId}`);
    if (response.ok) {
      const preferences = await response.json();
      currentTheme = preferences.theme || 'light';
      currentUnits = preferences.units || 'celsius';
      
      // Apply theme
      if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
      } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = '🌙';
      }
      
      // Update unit toggle button
      unitToggle.textContent = currentUnits === 'celsius' ? '°F' : '°C';
      
      // If there's a default city, search for it
      if (preferences.default_city) {
        cityInput.value = preferences.default_city;
        searchWeather(preferences.default_city);
      }
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

// Save user preferences to the database
async function saveUserPreferences() {
  try {
    const response = await fetch(`/api/user-preferences/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: currentTheme,
        units: currentUnits,
        default_city: cityInput.value || 'College Park'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

// Toggle between light and dark themes
themeToggle.addEventListener('click', () => {
  if (currentTheme === 'light') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
    currentTheme = 'dark';
  } else {
    document.body.classList.remove('dark-theme');
    themeToggle.textContent = '🌙';
    currentTheme = 'light';
  }
  saveUserPreferences();
});

// Toggle between Celsius and Fahrenheit
unitToggle.addEventListener('click', () => {
  currentUnits = currentUnits === 'celsius' ? 'fahrenheit' : 'celsius';
  unitToggle.textContent = currentUnits === 'celsius' ? '°F' : '°C';
  
  // Update the displayed temperature if weather is currently shown
  const temperatureElement = document.querySelector('.temperature');
  if (temperatureElement && temperatureElement.dataset.celsius) {
    const celsiusTemp = parseFloat(temperatureElement.dataset.celsius);
    if (currentUnits === 'celsius') {
      temperatureElement.textContent = `${celsiusTemp.toFixed(1)}°C`;
    } else {
      const fahrenheitTemp = (celsiusTemp * 9/5) + 32;
      temperatureElement.textContent = `${fahrenheitTemp.toFixed(1)}°F`;
    }
  }
  
  // Update the chart with the new units
  if (weatherHistoryData.length > 0) {
    updateChart(weatherHistoryData);
  }
  
  saveUserPreferences();
});

// Handle search form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    searchWeather(city);
  }
});

// Search for weather data
async function searchWeather(city) {
  try {
    // Call the GoWeather API to get real weather data
    const weatherData = await getWeatherData(city);
    displayWeatherData(weatherData);
    saveWeatherSearch(weatherData);
  } catch (error) {
    console.error('Error searching weather:', error);
    weatherCard.innerHTML = `
      <div class="error">
        <p>Error fetching weather data. Please try again.</p>
      </div>
    `;
  }
}

// Get real weather data from GoWeather API
async function getWeatherData(city) {
  try {
    // Format city name for URL (replace spaces with %20)
    const formattedCity = encodeURIComponent(city);
    
    // Call the GoWeather API
    const response = await fetch(`https://goweather.herokuapp.com/weather/${formattedCity}`);
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    
    // Extract temperature value (remove " °C" from the string)
    let tempValue = data.temperature ? parseFloat(data.temperature.replace(/[^-\d.]/g, '')) : 20;
    
    // Extract wind speed value (remove " km/h" from the string)
    let windSpeedValue = data.wind ? parseFloat(data.wind.replace(/[^-\d.]/g, '')) : 5;
    
    // Default humidity (GoWeather API doesn't provide humidity)
    const humidity = 60;
    
    return {
      city: city,
      temperature: tempValue,
      description: data.description || 'Unknown',
      humidity: humidity,
      windSpeed: windSpeedValue,
      forecast: data.forecast || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching from GoWeather API:', error);
    
    // Fallback to mock data if API fails
    console.log('Falling back to mock data');
    return getFallbackWeatherData(city);
  }
}

// Fallback to mock data if the API fails
function getFallbackWeatherData(city) {
  // Generate random weather data based on the city name
  const cityHash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 15 + (cityHash % 20); // Temperature between 15-35°C
  const humidity = 40 + (cityHash % 50); // Humidity between 40-90%
  const windSpeed = 5 + (cityHash % 15); // Wind speed between 5-20 km/h
  
  // Weather conditions based on "hash"
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy', 'Foggy'];
  const conditionIndex = cityHash % conditions.length;
  
  return {
    city: city,
    temperature: temp,
    description: conditions[conditionIndex],
    humidity: humidity,
    windSpeed: windSpeed,
    timestamp: new Date().toISOString()
  };
}

// Display weather data in the UI
function displayWeatherData(data) {
  // Choose weather icon based on description
  let weatherIcon = '☀️'; // Default sunny
  if (data.description.includes('Cloud')) weatherIcon = '⛅';
  if (data.description.includes('Rain')) weatherIcon = '🌧️';
  if (data.description.includes('Thunder')) weatherIcon = '⛈️';
  if (data.description.includes('Snow')) weatherIcon = '❄️';
  if (data.description.includes('Fog')) weatherIcon = '🌫️';
  
  // Format temperature based on current units
  let tempDisplay;
  if (currentUnits === 'celsius') {
    tempDisplay = `${data.temperature.toFixed(1)}°C`;
  } else {
    const fahrenheitTemp = (data.temperature * 9/5) + 32;
    tempDisplay = `${fahrenheitTemp.toFixed(1)}°F`;
  }
  
  // Update the weather card
  weatherCard.innerHTML = `
    <div class="weather-icon">${weatherIcon}</div>
    <h2>${data.city}</h2>
    <div class="temperature" data-celsius="${data.temperature}">${tempDisplay}</div>
    <div class="description">${data.description}</div>
    <div class="details">
      <div class="detail-item">
        <div>Humidity</div>
        <div>${data.humidity}%</div>
      </div>
      <div class="detail-item">
        <div>Wind</div>
        <div>${data.windSpeed} km/h</div>
      </div>
    </div>
  `;
}

// Save weather search to history
async function saveWeatherSearch(data) {
  try {
    const response = await fetch('/api/weather-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: data.city,
        temperature: data.temperature.toString(),
        description: data.description
      }),
    });
    
    if (response.ok) {
      fetchWeatherHistory(); // Refresh the history list
    }
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

// Fetch weather search history
async function fetchWeatherHistory() {
  try {
    const response = await fetch('/api/weather-history');
    if (response.ok) {
      const historyData = await response.json();
      weatherHistoryData = historyData; // Store for chart updates
      displayWeatherHistory(historyData);
      updateChart(historyData);
    }
  } catch (error) {
    console.error('Error fetching search history:', error);
  }
}

// Display weather search history
function displayWeatherHistory(historyData) {
  if (historyData.length === 0) {
    historyList.innerHTML = '<p>No search history yet.</p>';
    return;
  }
  
  historyList.innerHTML = '';
  historyData.forEach(item => {
    const historyItem = document.createElement('li');
    historyItem.className = 'history-item';
    
    // Format the timestamp
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleString();
    
    historyItem.innerHTML = `
      <div>${item.city}</div>
      <div>${item.temperature}°C - ${item.description}</div>
    `;
    
    // Add click event to search for this city again
    historyItem.addEventListener('click', () => {
      cityInput.value = item.city;
      searchWeather(item.city);
    });
    
    historyList.appendChild(historyItem);
  });
}
