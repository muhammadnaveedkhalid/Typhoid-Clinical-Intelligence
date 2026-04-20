from typing import List
import os
import httpx
from app.models import DatasetRow


class HuggingFaceDatasetService:
    def __init__(self) -> None:
        self.base_url = "https://datasets-server.huggingface.co"
        self.default_dataset = os.getenv("HF_DATASET_ID", "mbateman/typhoid-symptom-notes")

    async def fetch_rows(self, dataset_id: str | None = None, split: str = "train", length: int = 20) -> List[DatasetRow]:
        ds = dataset_id or self.default_dataset
        params = {"dataset": ds, "config": "default", "split": split, "offset": 0, "length": length}

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(f"{self.base_url}/rows", params=params)
                response.raise_for_status()
                payload = response.json()
            except Exception:
                # Fallback sample rows when dataset is unavailable.
                return [
                    DatasetRow(source="fallback", text="High fever and abdominal pain with weakness", label="high"),
                    DatasetRow(source="fallback", text="Fever and headache with nausea", label="medium"),
                    DatasetRow(source="fallback", text="Mild fatigue and low appetite", label="low"),
                ]

        rows: List[DatasetRow] = []
        for item in payload.get("rows", []):
            value = item.get("row", {})
            text = str(value.get("text") or value.get("symptoms") or value)
            label = value.get("label")
            rows.append(DatasetRow(source=ds, text=text, label=label))
        return rows
