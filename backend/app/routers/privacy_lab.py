from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import get_db, Assessment
from app.schemas import PrivacyAnalysisRequest
from app.services.risk_engine import analyze_privacy_risks
from app.services.pet_engine import recommend_pets

router = APIRouter()


@router.post("/analyze")
async def run_privacy_analysis(req: PrivacyAnalysisRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    analysis = await analyze_privacy_risks(assessment)
    assessment.privacy_analysis = analysis
    await db.commit()

    return analysis


@router.post("/pet-recommendations")
async def get_pet_recommendations(req: PrivacyAnalysisRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    recs = await recommend_pets(assessment, assessment.privacy_analysis)
    assessment.pet_recommendations = recs
    await db.commit()

    return recs


@router.get("/{assessment_id}")
async def get_privacy_results(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "privacy_analysis": assessment.privacy_analysis,
        "pet_recommendations": assessment.pet_recommendations,
    }
