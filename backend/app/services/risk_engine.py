import json
import logging
from app.services.llm_service import call_llm_json, is_llm_available, FALLBACK_PRIVACY_ANALYSIS
from app.prompts.templates import PRIVACY_ANALYSIS_SYSTEM, PRIVACY_ANALYSIS_USER

logger = logging.getLogger(__name__)


def _render(template: str, **kwargs) -> str:
    """Simple Jinja-style template rendering."""
    result = template
    for key, value in kwargs.items():
        placeholder = "{{ " + key + " }}"
        result = result.replace(placeholder, str(value) if value else "Not specified")
    return result


async def analyze_privacy_risks(assessment) -> dict:
    if not is_llm_available():
        logger.info("LLM unavailable, using fallback privacy analysis")
        return _build_fallback(assessment)

    user_prompt = _render(
        PRIVACY_ANALYSIS_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        project_team=assessment.project_team,
        project_timeline=assessment.project_timeline,
        data_types=", ".join(assessment.data_types) if assessment.data_types else "None",
        data_types_custom=assessment.data_types_custom,
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        data_volume=assessment.data_volume,
        data_retention=assessment.data_retention,
        ai_involved=assessment.ai_involved,
        ai_details=json.dumps(assessment.ai_details) if assessment.ai_details else "None",
        regulatory_frameworks=", ".join(assessment.regulatory_frameworks) if assessment.regulatory_frameworks else "None",
        existing_safeguards=", ".join(assessment.existing_safeguards) if assessment.existing_safeguards else "None",
    )

    return await call_llm_json(PRIVACY_ANALYSIS_SYSTEM, user_prompt)


def _build_fallback(assessment) -> dict:
    """Build a rule-based fallback risk analysis."""
    result = dict(FALLBACK_PRIVACY_ANALYSIS)

    heatmap = []
    risk_levels = {
        "pii": {"collection": 0.8, "storage": 0.9, "processing": 0.7, "sharing": 0.9, "retention": 0.8},
        "financial": {"collection": 0.7, "storage": 0.8, "processing": 0.6, "sharing": 0.9, "retention": 0.7},
        "health": {"collection": 0.9, "storage": 0.9, "processing": 0.8, "sharing": 0.95, "retention": 0.85},
        "biometric": {"collection": 0.9, "storage": 0.95, "processing": 0.8, "sharing": 0.95, "retention": 0.9},
        "location": {"collection": 0.7, "storage": 0.7, "processing": 0.6, "sharing": 0.8, "retention": 0.6},
        "behavioral": {"collection": 0.6, "storage": 0.6, "processing": 0.7, "sharing": 0.7, "retention": 0.5},
    }
    default_risk = {"collection": 0.5, "storage": 0.5, "processing": 0.4, "sharing": 0.6, "retention": 0.5}

    for dt in (assessment.data_types or []):
        risks = risk_levels.get(dt.lower(), default_risk)
        heatmap.append({"data_type": dt, **risks})

    result["risk_heatmap"] = heatmap

    # Adjust overall scores based on data types
    if heatmap:
        for stage in ["collection", "storage", "processing", "sharing", "retention"]:
            result["risk_scores"][stage] = round(
                sum(row[stage] for row in heatmap) / len(heatmap), 2
            )

    return result
