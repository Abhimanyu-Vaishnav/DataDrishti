from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ColumnInfo(BaseModel):
    name: str
    dtype: str


class DataProfile(BaseModel):
    row_count: int
    column_count: int
    missing_values: Dict[str, int]
    duplicate_rows: int
    inferred_types: List[ColumnInfo]
    preview: List[Dict[str, Any]]


class VisualizationRequest(BaseModel):
    graph_type: str
    x_axis: str
    y_axis: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    group_by: Optional[str] = None
    sort_order: Optional[str] = "asc"


class InsightRequest(BaseModel):
    target_column: str
    category_column: Optional[str] = None


class DashboardChart(BaseModel):
    title: str
    graph_type: str
    x_axis: str
    y_axis: Optional[str] = None


class DashboardSaveRequest(BaseModel):
    name: str
    charts: List[DashboardChart]
    insights_summary: str


class NLQRequest(BaseModel):
    query: str
