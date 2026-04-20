# System Architecture - Typhoid Explainable Hybrid KBS

## Multi-Layer Design

1. **Data Collection Layer**
   - Patient symptoms
   - Exposure history
   - Lab indicators (Widal/Blood culture/CBC)

2. **Knowledge Base Layer**
   - Declarative medical facts
   - IF-THEN rules for Typhoid Fever
   - WHO guideline text snippets (from PDF)

3. **Inference Engine Layer**
   - Rule matching and score aggregation
   - Hybrid evidence scoring from symptoms + indicators

4. **Risk Stratification / Decision Layer**
   - Low, Medium, High risk output
   - Clinical recommendations and suggested tests

5. **Explanation Layer**
   - Rule trace (matched/not matched)
   - Contribution score per rule
   - Natural-language explanation for each conclusion

6. **User Interface Layer**
   - React dashboard for symptom entry
   - Displays risk, explanation, rule trace, and recommendations

## Separation of Knowledge and Reasoning

- Knowledge is stored as explicit facts and rules in `backend/app/rules.py`.
- Reasoning is executed by the inference logic in the same module and exposed via `main.py`.
- This supports maintainability and future extension to other infectious diseases.

## Future Hybrid Extension

- Add ML model (e.g., decision tree / random forest) trained on HF datasets
- Blend ML probability with rule score
- Keep explainability by combining SHAP/LIME + rule trace
