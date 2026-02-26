# DataDrishti AI

DataDrishti AI is a modern full-stack analytics platform for CSV/XLSX datasets with automatic cleaning, visual exploration, AI insights, and dashboard exports.

## Stack
- Frontend: React + TailwindCSS + Recharts + Framer Motion
- Backend: FastAPI + Pandas + scikit-learn
- AI: OpenAI-ready summary enrichment service (with deterministic fallback)
- Storage/DB: PostgreSQL/Supabase-ready dependency setup

## Features
- Drag-and-drop file upload for `.csv` and `.xlsx`
- Data preview table + data profiling (missing values, duplicates, inferred column types)
- Data cleaning actions (remove nulls, drop duplicates)
- Visualization engine with configurable axes and chart type
- AI insights (trend, anomalies, top category, simple linear regression prediction, natural-language summary)
- Dashboard mode (multi-chart list, save dashboard, export insights as PDF, download chart as PNG)
- Optional natural language chart query endpoint (`/nlq`)
- Glassmorphism UI, dark/light toggle, smooth motion

## Project Structure
```
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

Set optional frontend API URL in `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000
```

Set optional backend key in `backend/.env`:
```bash
OPENAI_API_KEY=your_key_here
```
