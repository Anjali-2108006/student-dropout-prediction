"""
=============================================================================
Application: app.py
Project: AI-Based Student Dropout Prediction and Early Warning System
Stage: Stage 8 - Machine Learning Model Integration with Web Application
=============================================================================
Flask web application serving the user interface and live ML prediction API.
Routes:
- GET  /           : Serves the responsive web dashboard (index.html)
- GET  /health     : Health-check endpoint verifying backend status & model readiness
- POST /predict    : Performs real-time ML inference using the champion Random Forest model
- GET  /api/sample : Returns authentic sample student profiles for 1-click testing
=============================================================================
"""

import os
import sys
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.predictor import get_predictor, StudentDropoutPredictor

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# TASK 1: Load the saved champion ML model pipeline
PREDICTOR = None
PREDICTOR_LOAD_ERROR = None

try:
    PREDICTOR = get_predictor()
    print("[*] Successfully loaded champion Machine Learning model (Random Forest Pipeline)!")
except Exception as exc:
    PREDICTOR_LOAD_ERROR = str(exc)
    print(f"[!] Warning: Error initializing ML model: {exc}")

# Load metadata for validation schema
META_PATH = os.path.join(BASE_DIR, "models", "model_metadata.json")
EXPECTED_FEATURES = []
if PREDICTOR:
    EXPECTED_FEATURES = PREDICTOR.feature_names
elif os.path.exists(META_PATH):
    try:
        with open(META_PATH, "r", encoding="utf-8") as f:
            meta = json.load(f)
            EXPECTED_FEATURES = meta.get("early_warning_features", [])
    except Exception:
        pass


# Prediction History Persistent Store (JSON file storage)
HISTORY_FILE = os.path.join(BASE_DIR, "models", "predictions_history.json")

# In-memory benchmark cohort cache
_BENCHMARK_COHORT_CACHE = None


def load_prediction_history():
    """Loads recorded predictions from the persistent JSON store."""
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as err:
            print(f"[!] Error reading predictions history: {err}")
            return []
    return []


def save_prediction_record(record):
    """Appends a new student prediction record to the JSON history store."""
    history = load_prediction_history()
    history.insert(0, record)
    try:
        os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history[:500], f, indent=2)
    except Exception as err:
        print(f"[!] Error saving prediction history: {err}")


def get_benchmark_cohort():
    """
    Evaluates or retrieves cached predictions on the real 885 held-out
    test students from dataset/test_data.csv.
    Zero fake data: uses the real UCI test set evaluated by the champion model.
    """
    global _BENCHMARK_COHORT_CACHE
    if _BENCHMARK_COHORT_CACHE is not None:
        return _BENCHMARK_COHORT_CACHE

    test_csv_path = os.path.join(BASE_DIR, "dataset", "test_data.csv")
    if not os.path.exists(test_csv_path) or PREDICTOR is None:
        return []

    try:
        import pandas as pd
        test_df = pd.read_csv(test_csv_path)
        batch_preds = PREDICTOR.predict_batch(test_df)
        records = []
        for idx, row in batch_preds.iterrows():
            prob = float(row["Dropout_Probability"])
            pct = round(prob * 100, 1)
            category = row["Risk_Category"]
            pred_class = int(row["Predicted_Dropout_Risk"])

            # Anonymized student reference ID (zero sensitive info)
            ref_id = f"STU-BENCH-{idx + 1:04d}"

            status = "Review Recommended" if category == "High Risk" else (
                "Advisory Check" if category == "Medium Risk" else "On Track"
            )

            records.append({
                "reference_id": ref_id,
                "timestamp": "UCI Benchmark Evaluation",
                "risk_category": category,
                "dropout_probability": round(prob, 4),
                "dropout_risk_percentage": pct,
                "dropout_risk_class": pred_class,
                "dropout_risk_label": "Dropout (Class 1)" if pred_class == 1 else "Graduate / Enrolled (Class 0)",
                "status": status,
                "first_semester_approved": int(row.get("Curricular units 1st sem (approved)", 0)),
                "first_semester_grade": round(float(row.get("Curricular units 1st sem (grade)", 0.0)), 1),
                "tuition_fees_up_to_date": "Yes" if row.get("Tuition fees up to date") == 1 else "No",
                "debtor": "Yes" if row.get("Debtor") == 1 else "No",
                "age_at_enrollment": int(row.get("Age at enrollment", 0)),
                "is_benchmark": True
            })
        _BENCHMARK_COHORT_CACHE = records
        return _BENCHMARK_COHORT_CACHE
    except Exception as err:
        print(f"[!] Error building benchmark cohort: {err}")
        return []


