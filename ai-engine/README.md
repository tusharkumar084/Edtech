# TimeOut AI Engine

Phase 1 contains the isolated student-support prediction core for the ED-04 demonstration.

## Dataset

Place the UCI Student Performance mathematics dataset at `data/student-mat.csv`.
The training target is derived as `support_needed = 1` when `G3 < 10`; `G3` is never used as a model input.
Human review records are persisted in `runtime/review-history.json` by default. Set `REVIEW_HISTORY_PATH` to change that location.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Train

```powershell
python -c "from app.model import train_from_csv; train_from_csv('data/student-mat.csv', 'models/model.joblib')"
```
