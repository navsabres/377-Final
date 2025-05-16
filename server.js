require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 instead of 3000

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static files from:', path.join(__dirname, 'public'));

// Routes
app.get('/api/weather-history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weather_searches')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather history:', error);
    res.status(500).json({ error: 'Failed to fetch weather history' });
  }
});

app.post('/api/weather-history', async (req, res) => {
  try {
    const { city, temperature, description } = req.body;
    
    const { data, error } = await supabase
      .from('weather_searches')
      .insert([
        { city, temperature, description }
      ]);
    
    if (error) throw error;
    
    res.status(201).json({ message: 'Weather search saved successfully' });
  } catch (error) {
    console.error('Error saving weather search:', error);
    res.status(500).json({ error: 'Failed to save weather search' });
  }
});

// User preferences routes
app.get('/api/user-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) {
      // Create default preferences if not found
      const { data: newData, error: insertError } = await supabase
        .from('user_preferences')
        .insert([
          { user_id: userId }
        ])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return res.json(newData);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
});

app.put('/api/user-preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { units, default_city, theme } = req.body;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ units, default_city, theme })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Key (first 10 chars): ${supabaseKey.substring(0, 10)}...`);
});
