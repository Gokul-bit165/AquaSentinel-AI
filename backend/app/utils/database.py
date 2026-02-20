"""
Database connection utilities for AquaSentinel AI.
Uses SQLAlchemy with SQLite for hackathon-friendly zero-config setup.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database file lives alongside the app
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aqua_sentinel.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency: yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
