from __future__ import annotations

from io import BytesIO
from typing import Any, Dict, List

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

    parsed = pd.to_datetime(series.dropna().head(20), errors="coerce")
    if not parsed.empty and parsed.notna().mean() > 0.7:
        return "date"
    return "categorical"


def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    safe = df.head(20).replace({np.nan: None})
    return {
        "row_count": int(len(df)),
        "column_count": int(df.shape[1]),
        "missing_values": {c: int(v) for c, v in df.isna().sum().to_dict().items()},
        "duplicate_rows": int(df.duplicated().sum()),
        "inferred_types": [{"name": c, "dtype": infer_column_type(df[c])} for c in df.columns],
        "preview": safe.to_dict(orient="records"),
    }


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
    std = numeric.std() or 1
    anomalies = numeric[(np.abs((numeric - numeric.mean()) / std) > 2)].round(4).tolist()

    top_category = None
    if category_column and category_column in df.columns:
        category_frame = df[[category_column, target_column]].copy()
        category_frame[target_column] = pd.to_numeric(category_frame[target_column], errors="coerce")
        grouped = (
            category_frame.dropna()
            .groupby(category_column)[target_column]
            .sum()
            .sort_values(ascending=False)
        )
        if not grouped.empty:
            top_category = {"category": str(grouped.index[0]), "value": float(grouped.iloc[0])}

    x = np.arange(len(numeric)).reshape(-1, 1)
    model = LinearRegression().fit(x, numeric.values)
    prediction = float(model.predict([[len(numeric)]])[0])

    summary = (
        f"{target_column} shows an overall {trend} trend. "
        f"Average is {numeric.mean():.2f}, max is {numeric.max():.2f}, and estimated next value is {prediction:.2f}. "
        f"Detected {len(anomalies)} anomaly point(s)."
    )

    return {
        "trend": trend,
        "anomalies": anomalies,
        "top_category": top_category,
        "prediction": prediction,
        "summary": summary,
    }


def _to_numeric_or_raw(series: pd.Series, value: Any) -> Any:
    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(value, errors="coerce")
    return value


def apply_visual_filters(df: pd.DataFrame, filters: List[Dict[str, Any]] | None) -> pd.DataFrame:
    filtered = df.copy()
    if not filters:
        return filtered

    for condition in filters:
        column = condition.get("column")
        operator = condition.get("operator")
        value = condition.get("value")
        if column not in filtered.columns:
            continue

        col = filtered[column]
        casted_value = _to_numeric_or_raw(col, value)

        if operator == "eq":
            filtered = filtered[col == casted_value]
        elif operator == "neq":
            filtered = filtered[col != casted_value]
        elif operator == "gt":
            filtered = filtered[pd.to_numeric(col, errors="coerce") > pd.to_numeric(casted_value, errors="coerce")]
        elif operator == "gte":
            filtered = filtered[pd.to_numeric(col, errors="coerce") >= pd.to_numeric(casted_value, errors="coerce")]
        elif operator == "lt":
            filtered = filtered[pd.to_numeric(col, errors="coerce") < pd.to_numeric(casted_value, errors="coerce")]
        elif operator == "lte":
            filtered = filtered[pd.to_numeric(col, errors="coerce") <= pd.to_numeric(casted_value, errors="coerce")]
        elif operator == "contains":
            filtered = filtered[col.astype(str).str.contains(str(value), case=False, na=False)]

    return filtered


def _correlation_matrix(df: pd.DataFrame) -> Dict[str, Any]:
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return {"columns": [], "matrix": []}
    corr = numeric_df.corr().round(4)
    return {
        "columns": [str(c) for c in corr.columns],
        "matrix": corr.values.tolist(),
    }


def _heatmap_data(df: pd.DataFrame, x_axis: str, y_axis: str) -> List[Dict[str, Any]]:
    if x_axis not in df.columns or y_axis not in df.columns:
        return []
    ctab = pd.crosstab(df[x_axis], df[y_axis])
    points: List[Dict[str, Any]] = []
    for x_val, row in ctab.iterrows():
        for y_val, val in row.items():
            points.append({"x": str(x_val), "y": str(y_val), "value": int(val)})
    return points


def build_chart_data(
    df: pd.DataFrame,
    graph_type: str,
    x_axis: str,
    y_axis: str | None,
    group_by: str | None,
    sort_by: str | None,
    sort_order: str,
) -> Dict[str, Any]:
    data = df.copy()

    if graph_type == "correlation":
        return {"mode": "matrix", "data": _correlation_matrix(data)}

    if graph_type == "heatmap":
        if not y_axis:
            raise ValueError("Heatmap requires both x_axis and y_axis")
        return {"mode": "heatmap", "data": _heatmap_data(data, x_axis, y_axis)}

    if graph_type == "histogram":
        target = y_axis or x_axis
        if target not in data.columns:
            raise ValueError("Histogram target column not found")
        nums = pd.to_numeric(data[target], errors="coerce").dropna()
        counts, edges = np.histogram(nums, bins=10)
        hist_data = [
            {"bin": f"{edges[i]:.2f}-{edges[i + 1]:.2f}", "count": int(counts[i])}
            for i in range(len(counts))
        ]
        return {"mode": "records", "data": hist_data, "x_axis": "bin", "y_axis": "count"}

    if group_by and y_axis and group_by in data.columns and y_axis in data.columns:
        numeric_target = pd.to_numeric(data[y_axis], errors="coerce")
        data = pd.DataFrame({group_by: data[group_by], y_axis: numeric_target}).dropna()
        data = data.groupby(group_by, as_index=False)[y_axis].sum()
        x_axis = group_by

    if sort_by and sort_by in data.columns:
        data = data.sort_values(by=sort_by, ascending=sort_order == "asc")
    elif x_axis in data.columns:
        data = data.sort_values(by=x_axis, ascending=sort_order == "asc")

    required = [x_axis] + ([y_axis] if y_axis else [])
    for col in required:
        if col not in data.columns:
            raise ValueError(f"Column '{col}' not found in data")

    return {
        "mode": "records",
        "data": data[required].replace({np.nan: None}).to_dict(orient="records"),
        "x_axis": x_axis,
        "y_axis": y_axis,
    }


def parse_nl_query(query: str, columns: List[str]) -> Dict[str, Any]:
    q = query.lower()
    graph_type = "line" if any(token in q for token in ["growth", "trend", "over time", "month"]) else "bar"

    def pick(matchers: List[str], fallback: str) -> str:
        return next((c for c in columns if any(m in c.lower() for m in matchers)), fallback)

    x_axis = pick(["date", "month", "time", "year"], columns[0])
    y_axis = pick(["sales", "revenue", "profit", "amount", "count"], columns[-1])
    return {"graph_type": graph_type, "x_axis": x_axis, "y_axis": y_axis, "sort_order": "asc"}
