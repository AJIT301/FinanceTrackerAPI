# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.tracker.routes import router as tracker

def create_app():
    # Create the FastAPI app instance
    app = FastAPI(
        title="LifeSync Personal Finance Tracker API",
        description="API for managing personal finances, transactions, and budgets.",
        version="0.0.1",
    )

    # --- Middleware Configuration ---

    # Configure CORS to allow your React frontend (running on Vite's default port)
    # Adjust the origin list as needed for development/production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Add your frontend URL(s)
        allow_credentials=True,
        allow_methods=["*"], # Allow all methods (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"], # Allow all headers
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
    import os

    # Get host and port from environment variables or use defaults
    host = os.getenv("HOST", "127.0.0.1") # Use 0.0.0.0 if you need external access
    port = int(os.getenv("PORT", 8001))   # Use a port other than 8000 if needed

    print(f"Starting LifeSync Finance API on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True) # reload=True for development
