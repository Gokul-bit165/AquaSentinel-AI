"""
SQLAlchemy ORM models for AquaSentinel AI.
Defines the Prediction and Alert tables.
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.utils.database import Base


class Prediction(Base):
    """Stores each prediction request and its result."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rainfall = Column(Float, nullable=False)
    ph_level = Column(Float, nullable=False)
    contamination = Column(Float, nullable=False)
    cases_count = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)           # low / medium / high
    confidence = Column(Float, nullable=True)
    recommendation = Column(String, nullable=True)
    location = Column(String, nullable=True, default="Unknown")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One prediction may trigger one alert
    alert = relationship("Alert", back_populates="prediction", uselist=False)


class Alert(Base):
    """Auto-generated alert when risk_level is HIGH."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    severity = Column(String, nullable=False, default="HIGH")
    message = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    prediction = relationship("Prediction", back_populates="alert")
