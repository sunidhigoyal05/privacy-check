from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import get_db, Assessment
from app.schemas import GovernanceRequest
from app.services.governance_engine import generate_governance_map

router = APIRouter()


@router.post("/generate")
async def create_governance_map(req: GovernanceRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == req.assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    gov_map = await generate_governance_map(assessment, req.roles, req.responsibilities)
    assessment.governance_map = gov_map
    await db.commit()

    return gov_map


@router.get("/{assessment_id}")
async def get_governance_results(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {"governance_map": assessment.governance_map}
