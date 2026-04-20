# Explainable Hybrid KBS for Typhoid Fever Diagnosis

This project implements your assignment topic:
**"Design and Development of an Explainable Hybrid Knowledge Based Decision Support System for Infectious Disease Diagnosis"**
with selected disease: **Typhoid Fever**.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Knowledge Representation:** Declarative facts + IF-THEN production rules
- **Explainability:** Rule trace + textual explanation for each diagnosis
- **Data Integration:** Hugging Face Dataset Server API (real-time preview)
- **Guideline Integration:** WHO guideline PDF parser (snippets extraction)

## Project Structure

```text
kbs-system/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── rules.py
│   │   └── services/
│   │       ├── hf_service.py
│   │       └── who_pdf_service.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
└── docs/
    ├── ARCHITECTURE.md
    └── PROJECT_DOCUMENTATION.md
```

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## WHO PDF Setup

1. Place your WHO Typhoid guideline PDF at:
   `backend/data/who_typhoid_guidelines.pdf`
2. API will automatically extract short text snippets and include them in diagnosis output.

## API Endpoints

- `GET /health` -> service health
- `POST /api/diagnose` -> explainable typhoid risk diagnosis
- `GET /api/dataset` -> real-time dataset preview from Hugging Face
- `POST /api/train-model` -> train ML model from CSV (default: `backend/data/patient_data.csv`)

## CSV-Based ML Training (Patient Data)

Now the system supports your requested workflow:
- Keep patient records in a CSV/Excel-exported CSV file
- Train a Python model from that CSV
- Use the trained model for every diagnosis request

Default CSV path:
- `backend/data/patient_data.csv`

Required columns:
- `high_fever`
- `abdominal_pain`
- `weakness_fatigue`
- `headache`
- `loss_of_appetite`
- `nausea_vomiting`
- `diarrhea_constipation`
- `persistent_fever_over_101f`
- `gi_discomfort`
- `low_platelet_count`
- `positive_widal_or_blood_culture`
- `contaminated_food_water_exposure`
- `typhoid_label` (target: `0` or `1`)

Train model:
```bash
curl -X POST "http://127.0.0.1:8000/api/train-model"
```

Train model from custom CSV path:
```bash
curl -X POST "http://127.0.0.1:8000/api/train-model?csv_path=data/my_patient_data.csv"
```

After training:
- `/api/diagnose` returns:
  - rule-based score
  - `ml_probability`
  - `hybrid_score`
  - model load status

## Important Note

This is an **academic decision-support prototype** for assignment/research use.
It is **not** a substitute for professional clinical diagnosis.
