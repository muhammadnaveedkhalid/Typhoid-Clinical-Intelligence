const API_BASE = "http://127.0.0.1:8000";

export async function diagnose(payload) {
  const res = await fetch(`${API_BASE}/api/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Diagnosis request failed");
  return res.json();
}

export async function getDatasetPreview() {
  const res = await fetch(`${API_BASE}/api/dataset`);
  if (!res.ok) throw new Error("Dataset request failed");
  return res.json();
}
