import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.database import Base


def utcnow():
    return datetime.now(timezone.utc)


def new_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    assessments = relationship("Assessment", back_populates="user")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # nullable for anonymous
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    status = Column(String, default="in_progress")  # in_progress, completed

    # Project Intake
    project_name = Column(String, nullable=False)
    project_description = Column(Text, nullable=True)
    project_team = Column(String, nullable=True)
    project_timeline = Column(String, nullable=True)

    data_types = Column(JSON, default=list)           # ["pii", "financial", "health", ...]
    data_types_custom = Column(Text, nullable=True)
    data_subjects = Column(JSON, default=list)         # ["employees", "citizens", ...]
    data_volume = Column(String, nullable=True)
    data_retention = Column(String, nullable=True)

    ai_involved = Column(Boolean, default=False)
    ai_details = Column(JSON, nullable=True)           # {model_type, training_data, automated_decisions, ...}

    regulatory_frameworks = Column(JSON, default=list)  # ["gdpr", "wbg_policy", ...]
    existing_safeguards = Column(JSON, default=list)

    # Analysis Results (cached LLM outputs)
    privacy_analysis = Column(JSON, nullable=True)
    pet_recommendations = Column(JSON, nullable=True)
    bias_analysis = Column(JSON, nullable=True)
    stakeholder_map = Column(JSON, nullable=True)
    premortem_analysis = Column(JSON, nullable=True)
    governance_map = Column(JSON, nullable=True)

    user = relationship("User", back_populates="assessments")
