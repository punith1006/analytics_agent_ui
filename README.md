# LMS Analytics Agent - Test UI

A standalone Next.js application to test the LMS Analytics Agent backend.

## Quick Start

### 1. Start the Python Backend

```bash
cd c:\Users\Punith\GKT_LMS\analytics_agent
.\venv\Scripts\activate
python main.py
```

Backend will run on: `http://localhost:8001`

### 2. Start the Frontend

```bash
cd c:\Users\Punith\GKT_LMS\analytics-agent-ui
npm run dev
```

Frontend will run on: `http://localhost:3000`

### 3. Configure OpenAI API Key

Edit the `.env` file in the `analytics_agent` folder:

```
OPENAI_API_KEY=your-api-key-here
```

## Features

- 🤖 Natural language queries to your LMS database
- 📊 Dynamic chart generation (Line, Bar, Area, Pie, Scatter)
- 💡 AI-powered insights and recommendations
- ⚡ Real-time SSE streaming responses
- 🔒 Read-only database access (no data modification)
- 📈 Confidence scoring for all queries

## Sample Queries to Try

1. "How many courses do we have?"
2. "Show me enrollment trends over time"
3. "What are the top 5 courses by enrollment?"
4. "List all active partners"
5. "Show course category distribution"

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Backend**: Python FastAPI, OpenAI GPT-4o, SQLAlchemy, MySQL
- **Communication**: Server-Sent Events (SSE)
