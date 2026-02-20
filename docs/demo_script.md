# Demo Script — AquaSentinel AI

## Setup (Before Demo)

```bash
# Terminal 1: Start backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python app/ml/train_model.py
uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```

---

## Live Demo Walkthrough (5 minutes)

### 1. Introduction (30 sec)
> "AquaSentinel AI is an AI-powered system that predicts waterborne disease outbreaks using environmental data — before they happen."

Open browser: `http://localhost:5173`

### 2. Dashboard Overview (30 sec)
- Point out the **Stats Cards** (total predictions, high risk count, alerts, confidence)
- Show the **empty state** — ready for real-time data

### 3. Submit a LOW Risk Prediction (1 min)
Enter these values:
- Rainfall: **45** mm
- pH Level: **7.1**
- Contamination: **0.05**
- Cases: **2**
- Location: **Zone A**

Click **Analyze Risk** → Show the green "LOW" result

### 4. Submit a HIGH Risk Prediction (1 min)
Enter these values:
- Rainfall: **310** mm
- pH Level: **4.8**
- Contamination: **0.80**
- Cases: **75**
- Location: **Zone D**

Click **Analyze Risk** → Show the red "HIGH" result
- Point out the **auto-generated alert** in the Alert Panel
- Show the **recommendation** with specific actions

### 5. Explore Visualizations (1 min)
- Scroll to the **Risk Heatmap** — show colored markers (green vs red)
- Click a marker to show the popup with details
- Scroll to the **Charts** — show pie chart and bar chart distribution

### 6. API & Architecture (1 min)
- Open `http://localhost:8000/docs` → Show Swagger documentation
- Briefly mention the architecture: FastAPI → RandomForest → SQLite
- Mention the auto-alert and recommendation engine

### 7. Closing (30 sec)
> "AquaSentinel AI turns raw environmental data into actionable intelligence, enabling proactive response to waterborne disease threats."
