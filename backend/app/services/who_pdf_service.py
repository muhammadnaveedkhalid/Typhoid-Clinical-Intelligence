from pathlib import Path
from typing import List
from pypdf import PdfReader


class WHOPdfService:
    def __init__(self, pdf_path: str = "data/who_typhoid_guidelines.pdf") -> None:
        self.pdf_path = Path(pdf_path)
        self.backend_root = Path(__file__).resolve().parents[2]

    def _resolve_pdf_path(self) -> Path | None:
        candidates = [
            self.pdf_path,
            self.backend_root / self.pdf_path,
            self.backend_root / "data" / "who_typhoid_guidelines.pdf",
            self.backend_root / "data" / "WHO_Typhoid_Guidelines.pdf",
        ]

        for candidate in candidates:
            if candidate.exists():
                return candidate

        # Filename flexible fallback: use first PDF present in backend/data.
        data_dir = self.backend_root / "data"
        if data_dir.exists():
            pdf_files = sorted(data_dir.glob("*.pdf"))
            if pdf_files:
                return pdf_files[0]
        return None

    def extract_guideline_snippets(self, max_snippets: int = 5) -> List[str]:
        resolved = self._resolve_pdf_path()
        if not resolved:
            return [
                "WHO guideline PDF not found in backend/data. Add a .pdf file, e.g. backend/data/who_typhoid_guidelines.pdf"
            ]

        try:
            reader = PdfReader(str(resolved))
            snippets: List[str] = []
            for page in reader.pages:
                text = (page.extract_text() or "").strip()
                if text:
                    cleaned = " ".join(text.split())
                    snippets.append(cleaned[:320])
                if len(snippets) >= max_snippets:
                    break
            return snippets or ["No readable text found in WHO guideline PDF."]
        except Exception as exc:
            return [f"Failed to parse WHO PDF: {exc}"]
