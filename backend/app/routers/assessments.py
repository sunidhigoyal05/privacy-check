from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import get_db, Assessment
from app.schemas import AssessmentCreate, AssessmentUpdate, AssessmentResponse

router = APIRouter()


@router.post("/", response_model=AssessmentResponse, status_code=201)
async def create_assessment(data: AssessmentCreate, db: AsyncSession = Depends(get_db)):
    assessment = Assessment(
        project_name=data.project_name,
        project_description=data.project_description,
        project_team=data.project_team,
        project_timeline=data.project_timeline,
        data_types=data.data_types,
        data_types_custom=data.data_types_custom,
        data_subjects=data.data_subjects,
        data_volume=data.data_volume,
        data_retention=data.data_retention,
        ai_involved=data.ai_involved,
        ai_details=data.ai_details.model_dump() if data.ai_details else None,
        regulatory_frameworks=data.regulatory_frameworks,
        existing_safeguards=data.existing_safeguards,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(assessment_id: str, data: AssessmentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    update_data = data.model_dump(exclude_unset=True)
    if "ai_details" in update_data and update_data["ai_details"]:
        update_data["ai_details"] = update_data["ai_details"].model_dump() if hasattr(update_data["ai_details"], "model_dump") else update_data["ai_details"]

    for key, value in update_data.items():
        setattr(assessment, key, value)

    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.get("/", response_model=list[AssessmentResponse])
async def list_assessments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Assessment).order_by(Assessment.updated_at.desc()))
    return result.scalars().all()
