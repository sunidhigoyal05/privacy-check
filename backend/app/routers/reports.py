from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import get_db, Assessment
from app.services.report_generator import generate_executive_summary, build_full_report

router = APIRouter()


@router.post("/{assessment_id}/generate")
async def generate_report(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    exec_summary = await generate_executive_summary(assessment)
    full_report = build_full_report(assessment, exec_summary)

    return full_report


@router.get("/{assessment_id}/dashboard")
async def get_dashboard_data(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Compute overall risk score
    overall_risk = 0.0
    module_count = 0

    privacy_risk = 0.0
    if assessment.privacy_analysis and "risk_scores" in assessment.privacy_analysis:
        scores = assessment.privacy_analysis["risk_scores"]
        privacy_risk = sum(scores.values()) / len(scores) if scores else 0.0
        overall_risk += privacy_risk
        module_count += 1

    bias_risk = 0.0
    if assessment.bias_analysis and "bias_risk_scenarios" in assessment.bias_analysis:
        scenarios = assessment.bias_analysis["bias_risk_scenarios"]
        risk_map = {"high": 0.9, "medium": 0.6, "low": 0.3}
        if scenarios:
            bias_risk = sum(risk_map.get(s.get("impact", "medium"), 0.5) for s in scenarios) / len(scenarios)
            overall_risk += bias_risk
            module_count += 1

    premortem_risk = 0.0
    if assessment.premortem_analysis and "failure_scenarios" in assessment.premortem_analysis:
        scenarios = assessment.premortem_analysis["failure_scenarios"]
        if scenarios:
            premortem_risk = sum(s.get("impact", 0.5) * s.get("likelihood", 0.5) for s in scenarios) / len(scenarios)
            overall_risk += premortem_risk
            module_count += 1

    if module_count > 0:
        overall_risk /= module_count

    return {
        "overall_risk_score": round(overall_risk, 2),
        "module_scores": {
            "privacy": round(privacy_risk, 2),
            "bias": round(bias_risk, 2),
            "premortem": round(premortem_risk, 2),
        },
        "completion_status": {
            "intake": True,
            "privacy_lab": assessment.privacy_analysis is not None,
            "pet_recommendations": assessment.pet_recommendations is not None,
            "bias_lab": assessment.bias_analysis is not None,
            "premortem": assessment.premortem_analysis is not None,
            "governance": assessment.governance_map is not None,
        },
        "privacy_analysis": assessment.privacy_analysis,
        "pet_recommendations": assessment.pet_recommendations,
        "bias_analysis": assessment.bias_analysis,
        "stakeholder_map": assessment.stakeholder_map,
        "premortem_analysis": assessment.premortem_analysis,
        "governance_map": assessment.governance_map,
    }
