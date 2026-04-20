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
  const [view, setView] = useState("home");
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

  return (
    <main className="app-shell">
      <div className="noise-layer" />
      <section className="container">
        <header className="hero glass premium-hero">
          <div className="hero-topline">Infectious Disease Decision Support</div>
          <div className="hero-main">
            <div>
              <div className="hero-badge">Explainable Hybrid Engine</div>
              <h1>
                Typhoid <span>Clinical Intelligence</span>
              </h1>
              <p>
                A modern knowledge-based diagnostic interface combining IF-THEN reasoning, guideline evidence, and
                transparent rule-level explanations.
              </p>
              <div className="hero-actions">
                <button className="primary" onClick={() => setView("screening")}>
                  Start Screening
                </button>
                <button className="ghost" onClick={() => setView("symptoms")}>
                  Symptoms Guide
                </button>
                <button className="ghost" onClick={() => setView("diet")}>
                  Diet Protocol
                </button>
              </div>
            </div>
            <div className="hero-side glass">
              <p className="label">Current Session</p>
              <p className="value">{selectedSymptoms} Indicators Selected</p>
              <p className={`mini-risk tone-${riskTone(result?.risk_level)}`}>Latest Risk: {result?.risk_level || "Pending"}</p>
              <p className="meta">{result ? `Score ${result.risk_score} - ${riskMessage}` : "Run screening to generate patient-specific risk insights."}</p>
            </div>
          </div>
        </header>

        <section className="quick-stats">
          <article className="glass stat-card">
            <p className="label">Screening Inputs</p>
            <p className="value">{selectedSymptoms}</p>
            <p className="meta">Selected indicators from clinical checklist</p>
          </article>
          <article className="glass stat-card">
            <p className="label">Knowledge Mode</p>
            <p className="value">Hybrid Rules</p>
            <p className="meta">IF-THEN rules + guideline indicators + traces</p>
          </article>
          <article className="glass stat-card">
            <p className="label">Latest Risk</p>
            <p className={`value tone-${riskTone(result?.risk_level)}`}>{result?.risk_level || "Pending"}</p>
            <p className="meta">{result ? `Score: ${result.risk_score}` : "Run diagnostic to generate risk"}</p>
          </article>
        </section>

        {view === "screening" && (
          <section className="glass panel">
            <div className="panel-head">
              <button className="back-link" onClick={() => setView("home")}>
                ← Exit to Home
              </button>
              <h2>Typhoid Prediction Interface</h2>
            </div>
            <p className="dim section-note">
              Use the checklist below. The system will output explainable rule matches and confidence score.
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
          </section>
        )}

        {view === "symptoms" && (
          <section className="glass panel">
            <div className="panel-head">
              <button className="back-link" onClick={() => setView("home")}>
                ← Back to Home
              </button>
              <h2>Typhoid Symptoms & Medical Advice</h2>
            </div>
            <div className="info-card">
              <h3>Detailed Typhoid Symptoms</h3>
              <ul>
                {symptomGuide.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="info-card warning">
              <h3>When Should You Visit a Doctor?</h3>
              <p>
                Seek medical care immediately if high fever persists, severe abdominal pain appears, dehydration
                develops, or blood culture/Widal status is positive. Avoid self-medication without physician guidance.
              </p>
            </div>
          </section>
        )}

        {view === "diet" && (
          <section className="glass panel">
            <div className="panel-head">
              <button className="back-link" onClick={() => setView("home")}>
                ← Back to Home
              </button>
              <h2>Typhoid Diet Guide</h2>
            </div>
            <div className="info-card">
              <h3>Nutrition Strategy During Recovery</h3>
              <ul>
                {dietGuide.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {result && (
          <section className="glass panel">
            <h2>Explainable Diagnostic Output</h2>
            <div className={`risk-chip tone-${riskTone(result.risk_level)}`}>
              Risk: <strong>{result.risk_level}</strong> | Score: <strong>{result.risk_score}</strong>
            </div>
            <div className="output-grid output-grid-main">
              <article className="info-card info-tall">
                <h3>Why This Result</h3>
                <ul>
                  {result.explanation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="info-card info-tall">
                <h3>Recommendations</h3>
                <ul>
                  {result.recommendation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="output-grid output-grid-secondary">
              <article className="info-card rules-card">
                <h3>Rule Trace</h3>
                <div className="rules-list">
                  {result.rule_trace.map((rule) => (
                    <div className="rule-row" key={rule.rule_id}>
                      <span className={rule.matched ? "pill match" : "pill miss"}>
                        {rule.rule_id} {rule.matched ? "Matched" : "Not Matched"}
                      </span>{" "}
                      <span className="rule-contribution">contribution={rule.contribution}</span>
                      <p className="rule-desc">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="info-card info-tall">
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

        <section className="glass panel">
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
      </section>
    </main>
  );
}
