import json
import logging
from app.services.llm_service import call_llm_json, is_llm_available, FALLBACK_BIAS_ANALYSIS
from app.prompts.templates import (
    BIAS_ANALYSIS_SYSTEM, BIAS_ANALYSIS_USER,
    STAKEHOLDER_SUGGESTION_SYSTEM, STAKEHOLDER_SUGGESTION_USER,
    PREMORTEM_SYSTEM, PREMORTEM_USER,
)

logger = logging.getLogger(__name__)


def _render(template: str, **kwargs) -> str:
    result = template
    for key, value in kwargs.items():
        result = result.replace("{{ " + key + " }}", str(value) if value else "Not specified")
    return result


async def analyze_bias(assessment, primary_users: list, affected_groups: list, indirectly_affected: list) -> dict:
    if not is_llm_available():
        logger.info("LLM unavailable, using fallback bias analysis")
        return FALLBACK_BIAS_ANALYSIS

    user_prompt = _render(
        BIAS_ANALYSIS_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        data_types=", ".join(assessment.data_types) if assessment.data_types else "None",
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        ai_involved=assessment.ai_involved,
        ai_details=json.dumps(assessment.ai_details) if assessment.ai_details else "None",
        primary_users=", ".join(primary_users) if primary_users else "Not specified",
        affected_groups=", ".join(affected_groups) if affected_groups else "Not specified",
        indirectly_affected_groups=", ".join(indirectly_affected) if indirectly_affected else "Not specified",
    )

    return await call_llm_json(BIAS_ANALYSIS_SYSTEM, user_prompt)


async def suggest_stakeholders(assessment, primary_users: list, affected_groups: list) -> dict:
    if not is_llm_available():
        return {
            "suggested_affected_groups": [
                {"group": "Local community members", "rationale": "May be affected by data collection activities"},
                {"group": "Government officials", "rationale": "May use or be impacted by project outcomes"},
            ],
            "suggested_indirect_groups": [
                {"group": "Family members of data subjects", "rationale": "Inferences about data subjects may affect their families"},
                {"group": "Future populations", "rationale": "Data retention and models may affect future beneficiaries"},
            ],
            "considerations": "Stakeholder analysis generated using rule-based defaults.",
        }

    user_prompt = _render(
        STAKEHOLDER_SUGGESTION_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        primary_users=", ".join(primary_users) if primary_users else "Not specified",
        affected_groups=", ".join(affected_groups) if affected_groups else "Not specified",
    )

    return await call_llm_json(STAKEHOLDER_SUGGESTION_SYSTEM, user_prompt)


async def run_premortem(assessment, primary_users: list, affected_groups: list,
                        privacy_summary: str, bias_summary: str, scenario_responses: dict | None = None) -> dict:
    if not is_llm_available():
        return {
            "failure_scenarios": [
                {
                    "title": "Data breach exposes sensitive beneficiary information",
                    "narrative": "After 2 years of operation, a misconfigured API endpoint allows unauthorized access to the database. Sensitive information of vulnerable populations is leaked, causing reputational damage and harm to affected individuals.",
                    "likelihood": 0.4, "impact": 0.9,
                    "category": "Security",
                    "preventative_suggestions": ["Implement regular penetration testing", "Enable API authentication on all endpoints", "Encrypt data at rest and in transit"],
                    "human_oversight_recommendations": ["Quarterly security audit by external firm", "Weekly access log review"],
                    "early_warning_indicators": ["Unusual API access patterns", "Failed authentication attempts spike"],
                },
                {
                    "title": "AI model produces biased outcomes for marginalized groups",
                    "narrative": "The model trained on historically biased data consistently underserves rural and indigenous populations. Complaints surface 18 months in, revealing systematic resource misallocation.",
                    "likelihood": 0.5, "impact": 0.8,
                    "category": "Bias",
                    "preventative_suggestions": ["Conduct fairness audits before deployment", "Test model across demographic segments", "Establish a community advisory board"],
                    "human_oversight_recommendations": ["Monthly fairness metric review", "Human review of edge cases"],
                    "early_warning_indicators": ["Disparate outcome rates across groups", "Increasing complaint volume from specific regions"],
                },
                {
                    "title": "Regulatory change invalidates data processing basis",
                    "narrative": "A new data protection law in a key operating country introduces stricter consent requirements. The project's existing consent mechanisms don't meet the new standard, requiring emergency remediation.",
                    "likelihood": 0.3, "impact": 0.7,
                    "category": "Legal",
                    "preventative_suggestions": ["Monitor regulatory developments actively", "Design flexible consent frameworks", "Build in data deletion capabilities"],
                    "human_oversight_recommendations": ["Legal review of regulatory changes quarterly", "Consent mechanism annual audit"],
                    "early_warning_indicators": ["Legislative proposals in operating countries", "Peer organization compliance actions"],
                },
                {
                    "title": "Mission creep leads to unauthorized data use",
                    "narrative": "Over 2 years, the project scope gradually expands. Data originally collected for one purpose is repurposed for new analyses without proper consent or review, violating data minimization principles.",
                    "likelihood": 0.6, "impact": 0.6,
                    "category": "Privacy",
                    "preventative_suggestions": ["Document data use purposes clearly", "Implement technical access controls per purpose", "Require privacy review for scope changes"],
                    "human_oversight_recommendations": ["Annual purpose limitation review", "Change management approval for new data uses"],
                    "early_warning_indicators": ["New data access requests outside original scope", "Feature creep in project plans"],
                },
            ],
            "analytical_summary": "The project faces moderate-to-high risk across security, bias, legal, and privacy dimensions. Priority areas are security hardening, bias testing, and purpose limitation enforcement.",
            "top_priorities": ["Security audit and penetration testing", "Fairness audit across demographic groups", "Purpose limitation documentation and enforcement"],
        }

    user_prompt = _render(
        PREMORTEM_USER,
        project_name=assessment.project_name,
        project_description=assessment.project_description,
        data_types=", ".join(assessment.data_types) if assessment.data_types else "None",
        data_subjects=", ".join(assessment.data_subjects) if assessment.data_subjects else "None",
        ai_involved=assessment.ai_involved,
        ai_details=json.dumps(assessment.ai_details) if assessment.ai_details else "None",
        primary_users=", ".join(primary_users) if primary_users else "Not specified",
        affected_groups=", ".join(affected_groups) if affected_groups else "Not specified",
        privacy_summary=privacy_summary,
        bias_summary=bias_summary,
        scenario_responses=json.dumps(scenario_responses) if scenario_responses else "No prior responses",
    )

    return await call_llm_json(PREMORTEM_SYSTEM, user_prompt)
