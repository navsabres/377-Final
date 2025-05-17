-- Create the weather_searches table
CREATE TABLE IF NOT EXISTS weather_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  temperature TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create the user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  units TEXT DEFAULT 'celsius',
  default_city TEXT DEFAULT 'New York',
  theme TEXT DEFAULT 'light'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS weather_searches_city_idx ON weather_searches(city);
CREATE INDEX IF NOT EXISTS weather_searches_timestamp_idx ON weather_searches(timestamp);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);

-- Add sample data for testing
INSERT INTO weather_searches (city, temperature, description)
VALUES
  ('New York', '22.5', 'Sunny'),
  ('London', '15.2', 'Rainy'),
  ('Tokyo', '28.7', 'Partly Cloudy'),
  ('Sydney', '26.1', 'Sunny'),
  ('Paris', '18.9', 'Cloudy');

-- Add a sample user preference
INSERT INTO user_preferences (user_id, theme, units, default_city)
VALUES ('default_user', 'light', 'celsius', 'New York')
ON CONFLICT DO NOTHING;
