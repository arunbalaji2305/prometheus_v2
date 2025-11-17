# Natural Language to PromQL Backend

Node.js + Express backend that converts natural language queries to PromQL using Google Gemini AI and proxies requests to Prometheus.

## Features

- **Natural Language to PromQL Conversion**: Uses Gemini 1.5 Flash to convert user queries
- **Prometheus Proxy**: Secure proxy for Prometheus API with validation
- **Structured Logging**: Pino logger with request IDs and secret redaction
- **Input Validation**: Zod schemas for robust request validation
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Error Handling**: Unified error format with proper HTTP status codes
- **Health Monitoring**: Health check endpoint for service status

## Prerequisites

- Node.js 18+ (ESM modules)
- Prometheus running on localhost:9090
- Google Gemini API key

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and add your Gemini API key:

```env
PORT=4000
GEMINI_API_KEY=your_actual_api_key_here
PROMETHEUS_URL=http://localhost:9090
NODE_ENV=development
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:4000`.

## API Endpoints

### 1. Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "timestamp": "2024-11-09T12:00:00.000Z",
    "services": {
      "prometheusUp": true,
      "aiConfigured": true
    }
  }
}
```

### 2. Natural Language to PromQL

```http
POST /api/nl2promql
Content-Type: application/json

{
  "query": "CPU usage for the last 15 minutes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "naturalLanguageQuery": "CPU usage for the last 15 minutes",
    "promqlQuery": "rate(windows_cpu_time_total[15m]) * 100"
  }
}
```

### 3. Query Prometheus (Range Query)

```http
GET /api/prometheus/query_range?query=rate(windows_cpu_time_total[5m])&start=1699564800&end=1699565400&step=15s
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resultType": "matrix",
    "result": [...]
  }
}
```

## PromQL Prompt Template

The backend uses a strict prompt template that ensures Gemini returns only a single-line PromQL query with no prose or formatting. The template is defined in `src/config/prompts.js`.

Key features:
- Outputs only raw PromQL (no markdown, no explanations)
- Prefers Windows-specific metrics (windows_*)
- Handles time ranges from user queries
- Uses appropriate functions (rate, irate, avg_over_time)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js              # Environment validation
│   │   ├── logger.js           # Pino logger configuration
│   │   └── prompts.js          # Gemini prompt templates
│   ├── middleware/
│   │   ├── errorHandler.js     # Global error handling
│   │   └── validation.js       # Zod validation schemas
│   ├── routes/
│   │   ├── health.routes.js    # Health check endpoint
│   │   ├── nl2promql.routes.js # NL to PromQL conversion
│   │   └── prometheus.routes.js # Prometheus proxy
│   ├── services/
│   │   ├── gemini.service.js   # Gemini AI integration
│   │   └── prometheus.service.js # Prometheus client
│   └── index.js                # Main application entry
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── package.json
└── README.md
```

## Security Features

1. **Helmet**: Sets security HTTP headers
2. **CORS**: Configurable CORS policy
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Input Validation**: Zod schemas validate all inputs
5. **Input Sanitization**: Removes dangerous characters
6. **Secret Redaction**: API keys never logged
7. **Request Timeouts**: 10-second timeout for external requests

## Error Handling

All errors follow a unified format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## Development

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Logs

In development mode, logs are pretty-printed with colors. In production, logs are JSON formatted for easy parsing.

## Troubleshooting

### Prometheus Connection Failed

- Ensure Prometheus is running on `http://localhost:9090`
- Check if Windows Exporter is running on port 9182
- Verify Prometheus is scraping Windows Exporter (check `/targets`)

### Gemini API Errors

- **Invalid API Key**: Check your `.env` file has the correct key
- **Quota Exceeded**: You've hit the free tier limit, wait or upgrade
- **Empty Response**: The prompt may need adjustment in `prompts.js`

### CORS Errors

- Ensure frontend origin is allowed in CORS configuration
- In development, localhost:5173 is allowed by default

## License

MIT

