import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import get_db, Assessment
from app.schemas import BiasAnalysisRequest, PreMortemRequest, StakeholderSuggestionRequest
from app.services.bias_engine import analyze_bias, suggest_stakeholders, run_premortem

router = APIRouter()


@router.post("/analyze")
async def run_bias_analysis(req: BiasAnalysisRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    analysis = await analyze_bias(
        assessment,
        primary_users=req.primary_users,
        affected_groups=req.affected_groups,
        indirectly_affected=req.indirectly_affected_groups,
    )

    assessment.bias_analysis = analysis
    assessment.stakeholder_map = {
        "primary_users": req.primary_users,
        "affected_groups": req.affected_groups,
        "indirectly_affected_groups": req.indirectly_affected_groups,
    }
    await db.commit()

    return analysis


@router.post("/suggest-stakeholders")
async def get_stakeholder_suggestions(req: StakeholderSuggestionRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    suggestions = await suggest_stakeholders(assessment, req.primary_users, req.affected_groups)
    return suggestions


@router.post("/premortem")
async def run_premortem_analysis(req: PreMortemRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    privacy_summary = json.dumps(assessment.privacy_analysis.get("summary", "")) if assessment.privacy_analysis else "Not completed"
    bias_summary = json.dumps(assessment.bias_analysis.get("summary", "")) if assessment.bias_analysis else "Not completed"

    stakeholder = assessment.stakeholder_map or {}
    premortem = await run_premortem(
        assessment,
        primary_users=stakeholder.get("primary_users", []),
        affected_groups=stakeholder.get("affected_groups", []),
        privacy_summary=privacy_summary,
        bias_summary=bias_summary,
        scenario_responses=req.scenario_responses,
    )

    assessment.premortem_analysis = premortem
    await db.commit()

    return premortem


@router.get("/{assessment_id}")
async def get_bias_results(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "bias_analysis": assessment.bias_analysis,
        "stakeholder_map": assessment.stakeholder_map,
        "premortem_analysis": assessment.premortem_analysis,
    }
