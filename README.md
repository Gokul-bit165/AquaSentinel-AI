# 🌊 AquaSentinel AI

AI-powered waterborne disease outbreak prediction system. Built for hackathon demo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, scikit-learn |
| Frontend | React, Vite, TailwindCSS, Leaflet, Recharts |
| Database | SQLite |
| ML Model | RandomForestClassifier |

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python app/ml/train_model.py  # Train the ML model
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Submit environmental data, get risk prediction |
| GET | `/predictions` | List all past predictions |
| GET | `/alerts` | List active alerts |

## Project Structure
```
AquaSentinel AI/
├── backend/          # FastAPI + ML
│   └── app/
│       ├── main.py
│       ├── models/    # SQLAlchemy ORM
│       ├── schemas/   # Pydantic models
│       ├── routes/    # API endpoints
│       ├── services/  # Business logic
│       ├── ml/        # ML training & inference
│       └── utils/     # DB helpers
├── frontend/         # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── data/             # Sample datasets
└── docs/             # Documentation
```

## License
MIT
