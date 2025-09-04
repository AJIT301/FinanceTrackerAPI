# backend/app/main.pyfrom fastapi.middleware.cors import CORSMiddleware


from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi import FastAPI


from app.core.config import settings

def create_app():
    # Create the FastAPI app instance
    app = FastAPI(title="FinanceTracker API")

# --- Middleware Configuration ---
# Load allowed origins from .env (comma-separated string → list)
    app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    # --- Routes / Endpoints ---

    # Basic health check endpoint
    @app.get("/", tags=["Health"])
    async def root():
        """
        Root endpoint for basic health check and API introduction.
        """
        return {"message": "Welcome to the LifeSync Personal Finance Tracker API", "version": app.version}

    @app.get("/api/health", tags=["Health"])
    async def health_check():
        """
        Dedicated health check endpoint.
        """
        return {"status": "healthy", "service": "LifeSync Finance API"}

    # TODO: Include your API routers here later
    # from app.api.tracker.routes import router as tracker_router
    # app.include_router(tracker_router)

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