from __future__ import annotations

from io import BytesIO
from typing import List, Dict

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def insights_to_pdf(title: str, lines: List[str]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setTitle(title)
    y = 760
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(72, y, title)
    y -= 30
    pdf.setFont("Helvetica", 11)
    for line in lines:
        pdf.drawString(72, y, line[:110])
        y -= 18
        if y < 72:
            pdf.showPage()
            y = 760
            pdf.setFont("Helvetica", 11)
    pdf.save()
    buffer.seek(0)
    return buffer.read()


def dashboard_to_json(name: str, charts: List[Dict], summary: str) -> Dict:
    return {"name": name, "charts": charts, "insights_summary": summary}
