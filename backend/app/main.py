from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import SymptomInput, DiagnosisResponse, DatasetResponse, ModelTrainResponse
from app.rules import evaluate_typhoid_rules
from app.services.hf_service import HuggingFaceDatasetService
from app.services.ml_service import TyphoidMLService
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
ml_service = TyphoidMLService()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "typhoid-kbs-backend"}


@app.post("/api/diagnose", response_model=DiagnosisResponse)
def diagnose(payload: SymptomInput) -> DiagnosisResponse:
    rule_score, risk, explanation, trace = evaluate_typhoid_rules(payload)
    ml_probability, model_status = ml_service.predict_probability(payload)

    if ml_probability is not None:
        hybrid_score = (0.6 * rule_score) + (0.4 * ml_probability)
    else:
        hybrid_score = rule_score

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

    if hybrid_score >= 0.7:
        final_risk = "High"
    elif hybrid_score >= 0.35:
        final_risk = "Medium"
    else:
        final_risk = "Low"

    if ml_probability is not None:
        explanation.append(f"ML model probability from CSV-trained classifier: {ml_probability:.2f}")
    else:
        explanation.append("ML model unavailable. Train model using /api/train-model endpoint with CSV data.")

    return DiagnosisResponse(
        risk_level=final_risk,
        risk_score=round(rule_score, 2),
        recommendation=recommendations[final_risk],
        explanation=explanation or ["No strong rule matched; based on limited available symptoms."],
        rule_trace=trace,
        ml_probability=round(ml_probability, 2) if ml_probability is not None else None,
        hybrid_score=round(hybrid_score, 2),
        model_status=model_status,
        guideline_snippets=who_service.extract_guideline_snippets(max_snippets=3),
    )


@app.get("/api/dataset", response_model=DatasetResponse)
async def dataset_preview(dataset_id: str | None = None) -> DatasetResponse:
    rows = await hf_service.fetch_rows(dataset_id=dataset_id, length=15)
    return DatasetResponse(dataset_id=dataset_id or hf_service.default_dataset, total_rows=len(rows), rows=rows)


@app.post("/api/train-model", response_model=ModelTrainResponse)
def train_model(csv_path: str | None = None) -> ModelTrainResponse:
    result = ml_service.train_from_csv(csv_path=csv_path)
    return ModelTrainResponse(**result)