def compute_dashboard_metrics(records, source_name="live"):
    """
    Calculates total counts, risk tier distributions, and probability bins.
    """
    total = len(records)
    if total == 0:
        return {
            "source": source_name,
            "source_label": "Live Web Application Predictions" if source_name == "live" else "UCI Benchmark Test Cohort (Real Test Data - 885 Students)",
            "total_predictions": 0,
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "high_risk_percentage": 0.0,
            "medium_risk_percentage": 0.0,
            "low_risk_percentage": 0.0,
            "risk_distribution": {
                "Low Risk": {"count": 0, "percentage": 0.0},
                "Medium Risk": {"count": 0, "percentage": 0.0},
                "High Risk": {"count": 0, "percentage": 0.0}
            },
            "probability_distribution": {
                "0% - 20%": 0,
                "20% - 40%": 0,
                "40% - 60%": 0,
                "60% - 80%": 0,
                "80% - 100%": 0
            },
            "records": [],
            "has_data": False,
            "message": "No student predictions recorded in this session yet."
        }

    high_count = sum(1 for r in records if r["risk_category"] == "High Risk")
    med_count = sum(1 for r in records if r["risk_category"] == "Medium Risk")
    low_count = sum(1 for r in records if r["risk_category"] == "Low Risk")

    high_pct = round((high_count / total) * 100, 1)
    med_pct = round((med_count / total) * 100, 1)
    low_pct = round((low_count / total) * 100, 1)

    # Probability distribution bins for histogram
    prob_bins = {
        "0% - 20%": 0,
        "20% - 40%": 0,
        "40% - 60%": 0,
        "60% - 80%": 0,
        "80% - 100%": 0
    }
    for r in records:
        pct = float(r.get("dropout_risk_percentage", 0.0))
        if pct < 20.0:
            prob_bins["0% - 20%"] += 1
        elif pct < 40.0:
            prob_bins["20% - 40%"] += 1
        elif pct < 60.0:
            prob_bins["40% - 60%"] += 1
        elif pct < 80.0:
            prob_bins["60% - 80%"] += 1
        else:
            prob_bins["80% - 100%"] += 1

    return {
        "source": source_name,
        "source_label": "Live Web Application Predictions" if source_name == "live" else "UCI Benchmark Test Cohort (Real Test Data - 885 Students)",
        "total_predictions": total,
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "high_risk_percentage": high_pct,
        "medium_risk_percentage": med_pct,
        "low_risk_percentage": low_pct,
        "risk_distribution": {
            "Low Risk": {"count": low_count, "percentage": low_pct},
            "Medium Risk": {"count": med_count, "percentage": med_pct},
            "High Risk": {"count": high_count, "percentage": high_pct}
        },
        "probability_distribution": prob_bins,
        "records": records,
        "has_data": True,
        "message": f"Successfully loaded {total} prediction records."
    }


