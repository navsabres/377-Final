-- Create weather_searches table
CREATE TABLE IF NOT EXISTS weather_searches (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  temperature TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  units TEXT DEFAULT 'celsius',
  default_city TEXT DEFAULT 'College Park'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS weather_searches_timestamp_idx ON weather_searches (timestamp DESC);
CREATE INDEX IF NOT EXISTS weather_searches_city_idx ON weather_searches (city);

-- Add sample data for testing
INSERT INTO weather_searches (city, temperature, description)
VALUES 
  ('New York', '22.5', 'Sunny'),
  ('London', '15.2', 'Rainy'),
  ('Tokyo', '28.7', 'Partly Cloudy'),
  ('Sydney', '26.1', 'Sunny'),
  ('Paris', '18.9', 'Cloudy');

-- Add a sample user preference
INSERT INTO user_preferences (id, theme, units, default_city)
VALUES ('default_user', 'light', 'celsius', 'College Park')
ON CONFLICT (id) DO NOTHING;
