"""
=============================================================================
Test Suite: test_dashboard.py
Project: AI-Based Student Dropout Prediction and Early Warning System
Stage: Stage 9 - Student Risk Dashboard and Early Warning Overview
=============================================================================
Verifies all Stage 9 dashboard routes and API behaviour:
1. GET /dashboard        (Dashboard HTML page loads)
2. GET /api/dashboard    (Benchmark cohort data returned)
3. GET /api/dashboard?source=benchmark (Correct counts and structure)
4. GET /api/dashboard?source=live      (Live history - empty or populated)
5. GET /api/dashboard?filter=high      (High-risk filter returns only high)
6. GET /api/dashboard?filter=medium    (Medium-risk filter returns only medium)
7. GET /api/dashboard?filter=low       (Low-risk filter returns only low)
8. GET /api/dashboard?page=2           (Pagination - second page)
9. POST /predict then GET /api/dashboard?source=live (Live record created)
10. Privacy check: no personal identifiers in API response records
=============================================================================
"""

import json
import sys
import os

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app


def run_tests():
    sys.stdout.reconfigure(encoding="utf-8")
    print("=" * 80)
    print("STAGE 9: EARLY WARNING DASHBOARD TEST SUITE")
    print("=" * 80)

    client = app.test_client()

    # Load a valid benchmark sample for POST /predict tests
    res_sample = client.get("/api/sample/low")
    LOW_SAMPLE = res_sample.get_json()["data"]

    # ------------------------------------------------------------------
    # TEST 1: GET /dashboard — HTML page loads correctly
    # ------------------------------------------------------------------
    print("\n[TEST 1] GET /dashboard - Dashboard page HTML delivery...")
    res = client.get("/dashboard")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    html = res.get_data(as_text=True)
    assert "Early Warning Dashboard" in html,    "Dashboard title missing"
    assert "chart-doughnut"        in html,    "Doughnut chart canvas missing"
    assert "chart-bar"             in html,    "Bar chart canvas missing"
    assert "chart-histogram"       in html,    "Histogram chart canvas missing"
    assert "risk-table"            in html,    "Student risk table missing"
    assert "Early Warning Overview" in html,   "Early Warning section missing"
    assert "ew-disclaimer"         in html,    "Ethical disclaimer missing"
    print(f"[OK] GET /dashboard returned HTTP 200 ({len(html):,} bytes).")

    # ------------------------------------------------------------------
    # TEST 2: GET /api/dashboard — returns valid JSON structure
    # ------------------------------------------------------------------
    print("\n[TEST 2] GET /api/dashboard - JSON structure validation...")
    res = client.get("/api/dashboard")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    assert data["status"]          == "success"
    assert "summary"               in data
    assert "risk_distribution"     in data
    assert "probability_distribution" in data
    assert "records"               in data
    assert "pagination"            in data
    print(f"[OK] /api/dashboard returned valid JSON with all expected keys.")

    # ------------------------------------------------------------------
    # TEST 3: Benchmark cohort data is loaded (885 real UCI students)
    # ------------------------------------------------------------------
    print("\n[TEST 3] Benchmark cohort data - verify 885 real UCI students...")
    res = client.get("/api/dashboard?source=benchmark")
    data = res.get_json()
    assert data["source"]                  == "benchmark"
    assert data["has_data"]                is True
    s = data["summary"]
    total = s["total_predictions"]
    assert total == 885, f"Expected 885 UCI test students, got {total}"
    assert s["low_risk_count"]    + s["medium_risk_count"] + s["high_risk_count"] == total
    assert s["low_risk_percentage"]   >= 0
    assert s["medium_risk_percentage"] >= 0
    assert s["high_risk_percentage"]   >= 0
    # Percentages must sum close to 100
    pct_sum = s["low_risk_percentage"] + s["medium_risk_percentage"] + s["high_risk_percentage"]
    assert abs(pct_sum - 100.0) < 0.5, f"Percentages sum to {pct_sum}, expected ~100"
    print(f"[OK] Benchmark cohort: {total} students | Low: {s['low_risk_count']} | "
          f"Medium: {s['medium_risk_count']} | High: {s['high_risk_count']}")
    print(f"     Distribution: {s['low_risk_percentage']}% / "
          f"{s['medium_risk_percentage']}% / {s['high_risk_percentage']}%")

    # ------------------------------------------------------------------
    # TEST 4: Probability distribution histogram is non-empty
    # ------------------------------------------------------------------
    print("\n[TEST 4] Probability distribution histogram bins...")
    prob_dist = data.get("probability_distribution", {})
    expected_bins = ["0% - 20%", "20% - 40%", "40% - 60%", "60% - 80%", "80% - 100%"]
    for bin_label in expected_bins:
        assert bin_label in prob_dist, f"Missing bin '{bin_label}'"
    total_binned = sum(prob_dist.values())
    assert total_binned == 885, f"Bin totals {total_binned} != 885"
    print(f"[OK] 5 probability bins present. Total binned: {total_binned} students.")
    for label, count in prob_dist.items():
        print(f"     {label}: {count} students")

    # ------------------------------------------------------------------
    # TEST 5: Filter=high returns only High Risk records
    # ------------------------------------------------------------------
    print("\n[TEST 5] Filter=high - only High Risk records returned...")
    res = client.get("/api/dashboard?source=benchmark&filter=high&page_size=200")
    data = res.get_json()
    high_records = data["records"]
    assert len(high_records) > 0, "Expected high-risk records, got none"
    for rec in high_records:
        assert rec["risk_category"] == "High Risk", \
            f"Expected 'High Risk', got '{rec['risk_category']}' for {rec['reference_id']}"
    expected_high = data["pagination"]["total_filtered"]
    print(f"[OK] Filter=high: {expected_high} records returned, all are 'High Risk'.")

    # ------------------------------------------------------------------
    # TEST 6: Filter=medium returns only Medium Risk records
    # ------------------------------------------------------------------
    print("\n[TEST 6] Filter=medium - only Medium Risk records returned...")
    res = client.get("/api/dashboard?source=benchmark&filter=medium&page_size=200")
    data = res.get_json()
    medium_records = data["records"]
    assert len(medium_records) > 0, "Expected medium-risk records, got none"
    for rec in medium_records:
        assert rec["risk_category"] == "Medium Risk", \
            f"Expected 'Medium Risk', got '{rec['risk_category']}'"
    print(f"[OK] Filter=medium: {len(medium_records)} records returned, all are 'Medium Risk'.")

    # ------------------------------------------------------------------
    # TEST 7: Filter=low returns only Low Risk records
    # ------------------------------------------------------------------
    print("\n[TEST 7] Filter=low - only Low Risk records returned...")
    res = client.get("/api/dashboard?source=benchmark&filter=low&page_size=200")
    data = res.get_json()
    low_records = data["records"]
    assert len(low_records) > 0, "Expected low-risk records, got none"
    for rec in low_records:
        assert rec["risk_category"] == "Low Risk", \
            f"Expected 'Low Risk', got '{rec['risk_category']}'"
    print(f"[OK] Filter=low: {len(low_records)} records returned, all are 'Low Risk'.")

    # ------------------------------------------------------------------
    # TEST 8: Pagination — verify page 2 differs from page 1
    # ------------------------------------------------------------------
    print("\n[TEST 8] Pagination - page 2 returns different records than page 1...")
    res_p1 = client.get("/api/dashboard?source=benchmark&filter=all&page=1&page_size=10")
    res_p2 = client.get("/api/dashboard?source=benchmark&filter=all&page=2&page_size=10")
    data_p1 = res_p1.get_json()
    data_p2 = res_p2.get_json()
    ids_p1 = [r["reference_id"] for r in data_p1["records"]]
    ids_p2 = [r["reference_id"] for r in data_p2["records"]]
    assert ids_p1 != ids_p2,        "Page 1 and page 2 returned identical records"
    assert len(ids_p1) == 10,       f"Expected 10 records on page 1, got {len(ids_p1)}"
    assert data_p2["pagination"]["page"] == 2
    print(f"[OK] Pagination works: page 1 IDs start with '{ids_p1[0]}', "
          f"page 2 IDs start with '{ids_p2[0]}'.")

    # ------------------------------------------------------------------
    # TEST 9: Live source — submit a prediction, verify it appears
    # ------------------------------------------------------------------
    print("\n[TEST 9] Live predictions source - POST /predict then check /api/dashboard?source=live...")
    # Count live records before prediction
    res_before = client.get("/api/dashboard?source=live")
    count_before = res_before.get_json()["summary"]["total_predictions"]

    # Submit a new prediction
    res_pred = client.post(
        "/predict",
        data=json.dumps(LOW_SAMPLE),
        content_type="application/json"
    )
    assert res_pred.status_code == 200
    pred_json = res_pred.get_json()
    assert pred_json["status"] == "success"
    ref_id = pred_json.get("reference_id", "")
    assert ref_id.startswith("STU-LIVE-"), f"Expected STU-LIVE- ref ID, got '{ref_id}'"

    # Verify live dashboard count incremented
    res_after = client.get("/api/dashboard?source=live")
    data_after = res_after.get_json()
    count_after = data_after["summary"]["total_predictions"]
    assert count_after == count_before + 1, \
        f"Expected {count_before + 1} live records, got {count_after}"
    live_ids = [r["reference_id"] for r in data_after["records"]]
    assert ref_id in live_ids, f"New ref_id '{ref_id}' not found in live records"
    print(f"[OK] Live prediction registered: ref_id={ref_id}. "
          f"Live count: {count_before} -> {count_after}.")

    # ------------------------------------------------------------------
    # TEST 10: Privacy — no personal identifiers in API response records
    # ------------------------------------------------------------------
    print("\n[TEST 10] Privacy - checking for absence of personal identifiers...")
    res = client.get("/api/dashboard?source=benchmark&page_size=50")
    all_recs = res.get_json()["records"]
    forbidden_keys = [
        "name", "email", "phone", "address", "surname",
        "national_id", "student_name", "contact", "passport"
    ]
    for rec in all_recs:
        for bad_key in forbidden_keys:
            assert bad_key not in rec, \
                f"Personal identifier '{bad_key}' found in record '{rec.get('reference_id')}'"
        # Reference IDs should be system-generated codes only
        ref = rec.get("reference_id", "")
        assert ref.startswith("STU-"), \
            f"Unexpected reference ID format: '{ref}'"
    print(f"[OK] Privacy check passed. {len(all_recs)} records checked. "
          "No personal identifiers found.")

    # ------------------------------------------------------------------
    # SUMMARY
    # ------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("ALL 10 STAGE 9 DASHBOARD TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)
    print("\nStage 9 Dashboard Summary:")
    print("  - Dashboard URL   : http://127.0.0.1:5000/dashboard")
    print("  - Data API URL    : http://127.0.0.1:5000/api/dashboard")
    print("  - Benchmark data  : 885 real UCI test students (no fake data)")
    print("  - Live data       : Populated by POST /predict from web UI")
    print("  - Privacy         : Only anonymized reference IDs displayed")


if __name__ == "__main__":
    run_tests()
