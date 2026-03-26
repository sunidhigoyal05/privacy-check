from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import assessments, privacy_lab, bias_lab, governance, reports
from app.models import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="World Bank Privacy Risk Assessment Toolkit",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(assessments.router, prefix="/api/assessments", tags=["assessments"])
    app.include_router(privacy_lab.router, prefix="/api/privacy-lab", tags=["privacy-lab"])
    app.include_router(bias_lab.router, prefix="/api/bias-lab", tags=["bias-lab"])
    app.include_router(governance.router, prefix="/api/governance", tags=["governance"])
    app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

    @app.get("/api/health")
    async def health_check():
        return {"status": "ok", "app": settings.app_name, "version": settings.app_version}

    return app


app = create_app()
