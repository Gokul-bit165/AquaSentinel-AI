from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import List, Union, Any
import os
import json


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "AquaSentinel AI"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./aqua_sentinel.db"

    # CORS
    CORS_ORIGINS: Any = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return [str(v)]

    # ML Paths
    # We'll make these absolute relative to the backend dir
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    MODEL_PATH: str = "app/ml/model.pkl"
    ENCODER_PATH: str = "app/ml/label_encoder.pkl"
    METRICS_PATH: str = "app/ml/metrics.json"

    @property
    def abs_model_path(self) -> str:
        return os.path.join(self.BASE_DIR, self.MODEL_PATH)

    @property
    def abs_encoder_path(self) -> str:
        return os.path.join(self.BASE_DIR, self.ENCODER_PATH)

    @property
    def abs_metrics_path(self) -> str:
        return os.path.join(self.BASE_DIR, self.METRICS_PATH)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


settings = Settings()
