"""
AquaSentinel AI — FastAPI Application Entry Point.
AI-powered waterborne disease outbreak prediction system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.utils.database import engine, Base
from app.routes.predict import router as predict_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    yield
    print("👋 Shutting down AquaSentinel AI")


app = FastAPI(
    title="AquaSentinel AI",
    description=(
        "AI-powered waterborne disease outbreak prediction system. "
        "Analyzes environmental data (rainfall, pH, contamination, disease cases) "
        "to predict risk levels and generate actionable alerts."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(predict_router)


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AquaSentinel AI",
        "version": "1.0.0",
    }
