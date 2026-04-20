from pydantic import BaseModel, Field
from typing import List, Optional


class SymptomInput(BaseModel):
    high_fever: bool = False
    abdominal_pain: bool = False
    weakness_fatigue: bool = False
    headache: bool = False
    loss_of_appetite: bool = False
    nausea_vomiting: bool = False
    diarrhea_constipation: bool = False
    persistent_fever_over_101f: bool = False
    gi_discomfort: bool = False
    low_platelet_count: bool = False
    positive_widal_or_blood_culture: bool = False
    contaminated_food_water_exposure: bool = False


class RuleTrace(BaseModel):
    rule_id: str
    description: str
    matched: bool
    weight: float
    contribution: float


class DiagnosisResponse(BaseModel):
    disease: str = "Typhoid Fever"
    risk_level: str
    risk_score: float = Field(..., ge=0, le=1)
    recommendation: List[str]
    explanation: List[str]
    rule_trace: List[RuleTrace]
    guideline_snippets: Optional[List[str]] = None


class DatasetRow(BaseModel):
    source: str
    text: str
    label: Optional[str] = None


class DatasetResponse(BaseModel):
    dataset_id: str
    total_rows: int
    rows: List[DatasetRow]
