# Engrain API

Standalone API server for Engrain - handles Gemini AI requests.

## Setup

1. Deploy to Vercel:
```bash
vercel --prod
```

2. Add environment variable in Vercel:
- Name: `GEMINI_API_KEY`
- Value: Your Gemini API key

3. Copy the deployment URL (e.g., https://engrain-api.vercel.app)

4. Use this URL in your frontend

## Endpoints

- `GET /health` - Health check
- `POST /api/gemini` - Call Gemini AI

## Request

```json
{
  "prompt": "Your text to analyze"
}
```

## Response

```json
{
  "success": true,
  "response": "AI generated response"
}
```
