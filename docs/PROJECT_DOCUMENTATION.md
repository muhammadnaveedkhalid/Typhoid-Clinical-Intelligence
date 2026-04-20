# Project Documentation

## 1) Problem Statement

Design and develop an explainable hybrid knowledge-based decision support system for infectious disease diagnosis, with Typhoid Fever as the selected case.

## 2) Objectives

- Build a transparent diagnosis support prototype for Typhoid Fever.
- Encode expert knowledge using declarative facts and IF-THEN rules.
- Provide explanation for each diagnostic result.
- Integrate real-time data preview from Hugging Face.
- Integrate WHO guideline PDF text for evidence alignment.

## 3) Core Theory Mapping (Assignment Alignment)

### What is a KBS?
A system that stores explicit domain knowledge and uses inference to make recommendations with explanations.

### KBS vs Conventional Software
- KBS stores domain knowledge explicitly and reasons over it.
- Conventional software uses fixed procedural logic and rarely explains outcomes.

### Why Explainability?
- Builds trust in clinicians.
- Supports accountability and safer decision support.
- Allows users to inspect rule-level evidence.

## 4) Typhoid Medical Knowledge (Current Encoding)

### Symptoms
- High fever
- Abdominal pain
- Weakness/fatigue
- Headache
- Loss of appetite
- Nausea/vomiting
- Diarrhea/constipation

### Diagnostic Indicators
- Persistent fever over 101F
- Gastrointestinal discomfort
- Low platelet count
- Positive Widal or blood culture
- Exposure to contaminated food/water

### IF-THEN Rule Set
- R1: IF fever AND abdominal pain AND weakness THEN High risk evidence
- R2: IF fever AND headache AND nausea THEN Medium risk evidence
- R3: IF mild symptoms only (fatigue/loss of appetite) THEN Low risk evidence
- R4-R8: Clinical indicator evidence rules

## 5) Knowledge Engineering Process Coverage

1. **Acquisition:** WHO text + assignment knowledge + research logic
2. **Representation:** Declarative facts and production rules
3. **Validation:** Rule trace output for manual expert verification
4. **Implementation:** FastAPI backend + React frontend

## 6) Semantic/Logical Formalization Support

The design can be represented in predicate form:
- `HasSymptom(Patient, HighFever)`
- `PositiveTest(Patient, BloodTest)`
- `HasDisease(Patient, TyphoidFever)`

Rule mapping example:
- `forall x: HasSymptom(x, HighFever) and HasSymptom(x, AbdominalPain) and PositiveTest(x, BloodTest) -> HasDisease(x, TyphoidFever)`

## 7) APIs

- `POST /api/diagnose`
  - Input: symptom/indicator booleans
  - Output: risk score, risk level, explanation, rule trace, recommendation

- `GET /api/dataset`
  - Returns live rows from HF dataset server (or fallback sample rows)

## 8) Frontend UX

- Checkbox-based symptom entry
- One-click explainable diagnosis
- Display:
  - Risk level and score
  - Explanation bullets
  - Rule-by-rule trace
  - WHO PDF snippets
  - Hugging Face dataset preview

## 9) Research Awareness Integration

This architecture combines:
- Explainable strength of classic expert systems
- Data connectivity of modern AI ecosystem (Hugging Face)
- Extensible design to add ML models later

## 10) Limitations (Current Prototype)

- Rule weights are manually assigned.
- WHO extraction currently snippet-based (not deep semantic retrieval).
- No deployed ML model yet (hybrid-ready architecture only).

## 11) Next Milestones

1. Add ML model endpoint (`/api/predict-ml`) with probability output.
2. Add hybrid fusion formula (`final = alpha*rule_score + (1-alpha)*ml_score`).
3. Add evaluation metrics (accuracy, precision, recall, F1).
4. Add admin panel for dynamic rule editing and certainty factors.
5. Add report export (PDF) for assignment submission.