@app.route("/", methods=["GET"])
def home():
    """Renders the main dashboard and prediction interface."""
    return render_template(
        "index.html",
        feature_count=len(EXPECTED_FEATURES),
        features=EXPECTED_FEATURES,
        model_ready=(PREDICTOR is not None)
    )


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint confirming Flask backend and model readiness."""
    return jsonify({
        "status": "healthy",
        "project": "AI-Based Student Dropout Prediction and Early Warning System",
        "stage": "Stage 8 - Machine Learning Model Integration",
        "model_loaded": (PREDICTOR is not None),
        "ml_model_loaded": (PREDICTOR is not None),
        "model_type": "Random Forest Classifier (150 trees) with StandardScaler",
        "required_features_count": len(EXPECTED_FEATURES),
        "demonstration_thresholds": {
            "low_risk": "< 30%",
            "medium_risk": "30% to < 60%",
            "high_risk": ">= 60%"
        },
        "model_load_error": PREDICTOR_LOAD_ERROR
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    """
    TASK 2: Real-time Dropout Risk Inference Endpoint.
    1. Validates input JSON against all 30 early-warning features.
    2. Runs input through the trained Random Forest Pipeline.
    3. Calculates dropout probability and assigns risk category (Low, Medium, High).
    4. Generates supportive, constructive student guidance.
    """
    # 1. Verify model is loaded
    if PREDICTOR is None:
        return jsonify({
            "status": "error",
            "message": "Machine learning prediction service is currently unavailable. Model failed to load.",
            "error_detail": PREDICTOR_LOAD_ERROR
        }), 503

    # 2. Parse JSON input
    if not request.is_json:
        return jsonify({
            "status": "error",
            "message": "Invalid request content-type. Expected application/json."
        }), 400

    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Request payload must be a non-empty JSON object."
        }), 400

    # 3. Validate missing fields
    missing_fields = [feat for feat in EXPECTED_FEATURES if feat not in data]
    if missing_fields:
        return jsonify({
            "status": "error",
            "message": f"Missing {len(missing_fields)} required student feature(s).",
            "missing_fields": missing_fields
        }), 400

    # 4. Validate types, numeric conversion, and bounds
    invalid_fields = {}
    cleaned_values = {}
    for feat in EXPECTED_FEATURES:
        val = data.get(feat)
        if val is None or (isinstance(val, str) and val.strip() == ""):
            invalid_fields[feat] = "Field cannot be empty or null."
            continue
        try:
            val_float = float(val)
            cleaned_values[feat] = val_float
        except (ValueError, TypeError):
            invalid_fields[feat] = f"Expected numeric value, received: {repr(val)}"
            continue

        # Sanity range checks where applicable
        if "grade" in feat.lower() and val_float < 0:
            invalid_fields[feat] = "Grade value cannot be negative."
        if "approved" in feat.lower() and val_float < 0:
            invalid_fields[feat] = "Approved units count cannot be negative."

    if invalid_fields:
        return jsonify({
            "status": "error",
            "message": f"Found {len(invalid_fields)} invalid input field(s).",
            "invalid_fields": invalid_fields
        }), 400

    # 5. Execute Machine Learning Model Inference
    try:
        result = PREDICTOR.predict(cleaned_values)
    except Exception as exc:
        return jsonify({
            "status": "error",
            "message": "An error occurred while generating model predictions.",
            "error_detail": str(exc)
        }), 500

    # 6. Save anonymized prediction record for Stage 9 dashboard (no personal info stored)
    live_count = len(load_prediction_history())
    ref_id = f"STU-LIVE-{live_count + 1:04d}"
    status_label = (
        "Review Recommended" if result["risk_category"] == "High Risk"
        else ("Advisory Check" if result["risk_category"] == "Medium Risk" else "On Track")
    )
    save_prediction_record({
        "reference_id": ref_id,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "risk_category": result["risk_category"],
        "dropout_probability": result["dropout_probability"],
        "dropout_risk_percentage": result["dropout_risk_percentage"],
        "dropout_risk_class": result["dropout_risk_class"],
        "dropout_risk_label": result["dropout_risk_label"],
        "status": status_label,
        "first_semester_approved": cleaned_values.get("Curricular units 1st sem (approved)"),
        "first_semester_grade": cleaned_values.get("Curricular units 1st sem (grade)"),
        "tuition_fees_up_to_date": "Yes" if cleaned_values.get("Tuition fees up to date") == 1 else "No",
        "debtor": "Yes" if cleaned_values.get("Debtor") == 1 else "No",
        "age_at_enrollment": int(cleaned_values.get("Age at enrollment", 0)),
        "is_benchmark": False
    })

    # 7. Return genuine model prediction to the browser
    return jsonify({
        "status": "success",
        "stage": "Stage 8 - ML Model Integration",
        "reference_id": ref_id,
        "dropout_risk_class": result["dropout_risk_class"],
        "dropout_risk_label": result["dropout_risk_label"],
        "dropout_probability": result["dropout_probability"],
        "dropout_risk_percentage": result["dropout_risk_percentage"],
        "risk_category": result["risk_category"],
        "explanation": result["explanation"],
        "support_suggestions": result["support_suggestions"],
        "ethical_note": result["ethical_note"],
        "summary": {
            "first_semester_approved": cleaned_values.get("Curricular units 1st sem (approved)"),
            "first_semester_grade": cleaned_values.get("Curricular units 1st sem (grade)"),
            "tuition_fees_up_to_date": "Yes" if cleaned_values.get("Tuition fees up to date") == 1 else "No",
            "debtor": "Yes" if cleaned_values.get("Debtor") == 1 else "No",
            "scholarship_holder": "Yes" if cleaned_values.get("Scholarship holder") == 1 else "No",
            "age_at_enrollment": int(cleaned_values.get("Age at enrollment", 0))
        }
    }), 200


@app.route("/api/sample/<tier>", methods=["GET"])
def get_sample(tier):
    """
    Returns authentic sample student data from the benchmark dataset
    for 1-click form pre-filling (low, medium, high).
    """
    tier = tier.lower()
    samples = {
        "low": {
            "Marital status": 1, "Application mode": 17, "Application order": 1, "Course": 9254,
            "Daytime/evening attendance": 1, "Previous qualification": 1, "Previous qualification (grade)": 150.0,
            "Nacionality": 1, "Mother's qualification": 1, "Father's qualification": 1,
            "Mother's occupation": 3, "Father's occupation": 3, "Admission grade": 139.8,
            "Displaced": 1, "Educational special needs": 0, "Debtor": 0,
            "Tuition fees up to date": 1, "Gender": 0, "Scholarship holder": 1,
            "Age at enrollment": 19, "International": 0, "Curricular units 1st sem (credited)": 0,
            "Curricular units 1st sem (enrolled)": 7, "Curricular units 1st sem (evaluations)": 8,
            "Curricular units 1st sem (approved)": 7, "Curricular units 1st sem (grade)": 14.4,
            "Curricular units 1st sem (without evaluations)": 0, "Unemployment rate": 12.4,
            "Inflation rate": 0.5, "GDP": 1.74
        },
        "medium": {
            "Marital status": 1, "Application mode": 1, "Application order": 2, "Course": 9070,
            "Daytime/evening attendance": 1, "Previous qualification": 1, "Previous qualification (grade)": 125.0,
            "Nacionality": 1, "Mother's qualification": 19, "Father's qualification": 19,
            "Mother's occupation": 5, "Father's occupation": 7, "Admission grade": 122.4,
            "Displaced": 0, "Educational special needs": 0, "Debtor": 1,
            "Tuition fees up to date": 1, "Gender": 1, "Scholarship holder": 0,
            "Age at enrollment": 19, "International": 0, "Curricular units 1st sem (credited)": 0,
            "Curricular units 1st sem (enrolled)": 6, "Curricular units 1st sem (evaluations)": 7,
            "Curricular units 1st sem (approved)": 5, "Curricular units 1st sem (grade)": 10.9,
            "Curricular units 1st sem (without evaluations)": 0, "Unemployment rate": 10.8,
            "Inflation rate": 1.4, "GDP": 1.74
        },
        "high": {
            "Marital status": 1, "Application mode": 39, "Application order": 1, "Course": 8014,
            "Daytime/evening attendance": 0, "Previous qualification": 1, "Previous qualification (grade)": 120.0,
            "Nacionality": 1, "Mother's qualification": 37, "Father's qualification": 37,
            "Mother's occupation": 9, "Father's occupation": 9, "Admission grade": 140.0,
            "Displaced": 0, "Educational special needs": 0, "Debtor": 1,
            "Tuition fees up to date": 0, "Gender": 1, "Scholarship holder": 0,
            "Age at enrollment": 28, "International": 0, "Curricular units 1st sem (credited)": 0,
            "Curricular units 1st sem (enrolled)": 6, "Curricular units 1st sem (evaluations)": 0,
            "Curricular units 1st sem (approved)": 0, "Curricular units 1st sem (grade)": 0.0,
            "Curricular units 1st sem (without evaluations)": 6, "Unemployment rate": 16.2,
            "Inflation rate": 0.3, "GDP": -0.92
        }
    }

    sample_data = samples.get(tier)
    if not sample_data:
        return jsonify({"status": "error", "message": f"Unknown tier '{tier}'. Options: low, medium, high."}), 404

    return jsonify({"status": "success", "tier": tier, "data": sample_data}), 200


# =============================================================================
# STAGE 9: DASHBOARD ROUTES
# =============================================================================

@app.route("/dashboard", methods=["GET"])
def dashboard():
    """Renders the Stage 9 Early Warning Risk Dashboard page."""
    return render_template("dashboard.html", model_ready=(PREDICTOR is not None))


@app.route("/api/dashboard", methods=["GET"])
def api_dashboard():
    """
    GET /api/dashboard
    Returns aggregated early-warning dashboard data.

    Query Parameters:
      source     : 'benchmark' (default) or 'live'
      filter     : 'all' (default), 'low', 'medium', 'high'
      page       : page number (default 1)
      page_size  : records per page (default 50, max 200)

    Data sources:
      benchmark - Real UCI 885-student held-out test cohort (pre-evaluated by champion model)
      live      - Predictions submitted via POST /predict during this server session
    """
    source = request.args.get("source", "benchmark").lower()
    filter_tier = request.args.get("filter", "all").lower()
    page = max(1, int(request.args.get("page", 1)))
    page_size = min(200, max(1, int(request.args.get("page_size", 50))))

    if source == "live":
        all_records = load_prediction_history()
        metrics = compute_dashboard_metrics(all_records, source_name="live")
    else:
        all_records = get_benchmark_cohort()
        metrics = compute_dashboard_metrics(all_records, source_name="benchmark")

    # Apply risk-tier filter to table records
    tier_map = {"low": "Low Risk", "medium": "Medium Risk", "high": "High Risk"}
    if filter_tier in tier_map:
        filtered = [r for r in metrics["records"] if r["risk_category"] == tier_map[filter_tier]]
    else:
        filtered = metrics["records"]

    # Paginate for the table display
    total_filtered = len(filtered)
    start = (page - 1) * page_size
    paginated = filtered[start: start + page_size]

    # Sanitize: return only anonymized, non-personal fields
    safe_records = [{
        "reference_id": rec["reference_id"],
        "timestamp": rec["timestamp"],
        "risk_category": rec["risk_category"],
        "dropout_risk_percentage": rec["dropout_risk_percentage"],
        "dropout_risk_class": rec["dropout_risk_class"],
        "dropout_risk_label": rec["dropout_risk_label"],
        "status": rec["status"],
        "is_benchmark": rec.get("is_benchmark", False)
    } for rec in paginated]

    return jsonify({
        "status": "success",
        "source": metrics["source"],
        "source_label": metrics["source_label"],
        "has_data": metrics["has_data"],
        "message": metrics["message"],
        "summary": {
            "total_predictions": metrics["total_predictions"],
            "low_risk_count": metrics["low_risk_count"],
            "medium_risk_count": metrics["medium_risk_count"],
            "high_risk_count": metrics["high_risk_count"],
            "low_risk_percentage": metrics["low_risk_percentage"],
            "medium_risk_percentage": metrics["medium_risk_percentage"],
            "high_risk_percentage": metrics["high_risk_percentage"]
        },
        "risk_distribution": metrics["risk_distribution"],
        "probability_distribution": metrics["probability_distribution"],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_filtered": total_filtered,
            "total_pages": max(1, -(-total_filtered // page_size))
        },
        "records": safe_records
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Student Dropout Early Warning System Web Server on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=False)
