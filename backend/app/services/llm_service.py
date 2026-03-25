import json
import logging
from typing import Optional
from openai import AsyncOpenAI, AsyncAzureOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import settings

logger = logging.getLogger(__name__)


def _get_client():
    if settings.llm_provider == "azure" and settings.azure_openai_api_key:
        return AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            azure_endpoint=settings.azure_openai_endpoint,
            api_version=settings.azure_openai_api_version,
        )
    elif settings.openai_api_key:
        return AsyncOpenAI(api_key=settings.openai_api_key)
    return None


_client = _get_client()


def is_llm_available() -> bool:
    return _client is not None


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def call_llm(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    response_format: Optional[dict] = None,
) -> str:
    if not _client:
        raise RuntimeError("No LLM API key configured. Set OPENAI_API_KEY or AZURE_OPENAI_API_KEY.")

    model = settings.azure_openai_deployment if settings.llm_provider == "azure" else settings.llm_model
    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature or settings.llm_temperature,
        "max_tokens": max_tokens or settings.llm_max_tokens,
    }
    if response_format:
        kwargs["response_format"] = response_format

    response = await _client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


async def call_llm_json(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
) -> dict:
    """Call LLM and parse JSON response."""
    raw = await call_llm(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    return json.loads(raw)


# Fallback responses when LLM is unavailable
FALLBACK_PRIVACY_ANALYSIS = {
    "risk_scores": {
        "collection": 0.6, "storage": 0.7, "processing": 0.5,
        "sharing": 0.8, "retention": 0.6,
    },
    "risk_heatmap": [],
    "technical_debt": [
        {"issue": "No encryption at rest configured", "severity": "high"},
        {"issue": "Missing data access audit trail", "severity": "high"},
        {"issue": "No data retention policy defined", "severity": "medium"},
        {"issue": "Missing consent management flow", "severity": "medium"},
    ],
    "regulatory_gaps": [
        "Data Protection Impact Assessment (DPIA) not conducted",
        "Cross-border data transfer safeguards not specified",
        "Data subject rights procedures not documented",
    ],
    "summary": "Analysis generated using rule-based fallback. Configure an LLM API key for detailed, context-specific analysis.",
}

FALLBACK_PET_RECOMMENDATIONS = {
    "recommendations": [
        {
            "name": "Data Minimization",
            "suitability_score": 0.9,
            "rationale": "Fundamental practice — collect only what is necessary.",
            "use_case": "Reduce data footprint across all collection points.",
            "risk_mitigated": "Over-collection, unnecessary exposure",
            "architecture_pattern": "Apply at API gateway and form validation layers",
            "tradeoffs": "May require redesigning data collection forms; some analytics may lose granularity",
            "implementation_guidance": "Audit each data field for necessity. Remove or aggregate fields that aren't essential to the project objectives.",
            "implementation_guidance_detailed": "1. Catalog all data fields collected.\n2. For each field, document the business justification.\n3. Remove fields without justification.\n4. For retained fields, determine if aggregation or pseudonymization can reduce risk.\n5. Implement validation rules to reject unnecessary data at ingestion.",
            "deployment_considerations": "Requires coordination with data collection teams and form designers.",
            "human_oversight": "Regular quarterly review of collected data fields by Privacy Officer.",
            "monitoring_metrics": ["Number of data fields collected", "Data volume trends", "Access frequency per field"],
        },
        {
            "name": "Pseudonymization",
            "suitability_score": 0.85,
            "rationale": "Replaces identifiers with pseudonyms to reduce direct identification risk.",
            "use_case": "Processing personal data for analytics while limiting re-identification risk.",
            "risk_mitigated": "Direct identification from data breaches",
            "architecture_pattern": "Pseudonymization service between data ingestion and storage layers",
            "tradeoffs": "Reversible (unlike anonymization), so still counts as personal data under GDPR",
            "implementation_guidance": "Use a separate pseudonymization service with a secure key vault for the mapping table.",
            "implementation_guidance_detailed": "1. Identify all direct identifiers (name, email, ID numbers).\n2. Generate unique pseudonyms using cryptographic hashing with salt.\n3. Store the mapping table in a separate, access-controlled database.\n4. Apply pseudonymization at the data ingestion layer before storage.\n5. Implement access controls so only authorized processes can re-identify.",
            "deployment_considerations": "Key management is critical. Use HSM or cloud KMS for mapping key storage.",
            "human_oversight": "Access to re-identification mapping requires dual authorization.",
            "monitoring_metrics": ["Re-identification request count", "Mapping table access logs", "Pseudonym collision rate"],
        },
        {
            "name": "Differential Privacy",
            "suitability_score": 0.7,
            "rationale": "Adds mathematical noise to query results to prevent individual identification.",
            "use_case": "Aggregate analytics and reporting on sensitive datasets.",
            "risk_mitigated": "Inference attacks on aggregate statistics",
            "architecture_pattern": "Noise injection layer between database query engine and application",
            "tradeoffs": "Reduces accuracy of results; privacy budget must be carefully managed",
            "implementation_guidance": "Use established libraries (Google DP, OpenDP) rather than implementing from scratch.",
            "implementation_guidance_detailed": "1. Define the privacy budget (epsilon) based on sensitivity requirements.\n2. Integrate a DP library (e.g., Google's differential-privacy, OpenDP).\n3. Apply noise at the query layer, not at the raw data level.\n4. Track cumulative epsilon spend across queries.\n5. Implement query auditing to prevent budget exhaustion.\n6. Set minimum group sizes for query results.",
            "deployment_considerations": "Requires tuning epsilon per use case. Too much noise renders data unusable; too little doesn't protect privacy.",
            "human_oversight": "Privacy budget allocation requires Privacy Officer approval.",
            "monitoring_metrics": ["Epsilon budget consumed", "Query accuracy metrics", "Budget exhaustion warnings"],
        },
    ],
    "summary": "Recommendations generated using rule-based fallback. Configure an LLM API key for personalized recommendations.",
}

FALLBACK_BIAS_ANALYSIS = {
    "bias_risk_scenarios": [
        {"scenario": "Training data may not represent all affected populations equally", "likelihood": "high", "impact": "high"},
        {"scenario": "Historical biases in administrative data could perpetuate discrimination", "likelihood": "medium", "impact": "high"},
        {"scenario": "Model performance may vary across demographic groups", "likelihood": "medium", "impact": "medium"},
    ],
    "data_representation_questions": [
        "Does the training data proportionally represent all demographic groups?",
        "Are there known gaps in data coverage for marginalized populations?",
        "Has the data been tested for historical bias patterns?",
        "Are proxy variables (zip code, language) potentially encoding protected attributes?",
    ],
    "harm_scenarios": [
        {"category": "Allocative", "description": "Resources or opportunities may be unfairly distributed across groups"},
        {"category": "Representational", "description": "Certain groups may be stereotyped or made invisible by the system"},
        {"category": "Quality of Service", "description": "System may work less accurately for underrepresented populations"},
    ],
    "fairness_practices": [
        "Conduct demographic parity analysis across all protected groups",
        "Implement equalized odds testing before deployment",
        "Establish a diverse review board for model outputs",
        "Create feedback mechanisms for affected communities",
    ],
    "engagement_recommendations": [
        "Conduct stakeholder consultations with affected communities before deployment",
        "Establish ongoing feedback channels post-deployment",
        "Include diverse perspectives in model evaluation teams",
    ],
    "summary": "Analysis generated using rule-based fallback.",
}

FALLBACK_GOVERNANCE_MAP = {
    "raci_matrix": {
        "roles": ["Project Lead", "Privacy Officer", "IT Security", "Legal", "Data Steward", "External Auditor"],
        "responsibilities": {
            "Data Collection": {"Project Lead": "A", "Privacy Officer": "C", "IT Security": "I", "Legal": "C", "Data Steward": "R", "External Auditor": "I"},
            "Consent Management": {"Project Lead": "I", "Privacy Officer": "A", "IT Security": "I", "Legal": "R", "Data Steward": "R", "External Auditor": "I"},
            "Access Control": {"Project Lead": "I", "Privacy Officer": "C", "IT Security": "R", "Legal": "I", "Data Steward": "A", "External Auditor": "I"},
            "Breach Response": {"Project Lead": "I", "Privacy Officer": "A", "IT Security": "R", "Legal": "R", "Data Steward": "C", "External Auditor": "I"},
            "Audit & Compliance": {"Project Lead": "I", "Privacy Officer": "R", "IT Security": "C", "Legal": "C", "Data Steward": "I", "External Auditor": "A"},
            "Model Governance": {"Project Lead": "A", "Privacy Officer": "R", "IT Security": "C", "Legal": "C", "Data Steward": "C", "External Auditor": "I"},
        },
    },
    "decision_rights": [
        {"decision": "Data access approval", "owner": "Data Steward", "escalation": "Privacy Officer"},
        {"decision": "Model retraining authorization", "owner": "Project Lead", "escalation": "Privacy Officer"},
        {"decision": "Privacy incident escalation", "owner": "Privacy Officer", "escalation": "Legal"},
        {"decision": "Third-party data sharing", "owner": "Legal", "escalation": "Data Controller"},
    ],
    "accountability_checklist": [
        {"item": "Data Protection Impact Assessment (DPIA) completed", "owner": "Privacy Officer", "done": False},
        {"item": "Data processing agreements with third parties signed", "owner": "Legal", "done": False},
        {"item": "Access control policies documented and implemented", "owner": "IT Security", "done": False},
        {"item": "Consent mechanisms tested and operational", "owner": "Data Steward", "done": False},
        {"item": "Incident response plan documented", "owner": "IT Security", "done": False},
        {"item": "Staff privacy training completed", "owner": "Project Lead", "done": False},
    ],
    "summary": "Governance map generated using rule-based defaults.",
}
