const express = require('express');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());

// CORS middleware - must be FIRST
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// OpenAI API endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'OPENAI_API_KEY not set',
      });
    }

    console.log('📡 Calling OpenAI API with GPT-4o mini...');

    // Call OpenAI API with GPT-4o mini (cheapest model)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Extract text from response
    const textContent = response.choices[0].message.content;

    console.log('✅ OpenAI response generated successfully');

    res.json({
      success: true,
      response: textContent,
    });
  } catch (error) {
    console.error('❌ API error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Engrain API Server',
    status: 'running',
    endpoints: {
      'POST /api/gemini': 'Call OpenAI GPT-4o mini API',
      'GET /health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log('✅ Engrain API running on port ' + PORT);
  console.log('📡 OpenAI API Key configured: ' + (process.env.OPENAI_API_KEY ? 'YES' : 'NO'));
});
