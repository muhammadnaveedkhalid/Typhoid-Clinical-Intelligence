from typing import List, Tuple
from app.models import SymptomInput, RuleTrace


def evaluate_typhoid_rules(data: SymptomInput) -> Tuple[float, str, List[str], List[RuleTrace]]:
    trace: List[RuleTrace] = []
    explanation: List[str] = []
    score = 0.0

    # Core assignment rules
    rule_1_matched = data.high_fever and data.abdominal_pain and data.weakness_fatigue
    rule_1_weight = 0.45
    trace.append(
        RuleTrace(
            rule_id="R1",
            description="IF fever AND abdominal pain AND weakness THEN Typhoid Risk = High",
            matched=rule_1_matched,
            weight=rule_1_weight,
            contribution=rule_1_weight if rule_1_matched else 0.0,
        )
    )
    if rule_1_matched:
        score += rule_1_weight
        explanation.append("High fever + abdominal pain + weakness pattern strongly matches Typhoid profile.")

    rule_2_matched = data.high_fever and data.headache and data.nausea_vomiting
    rule_2_weight = 0.25
    trace.append(
        RuleTrace(
            rule_id="R2",
            description="IF fever AND headache AND nausea THEN Typhoid Risk = Medium",
            matched=rule_2_matched,
            weight=rule_2_weight,
            contribution=rule_2_weight if rule_2_matched else 0.0,
        )
    )
    if rule_2_matched:
        score += rule_2_weight
        explanation.append("Fever + headache + nausea suggests medium Typhoid risk.")

    mild_only = data.weakness_fatigue or data.loss_of_appetite
    rule_3_matched = mild_only and not (rule_1_matched or rule_2_matched)
    rule_3_weight = 0.10
    trace.append(
        RuleTrace(
            rule_id="R3",
            description="IF mild symptoms only (fatigue/loss of appetite) THEN Typhoid Risk = Low",
            matched=rule_3_matched,
            weight=rule_3_weight,
            contribution=rule_3_weight if rule_3_matched else 0.0,
        )
    )
    if rule_3_matched:
        score += rule_3_weight
        explanation.append("Only mild symptoms present; may indicate early or low-risk stage.")

    # Hybrid explainable additions (clinical indicators)
    indicators = [
        ("R4", data.persistent_fever_over_101f, "Persistent fever >101F", 0.08),
        ("R5", data.gi_discomfort, "Gastrointestinal discomfort", 0.05),
        ("R6", data.low_platelet_count, "Low platelet count", 0.04),
        ("R7", data.positive_widal_or_blood_culture, "Positive Widal/Blood Culture", 0.20),
        ("R8", data.contaminated_food_water_exposure, "Exposure to contaminated food/water", 0.08),
    ]

    for rule_id, matched, desc, weight in indicators:
        trace.append(
            RuleTrace(
                rule_id=rule_id,
                description=f"Clinical indicator: {desc}",
                matched=matched,
                weight=weight,
                contribution=weight if matched else 0.0,
            )
        )
        if matched:
            score += weight
            explanation.append(f"Clinical indicator present: {desc}.")

    score = min(score, 1.0)

    if score >= 0.7:
        risk = "High"
    elif score >= 0.35:
        risk = "Medium"
    else:
        risk = "Low"

    return score, risk, explanation, trace
