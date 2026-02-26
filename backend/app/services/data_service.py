from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def read_uploaded_file(filename: str, content: bytes) -> pd.DataFrame:
    lowered = filename.lower()
    if lowered.endswith(".csv"):
        return pd.read_csv(BytesIO(content))
    if lowered.endswith(".xlsx"):
        return pd.read_excel(BytesIO(content))
    raise ValueError("Unsupported file type. Please upload .csv or .xlsx")


def infer_column_type(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "date"
    try:
        parsed = pd.to_datetime(series.dropna().head(20), errors="coerce")
        if parsed.notna().mean() > 0.7:
            return "date"
    except Exception:
        pass
    return "categorical"


def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    profile = {
        "row_count": int(len(df)),
        "column_count": int(df.shape[1]),
        "missing_values": {c: int(v) for c, v in df.isna().sum().to_dict().items()},
        "duplicate_rows": int(df.duplicated().sum()),
        "inferred_types": [
            {"name": c, "dtype": infer_column_type(df[c])} for c in df.columns
        ],
        "preview": df.head(20).replace({np.nan: None}).to_dict(orient="records"),
    }
    return profile


def clean_dataframe(df: pd.DataFrame, remove_nulls: bool = False, drop_duplicates: bool = False) -> pd.DataFrame:
    cleaned = df.copy()
    if remove_nulls:
        cleaned = cleaned.dropna()
    if drop_duplicates:
        cleaned = cleaned.drop_duplicates()
    return cleaned


def compute_basic_insights(df: pd.DataFrame, target_column: str, category_column: str | None = None) -> Dict[str, Any]:
    if target_column not in df.columns:
        raise ValueError("Target column not found")

    numeric = pd.to_numeric(df[target_column], errors="coerce").dropna()
    if numeric.empty:
        raise ValueError("Target column must contain numeric values")

    trend = "upward" if numeric.iloc[-1] >= numeric.iloc[0] else "downward"
    anomalies = numeric[(np.abs((numeric - numeric.mean()) / (numeric.std() or 1)) > 2)].tolist()

    top_category = None
    if category_column and category_column in df.columns:
        grouped = (
            df[[category_column, target_column]]
            .dropna()
            .groupby(category_column)[target_column]
            .sum()
            .sort_values(ascending=False)
        )
        if not grouped.empty:
            top_category = {"category": grouped.index[0], "value": float(grouped.iloc[0])}

    x = np.arange(len(numeric)).reshape(-1, 1)
    model = LinearRegression().fit(x, numeric.values)
    prediction = float(model.predict([[len(numeric) + 1]])[0])

    summary = (
        f"The {target_column} metric shows an overall {trend} trend. "
        f"Average value is {numeric.mean():.2f} with a peak at {numeric.max():.2f}. "
        f"Predicted next value is {prediction:.2f}."
    )

    return {
        "trend": trend,
        "anomalies": anomalies,
        "top_category": top_category,
        "prediction": prediction,
        "summary": summary,
    }


def apply_visual_filters(df: pd.DataFrame, filters: Dict[str, Any] | None) -> pd.DataFrame:
    filtered = df.copy()
    if not filters:
        return filtered
    for key, value in filters.items():
        if key not in filtered.columns:
            continue
        filtered = filtered[filtered[key] == value]
    return filtered


def build_chart_data(
    df: pd.DataFrame,
    graph_type: str,
    x_axis: str,
    y_axis: str | None,
    group_by: str | None,
    sort_order: str,
) -> List[Dict[str, Any]]:
    data = df.copy()
    if group_by and y_axis and group_by in data.columns:
        data = data.groupby(group_by, as_index=False)[y_axis].sum()
        x_axis = group_by

    if sort_order in {"asc", "desc"} and x_axis in data.columns:
        data = data.sort_values(by=x_axis, ascending=sort_order == "asc")

    required = [x_axis] + ([y_axis] if y_axis else [])
    records = data[required].replace({np.nan: None}).to_dict(orient="records")
    return records


def parse_nl_query(query: str, columns: List[str]) -> Dict[str, Any]:
    q = query.lower()
    graph_type = "line" if "growth" in q or "trend" in q else "bar"
    x_axis = next((c for c in columns if "date" in c.lower() or "month" in c.lower()), columns[0])
    y_axis = next((c for c in columns if "sales" in c.lower() or "revenue" in c.lower()), columns[-1])
    return {"graph_type": graph_type, "x_axis": x_axis, "y_axis": y_axis}
