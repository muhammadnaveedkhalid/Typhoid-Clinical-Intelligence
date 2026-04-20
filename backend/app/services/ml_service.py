from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.models import SymptomInput


class TyphoidMLService:
    def __init__(self) -> None:
        self.backend_root = Path(__file__).resolve().parents[2]
        self.data_dir = self.backend_root / "data"
        self.model_dir = self.backend_root / "models"
        self.model_path = self.model_dir / "typhoid_risk_model.joblib"
        self.default_csv_path = self.data_dir / "patient_data.csv"
        self.feature_columns = [
            "high_fever",
            "abdominal_pain",
            "weakness_fatigue",
            "headache",
            "loss_of_appetite",
            "nausea_vomiting",
            "diarrhea_constipation",
            "persistent_fever_over_101f",
            "gi_discomfort",
            "low_platelet_count",
            "positive_widal_or_blood_culture",
            "contaminated_food_water_exposure",
        ]
        self.target_column = "typhoid_label"
        self._model: Pipeline | None = None

    def _resolve_csv_path(self, csv_path: str | None = None) -> Path:
        if csv_path:
            candidate = Path(csv_path)
            if candidate.exists():
                return candidate
            backend_relative = self.backend_root / candidate
            if backend_relative.exists():
                return backend_relative
        return self.default_csv_path

    def train_from_csv(self, csv_path: str | None = None) -> Dict:
        resolved_csv = self._resolve_csv_path(csv_path)
        if not resolved_csv.exists():
            raise FileNotFoundError(
                f"CSV not found at {resolved_csv}. Add dataset with target column '{self.target_column}'."
            )

        df = pd.read_csv(resolved_csv)
        required_cols = set(self.feature_columns + [self.target_column])
        missing_cols = [c for c in required_cols if c not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns in CSV: {missing_cols}")

        dataset = df[self.feature_columns + [self.target_column]].dropna()
        if dataset.empty:
            raise ValueError("CSV has no valid rows after removing missing values.")

        x = dataset[self.feature_columns].astype(int)
        y = dataset[self.target_column].astype(int)
        if y.nunique() < 2:
            raise ValueError("Target column must contain at least two classes (0 and 1).")

        model = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("classifier", LogisticRegression(max_iter=1000)),
            ]
        )
        model.fit(x, y)

        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "model": model,
                "feature_columns": self.feature_columns,
                "target_column": self.target_column,
            },
            self.model_path,
        )
        self._model = model

        return {
            "trained": True,
            "rows_used": int(len(dataset)),
            "features_used": self.feature_columns,
            "target_column": self.target_column,
            "model_path": str(self.model_path),
            "message": "Model trained successfully from CSV and saved.",
        }

    def _load_model(self) -> Tuple[Pipeline | None, str]:
        if self._model is not None:
            return self._model, "loaded-in-memory"
        if not self.model_path.exists():
            return None, "model-not-trained"

        payload = joblib.load(self.model_path)
        self._model = payload["model"]
        return self._model, "loaded-from-disk"

    def predict_probability(self, symptoms: SymptomInput) -> Tuple[float | None, str]:
        model, status = self._load_model()
        if model is None:
            return None, status

        row = pd.DataFrame(
            [{feature: int(getattr(symptoms, feature)) for feature in self.feature_columns}],
            columns=self.feature_columns,
        )
        probability = float(model.predict_proba(row)[0][1])
        return probability, status
