import json
import logging
from app.services.llm_service import call_llm_json, is_llm_available, FALLBACK_GOVERNANCE_MAP
from app.prompts.templates import GOVERNANCE_SYSTEM, GOVERNANCE_USER

logger = logging.getLogger(__name__)


def _render(template: str, **kwargs) -> str:
    result = template
    for key, value in kwargs.items():
        result = result.replace("{{ " + key + " }}", str(value) if value else "Not specified")
    return result


async def generate_governance_map(assessment, roles: list | None = None, responsibilities: list | None = None) -> dict:
    if not is_llm_available():
        logger.info("LLM unavailable, using fallback governance map")
        return FALLBACK_GOVERNANCE_MAP

    user_prompt = _render(
        GOVERNANCE_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        data_types=", ".join(assessment.data_types) if assessment.data_types else "None",
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        ai_involved=assessment.ai_involved,
        roles=", ".join(roles) if roles else "Use standard governance roles",
        responsibilities=", ".join(responsibilities) if responsibilities else "Determine based on project scope",
        regulatory_frameworks=", ".join(assessment.regulatory_frameworks) if assessment.regulatory_frameworks else "None",
    )

    return await call_llm_json(GOVERNANCE_SYSTEM, user_prompt)
