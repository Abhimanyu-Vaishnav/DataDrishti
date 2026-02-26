from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ColumnInfo(BaseModel):
    name: str
    dtype: Literal["numeric", "categorical", "date"]


class DataProfile(BaseModel):
    row_count: int
    column_count: int
    missing_values: Dict[str, int]
    duplicate_rows: int
    inferred_types: List[ColumnInfo]
    preview: List[Dict[str, Any]]


class FilterCondition(BaseModel):
    column: str
    operator: Literal["eq", "neq", "gt", "gte", "lt", "lte", "contains"]
    value: Any


class VisualizationRequest(BaseModel):
    graph_type: Literal[
        "bar",
        "line",
        "pie",
        "area",
        "scatter",
        "histogram",
        "heatmap",
        "correlation",
    ]
    x_axis: str
    y_axis: Optional[str] = None
    filters: List[FilterCondition] = Field(default_factory=list)
    group_by: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "asc"


class InsightRequest(BaseModel):
    target_column: str
    category_column: Optional[str] = None


class DashboardChart(BaseModel):
    title: str
    graph_type: str
    x_axis: str
    y_axis: Optional[str] = None
    filters: List[FilterCondition] = Field(default_factory=list)
    group_by: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Literal["asc", "desc"] = "asc"


class DashboardSaveRequest(BaseModel):
    name: str
    charts: List[DashboardChart]
    insights_summary: str


class NLQRequest(BaseModel):
    query: str
