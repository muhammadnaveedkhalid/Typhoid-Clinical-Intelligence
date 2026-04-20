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

## Important Note

This is an **academic decision-support prototype** for assignment/research use.
It is **not** a substitute for professional clinical diagnosis.
