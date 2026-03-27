# PrivacyCheck

A comprehensive privacy risk assessment toolkit designed for the World Bank. PrivacyCheck helps teams evaluate data privacy risks, AI bias concerns, and governance requirements through an intuitive, guided workflow.

## Features

- **Intake Wizard** - Guided assessment creation with voice input support
- **Privacy Engineering Lab** - Analyze privacy risks and get PET (Privacy-Enhancing Technology) recommendations
- **Bias & Inclusion Lab** - Evaluate AI/ML systems for bias with pre-mortem analysis
- **Governance & Accountability** - Map stakeholders and define accountability structures
- **Joint Dashboard** - Unified view of privacy and bias risk scores with interactive visualizations
- **Report Generation** - Export comprehensive PDF reports

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- NextUI + Tailwind CSS
- Zustand (state management)
- Recharts (visualizations)
- Web Speech API (voice input)

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite (async)
- OpenAI / Azure OpenAI for LLM-powered analysis
- WeasyPrint (PDF generation)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key (optional, for AI-powered analysis)

### Backend Setup

```bash

privacy-check/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── config.py         # Settings & env vars
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routers/          # API endpoints
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic & LLM services
│   │   └── prompts/          # LLM prompt templates
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks (speech-to-text)
│   │   ├── services/         # API client
│   │   ├── store/            # Zustand store
│   │   └── types/            # TypeScript types
│   └── package.json
└── README.md

API Endpoints
Endpoint	Description
POST /api/assessments	Create new assessment
GET /api/assessments	List all assessments
GET /api/assessments/{id}	Get assessment by ID
PUT /api/assessments/{id}	Update assessment
DELETE /api/assessments/{id}	Delete assessment
POST /api/privacy-lab/analyze	Run privacy risk analysis
POST /api/bias-lab/analyze	Run bias analysis
POST /api/governance/analyze	Generate governance map
POST /api/reports/generate	Generate PDF report
