@echo off
echo Starting AquaSentinel AI Backend...
cd /d %~dp0
set PYTHONPATH=.
conda activate base && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
