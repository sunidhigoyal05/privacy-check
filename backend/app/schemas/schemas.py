from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIDetails(BaseModel):
    model_type: Optional[str] = None
    training_data_description: Optional[str] = None
    automated_decisions: Optional[bool] = False
    decision_description: Optional[str] = None
    model_transparency: Optional[str] = None


class AssessmentCreate(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=200)
    project_description: Optional[str] = None
    project_team: Optional[str] = None
    project_timeline: Optional[str] = None

    data_types: list[str] = []
    data_types_custom: Optional[str] = None
    data_subjects: list[str] = []
    data_volume: Optional[str] = None
    data_retention: Optional[str] = None

    ai_involved: bool = False
    ai_details: Optional[AIDetails] = None

    regulatory_frameworks: list[str] = []
    existing_safeguards: list[str] = []


class AssessmentUpdate(BaseModel):
    project_name: Optional[str] = None
    project_description: Optional[str] = None
    project_team: Optional[str] = None
    project_timeline: Optional[str] = None

    data_types: Optional[list[str]] = None
    data_types_custom: Optional[str] = None
    data_subjects: Optional[list[str]] = None
    data_volume: Optional[str] = None
    data_retention: Optional[str] = None

    ai_involved: Optional[bool] = None
    ai_details: Optional[AIDetails] = None

    regulatory_frameworks: Optional[list[str]] = None
    existing_safeguards: Optional[list[str]] = None
    status: Optional[str] = None


class AssessmentResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status: str

    project_name: str
    project_description: Optional[str] = None
    project_team: Optional[str] = None
    project_timeline: Optional[str] = None

    data_types: list[str] = []
    data_types_custom: Optional[str] = None
    data_subjects: list[str] = []
    data_volume: Optional[str] = None
    data_retention: Optional[str] = None

    ai_involved: bool = False
    ai_details: Optional[AIDetails] = None

    regulatory_frameworks: list[str] = []
    existing_safeguards: list[str] = []

    privacy_analysis: Optional[dict] = None
    pet_recommendations: Optional[dict] = None
    bias_analysis: Optional[dict] = None
    stakeholder_map: Optional[dict] = None
    premortem_analysis: Optional[dict] = None
    governance_map: Optional[dict] = None

    model_config = {"from_attributes": True}


# Auth schemas
class UserCreate(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Analysis request schemas
class PrivacyAnalysisRequest(BaseModel):
    assessment_id: str


class BiasAnalysisRequest(BaseModel):
    assessment_id: str
    primary_users: list[str] = []
    affected_groups: list[str] = []
    indirectly_affected_groups: list[str] = []


class PreMortemRequest(BaseModel):
    assessment_id: str
    scenario_responses: Optional[dict] = None


class GovernanceRequest(BaseModel):
    assessment_id: str
    roles: list[str] = []
    responsibilities: list[str] = []


class StakeholderSuggestionRequest(BaseModel):
    assessment_id: str
    primary_users: list[str] = []
    affected_groups: list[str] = []
