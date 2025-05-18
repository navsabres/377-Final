# Weather Dashboard

## Project Overview

The Weather Dashboard is a web application developed as part of the INST 377 course at the University of Maryland. It allows users to search for weather information by city name, displaying current weather conditions including temperature, weather description, humidity, and wind speed.

## Description

This application provides a user-friendly interface for checking weather conditions in different cities. Users can search for a city, view current weather data, toggle between Celsius and Fahrenheit, switch between light and dark themes, and view their search history. The application stores user preferences and search history in a Supabase database.

## Target Browsers

This application is designed to work on all modern browsers, including:
- Chrome (version 90+)
- Firefox (version 88+)
- Safari (version 14+)
- Edge (version 90+)
- Mobile browsers on iOS 14+ and Android 10+

The responsive design ensures a good user experience on both desktop and mobile devices.

## Features

- Search for weather by city name using the GoWeather API
- Toggle between Celsius and Fahrenheit
- Switch between light and dark themes
- View search history
- Weather data visualization with Chart.js
- Persistent user preferences
- Responsive design

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **JavaScript Libraries**: 
  - Font Awesome (for icons)
  - Chart.js (for weather data visualization)
- **APIs**:
  - GoWeather API (for real-time weather data)
- **Backend**: Node.js, Express.js
- **Database**: Supabase
- **Deployment**: Vercel

## Live Demo

[View the live demo on Vercel](https://377-final-1ult-git-main-naveed-siddiquis-projects.vercel.app)

---

# Developer Manual

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- A Supabase account and project

### Steps

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database by running the SQL queries in `supabase_tables.sql`.

## Running the Application

### Local Development

To run the application locally:

```
npm run dev
```

This will start the development server on http://localhost:3000.

### Production

To build and start the application for production:

```
npm start
```

## Deployment to Vercel

1. Install the Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Run the Vercel deployment command:
   ```
   vercel
   ```

3. Follow the prompts to set up your project.

4. Set environment variables in the Vercel dashboard:
   - SUPABASE_URL
   - SUPABASE_KEY

5. Deploy to production:
   ```
   vercel --prod
   ```

## API Documentation

### Endpoints

#### GET /api/weather-history

Retrieves the 10 most recent weather searches.

**Response:**
```json
[
  {
    "id": 1,
    "city": "New York",
    "temperature": "22.5",
    "description": "Sunny",
    "timestamp": "2025-05-15T18:30:00.000Z"
  },
  {
    "id": 2,
    "city": "London",
    "temperature": "15.2",
    "description": "Rainy",
    "timestamp": "2025-05-15T18:25:00.000Z"
  }
]
```

#### POST /api/weather-history

Saves a new weather search to the history.

**Request Body:**
```json
{
  "city": "Tokyo",
  "temperature": "28.7",
  "description": "Partly Cloudy"
}
```

**Response:**
```json
{
  "message": "Weather search saved successfully"
}
```

#### GET /api/user-preferences/:userId

Retrieves user preferences.

**Response:**
```json
{
  "id": "user123",
  "theme": "dark",
  "units": "celsius",
  "default_city": "New York"
}
```

#### PUT /api/user-preferences/:userId

Updates user preferences.

**Request Body:**
```json
{
  "theme": "light",
  "units": "fahrenheit",
  "default_city": "San Francisco"
}
```

**Response:**
```json
{
  "message": "User preferences updated successfully"
}
```

## Project Structure

```
weather-dashboard/
├── server.js             # Express server
├── package.json          # Project dependencies
├── vercel.json           # Vercel configuration
├── .env.example          # Example environment variables
├── supabase_tables.sql   # Database schema
├── public/               # Frontend files
│   ├── index.html        # Main page
│   ├── about.html        # About page
│   ├── css/
│   │   └── styles.css    # Stylesheet
│   └── js/
│       └── app.js        # Frontend JavaScript
└── docs/                 # Documentation
    └── vercel-deployment-guide.md
```

## Frontend Implementation

The frontend uses vanilla JavaScript with the Fetch API to communicate with the backend. It makes the following fetch calls:

1. `GET /api/weather-history` - To retrieve search history
2. `POST /api/weather-history` - To save new searches
3. `GET /api/user-preferences/:userId` - To load user preferences
4. `PUT /api/user-preferences/:userId` - To save user preferences

The UI is styled using modern CSS with flexbox and CSS variables for theming. The application is responsive and works well on both desktop and mobile devices.

Two JavaScript libraries are used:
1. Font Awesome - For weather and UI icons
2. Chart.js - For displaying weather data visualizations

## Known Issues and Future Development

### Known Issues

- The application has a fallback to mock data if the GoWeather API fails
- User authentication is not implemented, using a random ID for demo purposes

### Future Development Roadmap

1. **Short-term (1-3 months)**
   - Add user authentication
   - Implement more detailed weather forecasts for upcoming days
   - Add error handling and retry mechanisms for API calls

2. **Medium-term (3-6 months)**
   - Add location-based weather detection
   - Implement weather alerts and notifications
   - Add more detailed weather information (UV index, air quality, etc.)

3. **Long-term (6+ months)**
   - Create a mobile app version
   - Add weather maps and radar
   - Implement internationalization for multiple languages
