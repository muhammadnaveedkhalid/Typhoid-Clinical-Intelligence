from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import SymptomInput, DiagnosisResponse, DatasetResponse
from app.rules import evaluate_typhoid_rules
from app.services.hf_service import HuggingFaceDatasetService
from app.services.who_pdf_service import WHOPdfService

app = FastAPI(
    title="Typhoid Explainable KBS API",
    description="Hybrid explainable decision support backend for Typhoid Fever diagnosis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hf_service = HuggingFaceDatasetService()
who_service = WHOPdfService()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "typhoid-kbs-backend"}


@app.post("/api/diagnose", response_model=DiagnosisResponse)
def diagnose(payload: SymptomInput) -> DiagnosisResponse:
    score, risk, explanation, trace = evaluate_typhoid_rules(payload)

    recommendations = {
        "High": [
            "Urgent clinical assessment recommended.",
            "Order blood culture and CBC immediately.",
            "Consider empiric treatment per physician guidance.",
        ],
        "Medium": [
            "Recommend Widal test / blood culture.",
            "Monitor fever trend and GI symptoms closely.",
        ],
        "Low": [
            "Monitor symptoms for 24-48 hours.",
            "Hydration and follow-up if symptoms worsen.",
        ],
    }

    return DiagnosisResponse(
        risk_level=risk,
        risk_score=round(score, 2),
        recommendation=recommendations[risk],
        explanation=explanation or ["No strong rule matched; based on limited available symptoms."],
        rule_trace=trace,
        guideline_snippets=who_service.extract_guideline_snippets(max_snippets=3),
    )


@app.get("/api/dataset", response_model=DatasetResponse)
async def dataset_preview(dataset_id: str | None = None) -> DatasetResponse:
    rows = await hf_service.fetch_rows(dataset_id=dataset_id, length=15)
    return DatasetResponse(dataset_id=dataset_id or hf_service.default_dataset, total_rows=len(rows), rows=rows)
