import { useEffect, useState } from "react";
import { diagnose, getDatasetPreview } from "./api";

const initialForm = {
  high_fever: false,
  abdominal_pain: false,
  weakness_fatigue: false,
  headache: false,
  loss_of_appetite: false,
  nausea_vomiting: false,
  diarrhea_constipation: false,
  persistent_fever_over_101f: false,
  gi_discomfort: false,
  low_platelet_count: false,
  positive_widal_or_blood_culture: false,
  contaminated_food_water_exposure: false,
};

const symptomGuide = [
  "Persistent high fever (usually >101F / 38.3C) that does not settle quickly.",
  "Abdominal pain or generalized gastrointestinal discomfort.",
  "Marked weakness and fatigue affecting routine activity.",
  "Headache, nausea, and sometimes vomiting.",
  "Bowel pattern change: diarrhea or constipation.",
  "Reduced appetite and overall malaise.",
];

const dietGuide = [
  "Hydration first: oral rehydration salts, clean water, soups, and coconut water.",
  "Soft high-energy meals: khichdi, porridge, boiled rice, yogurt, bananas.",
  "Lean protein support: eggs, chicken soup, lentils (as tolerated).",
  "Avoid oily, spicy, and highly processed food during acute symptoms.",
  "Use safe water and hygienic food handling to prevent reinfection.",
];

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("screening");
  const selectedSymptoms = Object.values(form).filter(Boolean).length;

  useEffect(() => {
    getDatasetPreview()
      .then(setDataset)
      .catch(() => setDataset(null));
  }, []);

  const toggle = (key) => setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await diagnose(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayLabel = (key) =>
    key
      .replaceAll("_", " ")
      .replace("gi", "GI")
      .replace("101f", "101F")
      .replace("widal", "Widal")
      .replace("cbc", "CBC");

  const riskTone = (riskLevel) => {
    if (riskLevel === "High") return "danger";
    if (riskLevel === "Medium") return "warn";
    return "safe";
  };

  const riskMessage =
    result?.risk_level === "High"
      ? "Immediate physician consultation recommended."
      : result?.risk_level === "Medium"
        ? "Further testing advised for confirmation."
        : "Current indicators suggest lower immediate risk.";

  const activeTab = (tab) => (view === tab ? "nav-btn active" : "nav-btn");

  return (
    <main className="app-shell">
      <div className="background-overlay" />
      <section className="container-fluid">
        <header className="top-nav">
          <div>
            <p className="brand-title">Typhoid Clinical Intelligence Platform</p>
            <p className="brand-subtitle">Explainable Hybrid Knowledge-Based Decision Support</p>
          </div>
          <div className="nav-actions">
            <button className={activeTab("screening")} onClick={() => setView("screening")}>
              Screening
            </button>
            <button className={activeTab("symptoms")} onClick={() => setView("symptoms")}>
              Symptoms
            </button>
            <button className={activeTab("diet")} onClick={() => setView("diet")}>
              Diet
            </button>
          </div>
        </header>

        <section className="hero-section">
          <article className="hero-panel">
            <p className="hero-kicker">Infectious Disease Decision Workspace</p>
            <h1>Typhoid Fever Decision Support Dashboard</h1>
            <p>
              Structured diagnosis support using rule-based reasoning, CSV-trained ML classification, and explainable
              trace output for clinical transparency.
            </p>
            <div className="hero-cta">
              <button className="primary" onClick={() => setView("screening")}>
                Start Clinical Screening
              </button>
              <button className="ghost" onClick={() => setView("symptoms")}>
                View Symptom Guidelines
              </button>
            </div>
          </article>
          <article className="session-panel">
            <p className="mini-label">Current Session</p>
            <p className="session-value">{selectedSymptoms}</p>
            <p className="session-caption">Indicators currently selected</p>
            <div className={`risk-badge tone-${riskTone(result?.risk_level)}`}>Latest Risk: {result?.risk_level || "Pending"}</div>
            <p className="session-meta">
              {result ? `Rule score ${result.risk_score}. ${riskMessage}` : "Run screening to generate explainable result."}
            </p>
          </article>
        </section>

        <section className="kpi-grid">
          <article className="kpi-card">
            <p className="mini-label">Inputs</p>
            <p className="kpi-value">{selectedSymptoms}</p>
            <p className="kpi-meta">Selected symptom indicators</p>
          </article>
          <article className="kpi-card">
            <p className="mini-label">ML Probability</p>
            <p className="kpi-value">{result?.ml_probability ?? "N/A"}</p>
            <p className="kpi-meta">Probability from CSV-trained model</p>
          </article>
          <article className="kpi-card">
            <p className="mini-label">Hybrid Score</p>
            <p className="kpi-value">{result?.hybrid_score ?? "N/A"}</p>
            <p className="kpi-meta">Rule + ML blended confidence</p>
          </article>
          <article className="kpi-card">
            <p className="mini-label">Model Status</p>
            <p className="kpi-value status">{result?.model_status ?? "Not loaded"}</p>
            <p className="kpi-meta">Runtime model availability</p>
          </article>
        </section>

        {view === "screening" && (
          <section className="workspace">
            <article className="workspace-main">
              <h2>Typhoid Screening Interface</h2>
              <p className="dim section-note">
                Complete the symptom checklist and run an explainable diagnosis.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="grid">
                  {Object.keys(form).map((key) => (
                    <label key={key} className="check">
                      <input type="checkbox" checked={form[key]} onChange={() => toggle(key)} />
                      <span>{displayLabel(key)}</span>
                    </label>
                  ))}
                </div>
                <button className="primary full" type="submit" disabled={loading}>
                  {loading ? "Running Diagnostic..." : "Run Diagnostic"}
                </button>
              </form>
              {error && <p className="error">{error}</p>}
            </article>
            <aside className="workspace-side">
              <h3>Clinical Assist Notes</h3>
              <ul>
                <li>Use confirmed lab indicators where available.</li>
                <li>Positive culture has high diagnostic importance.</li>
                <li>Combine model output with physician judgement.</li>
              </ul>
            </aside>
          </section>
        )}

        {view === "symptoms" && (
          <section className="workspace">
            <article className="workspace-main">
              <h2>Typhoid Symptoms & Medical Advice</h2>
              <div className="info-card">
                <h3>Detailed Typhoid Symptoms</h3>
                <ul>
                  {symptomGuide.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
            <aside className="workspace-side warning">
              <h3>When to Seek Care</h3>
              <p>
                Seek urgent medical evaluation if persistent fever, severe abdominal pain, or dehydration appears. Do
                not delay testing where typhoid exposure risk is high.
              </p>
            </aside>
          </section>
        )}

        {view === "diet" && (
          <section className="workspace">
            <article className="workspace-main">
              <h2>Typhoid Recovery Diet Protocol</h2>
              <div className="info-card">
                <h3>Nutrition Strategy</h3>
                <ul>
                  {dietGuide.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
            <aside className="workspace-side">
              <h3>Hydration Reminder</h3>
              <p>
                Hydration and safe food handling are essential during treatment and recovery. Avoid raw contaminated
                food and use clean water.
              </p>
            </aside>
          </section>
        )}

        {result && (
          <section className="result-panel">
            <div className="result-head">
              <h2>Explainable Diagnostic Output</h2>
              <div className={`risk-chip tone-${riskTone(result.risk_level)}`}>
                Risk: <strong>{result.risk_level}</strong> | Rule Score: <strong>{result.risk_score}</strong>
              </div>
            </div>
            <div className="result-grid">
              <article className="info-card">
                <h3>Why This Result</h3>
                <ul>
                  {result.explanation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="info-card">
                <h3>Recommendations</h3>
                <ul>
                  {result.recommendation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="info-card rules-card">
                <h3>Rule Trace</h3>
                <div className="rules-list">
                  {result.rule_trace.map((rule) => (
                    <div className="rule-row" key={rule.rule_id}>
                      <span className={rule.matched ? "pill match" : "pill miss"}>
                        {rule.rule_id} {rule.matched ? "Matched" : "Not Matched"}
                      </span>
                      <span className="rule-contribution">contribution={rule.contribution}</span>
                      <p className="rule-desc">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="info-card">
                <h3>WHO Guideline Snippets</h3>
                <ul>
                  {(result.guideline_snippets || []).map((item, idx) => (
                    <li key={`${idx}-${item.slice(0, 14)}`}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        )}

        <section className="dataset-panel">
          <h2>Real-Time Dataset Monitor (Hugging Face)</h2>
          {!dataset && <p className="dim">No dataset response available yet.</p>}
          {dataset && (
            <>
              <p className="dim">
                Dataset: <strong>{dataset.dataset_id}</strong> | Rows Loaded: <strong>{dataset.total_rows}</strong>
              </p>
              <div className="dataset-list">
                {dataset.rows.slice(0, 6).map((row, i) => (
                  <div className="dataset-row" key={`${i}-${row.text.slice(0, 12)}`}>
                    <span className="source">[{row.source}]</span>
                    <span>{row.text}</span>
                    {row.label ? <span className="tag">{row.label}</span> : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="app-footer">
          <span>Typhoid Clinical Intelligence Platform</span>
          <span>Designed for Explainable Medical Decision Support</span>
        </footer>
      </section>
    </main>
  );
}
