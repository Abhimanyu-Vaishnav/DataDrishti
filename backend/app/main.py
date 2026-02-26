from __future__ import annotations

from typing import Any, Dict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.models.schemas import DashboardSaveRequest, InsightRequest, NLQRequest, VisualizationRequest
from app.services.ai_service import enrich_summary_with_openai
from app.services.data_service import (
    apply_visual_filters,
    build_chart_data,
    clean_dataframe,
    compute_basic_insights,
    parse_nl_query,
    profile_dataframe,
    read_uploaded_file,
)
from app.services.export_service import dashboard_to_json, insights_to_pdf

app = FastAPI(title="DataDrishti AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IN_MEMORY_STORE: Dict[str, Any] = {}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = read_uploaded_file(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    IN_MEMORY_STORE["df"] = df
    return profile_dataframe(df)


@app.post("/clean")
def clean_data(remove_nulls: bool = Form(False), drop_duplicates: bool = Form(False)):
    if "df" not in IN_MEMORY_STORE:
        raise HTTPException(status_code=400, detail="Upload a dataset first")

    cleaned = clean_dataframe(IN_MEMORY_STORE["df"], remove_nulls, drop_duplicates)
    IN_MEMORY_STORE["df"] = cleaned
    return profile_dataframe(cleaned)


@app.post("/visualize")
def visualize(req: VisualizationRequest):
    if "df" not in IN_MEMORY_STORE:
        raise HTTPException(status_code=400, detail="Upload a dataset first")

    filtered_df = apply_visual_filters(IN_MEMORY_STORE["df"], [f.model_dump() for f in req.filters])
    payload = build_chart_data(
        filtered_df,
        req.graph_type,
        req.x_axis,
        req.y_axis,
        req.group_by,
        req.sort_by,
        req.sort_order,
    )

    return {
        "graph_type": req.graph_type,
        "x_axis": req.x_axis,
        "y_axis": req.y_axis,
        "result": payload,
        "row_count_after_filters": int(len(filtered_df)),
    }


@app.post("/insights")
def insights(req: InsightRequest):
    if "df" not in IN_MEMORY_STORE:
        raise HTTPException(status_code=400, detail="Upload a dataset first")

    base = compute_basic_insights(IN_MEMORY_STORE["df"], req.target_column, req.category_column)
    ai = enrich_summary_with_openai(base["summary"])
    return {**base, "ai_summary": ai}


@app.post("/dashboard/save")
def save_dashboard(req: DashboardSaveRequest):
    payload = dashboard_to_json(req.name, [c.model_dump() for c in req.charts], req.insights_summary)
    IN_MEMORY_STORE["dashboard"] = payload
    return JSONResponse(content={"message": "Dashboard saved", "dashboard": payload})


@app.get("/dashboard/export-pdf")
def export_pdf():
    dashboard = IN_MEMORY_STORE.get("dashboard")
    if not dashboard:
        raise HTTPException(status_code=404, detail="No dashboard saved")

    chart_lines = [f"Chart {idx + 1}: {c.get('title', 'Untitled')} ({c.get('graph_type')})" for idx, c in enumerate(dashboard.get("charts", []))]
    lines = chart_lines + ["", "Insights:", dashboard.get("insights_summary", "No summary available")]
    pdf_bytes = insights_to_pdf(f"DataDrishti AI - {dashboard['name']}", lines)
    return Response(content=pdf_bytes, media_type="application/pdf")


@app.post("/nlq")
def natural_language_query(req: NLQRequest):
    if "df" not in IN_MEMORY_STORE:
        raise HTTPException(status_code=400, detail="Upload a dataset first")

    config = parse_nl_query(req.query, [str(c) for c in IN_MEMORY_STORE["df"].columns])
    return {"query": req.query, "chart_config": config}
