import json
import logging
from app.services.llm_service import call_llm_json, is_llm_available, FALLBACK_PET_RECOMMENDATIONS
from app.prompts.templates import PET_SYSTEM, PET_USER

logger = logging.getLogger(__name__)


def _render(template: str, **kwargs) -> str:
    result = template
    for key, value in kwargs.items():
        result = result.replace("{{ " + key + " }}", str(value) if value else "Not specified")
    return result


async def recommend_pets(assessment, privacy_analysis: dict | None = None) -> dict:
    if not is_llm_available():
        logger.info("LLM unavailable, using fallback PET recommendations")
        return FALLBACK_PET_RECOMMENDATIONS

    privacy_summary = "No prior analysis available."
    if privacy_analysis:
        privacy_summary = json.dumps({
            "risk_scores": privacy_analysis.get("risk_scores", {}),
            "technical_debt": privacy_analysis.get("technical_debt", []),
            "summary": privacy_analysis.get("summary", ""),
        })

    user_prompt = _render(
        PET_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        data_types=", ".join(assessment.data_types) if assessment.data_types else "None",
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        data_volume=assessment.data_volume,
        ai_involved=assessment.ai_involved,
        ai_details=json.dumps(assessment.ai_details) if assessment.ai_details else "None",
        privacy_analysis_summary=privacy_summary,
        regulatory_frameworks=", ".join(assessment.regulatory_frameworks) if assessment.regulatory_frameworks else "None",
        existing_safeguards=", ".join(assessment.existing_safeguards) if assessment.existing_safeguards else "None",
    )

    return await call_llm_json(PET_SYSTEM, user_prompt)
