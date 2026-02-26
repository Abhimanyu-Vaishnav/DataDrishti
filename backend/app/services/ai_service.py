from __future__ import annotations

import os
from typing import Dict


def enrich_summary_with_openai(summary: str) -> Dict[str, str]:
    """
    Placeholder for OpenAI integration.
    In production, wire this to OpenAI Responses API using OPENAI_API_KEY.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"source": "local", "text": summary}

    # Keep deterministic fallback to avoid runtime dependency in offline env.
    return {
        "source": "openai",
        "text": f"AI Analysis: {summary} Consider segment-level drill-downs for decision making.",
    }
