const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware - MUST be before routes
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

// Explicit OPTIONS handler for preflight
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Engrain API is running' });
});

// Gemini AI endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Get API key from environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'GEMINI_API_KEY not set'
      });
    }

    console.log('Calling Gemini API...');

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', response.status);
      return res.status(response.status).json({
        error: `Gemini API error: ${response.status}`,
      });
    }

    const data = await response.json();

    // Extract text from response
    let textContent = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts[0] && parts[0].text) {
        textContent = parts[0].text;
      }
    }

    console.log('✅ Gemini response generated');

    res.json({
      success: true,
      response: textContent,
    });
  } catch (error) {
    console.error('API error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Engrain API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
