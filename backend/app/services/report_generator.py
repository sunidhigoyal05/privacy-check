import json
import logging
from app.services.llm_service import call_llm_json, is_llm_available
from app.prompts.templates import REPORT_SUMMARY_SYSTEM, REPORT_SUMMARY_USER

logger = logging.getLogger(__name__)


def _render(template: str, **kwargs) -> str:
    result = template
    for key, value in kwargs.items():
        result = result.replace("{{ " + key + " }}", str(value) if value else "Not specified")
    return result


async def generate_executive_summary(assessment) -> dict:
    if not is_llm_available():
        return {
            "executive_summary": (
                f"This report presents the privacy risk assessment for the {assessment.project_name} project. "
                "The assessment covers data privacy risks, privacy enhancing technology recommendations, "
                "bias and inclusion analysis, and governance accountability mapping.\n\n"
                "Key areas of concern have been identified across data handling practices, and specific "
                "recommendations have been provided to mitigate identified risks. The governance framework "
                "outlines clear roles and responsibilities for ongoing oversight.\n\n"
                "This summary was generated using rule-based analysis. For more detailed, context-specific "
                "insights, configure an LLM API key."
            ),
            "key_findings": [
                "Data handling practices require enhanced privacy controls",
                "Privacy enhancing technologies have been recommended based on data types",
                "Governance framework needs formalization with clear RACI assignments",
            ],
            "priority_actions": [
                "Implement recommended privacy enhancing technologies",
                "Formalize governance roles and responsibilities",
                "Conduct regular privacy impact assessments",
            ],
            "overall_risk_level": "medium",
        }

    user_prompt = _render(
        REPORT_SUMMARY_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        privacy_summary=json.dumps(assessment.privacy_analysis.get("summary", "")) if assessment.privacy_analysis else "Not completed",
        pet_summary=json.dumps(assessment.pet_recommendations.get("summary", "")) if assessment.pet_recommendations else "Not completed",
        bias_summary=json.dumps(assessment.bias_analysis.get("summary", "")) if assessment.bias_analysis else "Not completed",
        premortem_summary=json.dumps(assessment.premortem_analysis.get("analytical_summary", "")) if assessment.premortem_analysis else "Not completed",
        governance_summary=json.dumps(assessment.governance_map.get("summary", "")) if assessment.governance_map else "Not completed",
    )

    return await call_llm_json(REPORT_SUMMARY_SYSTEM, user_prompt)


def build_full_report(assessment, executive_summary: dict) -> dict:
    """Assemble all sections into a full report structure."""
    return {
        "project_info": {
            "name": assessment.project_name,
            "description": assessment.project_description,
            "team": assessment.project_team,
            "timeline": assessment.project_timeline,
            "data_types": assessment.data_types,
            "data_subjects": assessment.data_subjects,
            "ai_involved": assessment.ai_involved,
        },
        "executive_summary": executive_summary,
        "privacy_analysis": assessment.privacy_analysis,
        "pet_recommendations": assessment.pet_recommendations,
        "bias_analysis": assessment.bias_analysis,
        "stakeholder_map": assessment.stakeholder_map,
        "premortem_analysis": assessment.premortem_analysis,
        "governance_map": assessment.governance_map,
    }
