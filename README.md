# DataDrishti AI

DataDrishti AI is a modern full-stack analytics platform for CSV/XLSX datasets with automatic cleaning, intelligent visual exploration, AI insights, and dashboard exports.

## Stack
- Frontend: React + TailwindCSS + Recharts + Framer Motion
- Backend: FastAPI + Pandas + scikit-learn
- AI: OpenAI-ready summary enrichment service (with deterministic fallback)
- Database-ready dependencies: PostgreSQL / Supabase

## Core Features
1. **File Upload**
   - Drag-and-drop plus file picker
   - Supports `.csv` and `.xlsx`
   - Instant data preview table

2. **Data Cleaning & Profiling**
   - Missing value counts per column
   - Duplicate row detection
   - Remove null values / duplicates with one click
   - Auto-detect numeric, categorical, and date columns

3. **Visualization Engine**
   - Bar, line, pie, area, scatter, histogram
   - Heatmap-style categorical density data
   - Correlation matrix for numeric columns
   - X/Y axis selectors, graph-type switcher
   - Filters (eq, neq, gt, gte, lt, lte, contains)
   - Group-by and sorting controls

4. **AI Insights**
   - Trend detection
   - Anomaly highlighting
   - Top-performing category
   - Simple linear regression prediction
   - AI-enriched plain-language summary

5. **Dashboard Mode**
   - Add multiple charts
   - Remove charts from dashboard list
   - Save dashboard
   - Download chart as PNG
   - Export dashboard insights as PDF

6. **Natural Language Query (Optional Advanced)**
   - Example: "Show sales growth month-wise"
   - Generates chart config automatically

## Project Structure
```bash
backend/
  app/
    main.py
    models/
    services/
frontend/
  src/
    components/
    hooks/
    lib/
```

## Run Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Optional Environment Variables
`frontend/.env`
```bash
VITE_API_URL=http://localhost:8000
```

`backend/.env`
```bash
OPENAI_API_KEY=your_key_here
```
