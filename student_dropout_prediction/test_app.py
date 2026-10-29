"""
=============================================================================
Test Suite: test_app.py
Project: AI-Based Student Dropout Prediction and Early Warning System
Stage: Stage 8 - Machine Learning Model Integration with Web Application
=============================================================================
Comprehensive test suite verifying Flask backend integration with the
saved Random Forest machine learning pipeline:

1. GET / (Home page HTML delivery & UI elements)
2. GET /health (Health-check & model readiness verification)
3. GET /api/sample/low, medium, high (Sample profile endpoints)
4. POST /predict with Low-Risk Student (Confirms Class 0, Low Risk, suggestions)
5. POST /predict with Medium-Risk Student (Confirms Medium Risk, suggestions)
6. POST /predict with High-Risk Student (Confirms Class 1, High Risk, suggestions)
7. POST /predict input validation: Missing feature rejection (HTTP 400)
8. POST /predict input validation: Non-numeric input rejection (HTTP 400)
=============================================================================
"""

import json
from app import app


def run_tests():
    print("=" * 80)
    print("STAGE 8: FLASK & MACHINE LEARNING MODEL INTEGRATION TEST SUITE")
    print("=" * 80)

    client = app.test_client()

    # 1. Test GET / (Home Page)
    print("\n[TEST 1] Testing GET / (Home Page delivery)...")
    res_home = client.get("/")
    assert res_home.status_code == 200, f"Expected 200, got {res_home.status_code}"
    html_text = res_home.get_data(as_text=True)
    assert "StudentRisk" in html_text, "Navbar brand missing"
    assert "Student Risk Evaluation Form" in html_text, "Prediction form missing"
    assert "result-banner" in html_text, "Stage 8 result banner missing"
    assert "gauge-bar" in html_text, "Risk gauge element missing"
    assert "suggestions-card" in html_text, "Suggestions container missing"
    print(f"[OK] GET / passed. Returned HTTP 200 ({len(html_text):,} bytes HTML).")

    # 2. Test GET /health
    print("\n[TEST 2] Testing GET /health...")
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    health_json = res_health.get_json()
    assert health_json["status"] == "healthy"
    assert health_json["model_loaded"] is True, "Model is not reported as loaded"
    assert health_json["required_features_count"] == 30
    print(f"[OK] GET /health passed. Model status: {health_json['model_loaded']}, Features: {health_json['required_features_count']}")

    # 3. Test Sample Profile API Endpoints
    print("\n[TEST 3] Testing GET /api/sample/<tier> endpoints...")
    samples = {}
    for tier in ["low", "medium", "high"]:
        res_sample = client.get(f"/api/sample/{tier}")
        assert res_sample.status_code == 200, f"Failed to get sample {tier}"
        sample_json = res_sample.get_json()
        assert sample_json["status"] == "success"
        assert len(sample_json["data"]) == 30, f"Expected 30 features, got {len(sample_json['data'])}"
        samples[tier] = sample_json["data"]
        print(f"     -> Sample '{tier}': 30 valid features loaded.")
    print("[OK] All 3 sample profile endpoints verified.")

    # 4. Test POST /predict: Low-Risk Student Profile
    print("\n[TEST 4] Testing POST /predict: Low-Risk Student Profile...")
    res_low = client.post(
        "/predict",
        data=json.dumps(samples["low"]),
        content_type="application/json"
    )
    assert res_low.status_code == 200, f"Expected 200, got {res_low.status_code}"
    low_json = res_low.get_json()
    assert low_json["status"] == "success"
    assert "Stage 8" in low_json["stage"]
    assert low_json["dropout_risk_class"] == 0, f"Expected class 0, got {low_json['dropout_risk_class']}"
    assert "Graduate / Enrolled" in low_json["dropout_risk_label"]
    assert low_json["risk_category"] == "Low Risk", f"Expected 'Low Risk', got {low_json['risk_category']}"
    assert 0.0 <= low_json["dropout_probability"] < 0.30
    assert len(low_json["support_suggestions"]) > 0
    assert "ethical_note" in low_json
    print(f"[OK] Low-Risk Profile Prediction Verified:")
    print(f"     Class: {low_json['dropout_risk_class']} ({low_json['dropout_risk_label']})")
    print(f"     Probability: {low_json['dropout_risk_percentage']}% -> Category: {low_json['risk_category']}")
    print(f"     Suggestions count: {len(low_json['support_suggestions'])}")

    # 5. Test POST /predict: Medium-Risk Student Profile
    print("\n[TEST 5] Testing POST /predict: Medium-Risk Student Profile...")
    res_med = client.post(
        "/predict",
        data=json.dumps(samples["medium"]),
        content_type="application/json"
    )
    assert res_med.status_code == 200, f"Expected 200, got {res_med.status_code}"
    med_json = res_med.get_json()
    assert med_json["status"] == "success"
    assert med_json["risk_category"] == "Medium Risk", f"Expected 'Medium Risk', got {med_json['risk_category']}"
    assert 0.30 <= med_json["dropout_probability"] < 0.60
    assert len(med_json["support_suggestions"]) > 0
    print(f"[OK] Medium-Risk Profile Prediction Verified:")
    print(f"     Class: {med_json['dropout_risk_class']} ({med_json['dropout_risk_label']})")
    print(f"     Probability: {med_json['dropout_risk_percentage']}% -> Category: {med_json['risk_category']}")

    # 6. Test POST /predict: High-Risk Student Profile
    print("\n[TEST 6] Testing POST /predict: High-Risk Student Profile...")
    res_high = client.post(
        "/predict",
        data=json.dumps(samples["high"]),
        content_type="application/json"
    )
    assert res_high.status_code == 200, f"Expected 200, got {res_high.status_code}"
    high_json = res_high.get_json()
    assert high_json["status"] == "success"
    assert high_json["dropout_risk_class"] == 1, f"Expected class 1, got {high_json['dropout_risk_class']}"
    assert "Dropout" in high_json["dropout_risk_label"]
    assert high_json["risk_category"] == "High Risk", f"Expected 'High Risk', got {high_json['risk_category']}"
    assert high_json["dropout_probability"] >= 0.60
    assert len(high_json["support_suggestions"]) > 0
    print(f"[OK] High-Risk Profile Prediction Verified:")
    print(f"     Class: {high_json['dropout_risk_class']} ({high_json['dropout_risk_label']})")
    print(f"     Probability: {high_json['dropout_risk_percentage']}% -> Category: {high_json['risk_category']}")

    # 7. Test POST /predict: Missing Required Feature Rejection
    print("\n[TEST 7] Testing POST /predict: Missing feature rejection (HTTP 400)...")
    bad_data = samples["low"].copy()
    del bad_data["Tuition fees up to date"]
    res_missing = client.post(
        "/predict",
        data=json.dumps(bad_data),
        content_type="application/json"
    )
    assert res_missing.status_code == 400, f"Expected 400, got {res_missing.status_code}"
    missing_json = res_missing.get_json()
    assert missing_json["status"] == "error"
    assert "Tuition fees up to date" in missing_json["missing_fields"]
    print(f"[OK] Missing field correctly rejected with HTTP 400: {missing_json['message']}")

    # 8. Test POST /predict: Non-Numeric Value Rejection
    print("\n[TEST 8] Testing POST /predict: Non-numeric input rejection (HTTP 400)...")
    invalid_data = samples["low"].copy()
    invalid_data["Admission grade"] = "not_a_valid_number"
    res_invalid = client.post(
        "/predict",
        data=json.dumps(invalid_data),
        content_type="application/json"
    )
    assert res_invalid.status_code == 400, f"Expected 400, got {res_invalid.status_code}"
    invalid_json = res_invalid.get_json()
    assert invalid_json["status"] == "error"
    assert "Admission grade" in invalid_json["invalid_fields"]
    print(f"[OK] Invalid non-numeric input correctly rejected with HTTP 400: {invalid_json['message']}")

    print("\n" + "=" * 80)
    print("ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY! STAGE 8 INTEGRATION VERIFIED.")
    print("=" * 80)


if __name__ == "__main__":
    run_tests()
