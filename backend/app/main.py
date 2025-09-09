# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.tracker.routes import router as tracker_router
from app.api.dashboard import router as dashboard_router
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.settings import router as settings_router


# Test request model
class TestRequest(BaseModel):
    test: str


def create_app():
    # Create the FastAPI app instance
    app = FastAPI(title="FinanceTracker API", version="1.0.0")

    # --- Middleware Configuration ---
    # Add CORS middleware with explicit configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # --- Routes / Endpoints ---
    # Include routers
    app.include_router(auth_router)
    app.include_router(tracker_router)
    app.include_router(dashboard_router)
    app.include_router(settings_router, prefix="/api")   # ✅ register it here
    # Basic health check endpoint
    @app.get("/", tags=["Health"])
    async def root():
        return {
            "message": "Welcome to the LifeSync Personal Finance Tracker API",
            "version": app.version,
        }

    @app.get("/api/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "service": "LifeSync Finance API"}

    # Test POST endpoint for CORS testing
    @app.post("/api/health", tags=["Health"])
    async def health_check_post(request: TestRequest):
        return {
            "status": "healthy",
            "service": "LifeSync Finance API",
            "received": request.test,
            "method": "POST",
        }

    # Explicit OPTIONS handler for testing
    @app.options("/api/health", tags=["Health"])
    async def health_options():
        return {"message": "OPTIONS request successful"}

    return app


# This part is often handled by uvicorn command line, but can be useful for direct script execution
app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL,
    )
