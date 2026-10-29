# Stage 8: Machine Learning Model Integration with Web Application

**Project Title:** AI-Based Student Dropout Prediction and Early Warning System  
**Stage:** Stage 8 of 10  
**Status:** Completed & Fully Verified  

---

## 1. Overview & Objectives

In **Stage 8**, the champion Machine Learning model—a **Random Forest Classifier with standard scaling** trained in Stage 5 and validated in Stage 6—was integrated end-to-end with the Flask web application developed in Stage 7.

### Key Objectives Accomplished:
1. **Model Loading on Server Startup:** Loaded `models/dropout_model.joblib` once at application startup into a thread-safe inference singleton (`src/predictor.py`), avoiding runtime re-loading overhead.
2. **Real-Time Probabilistic Inference:** Replaced placeholder responses in `POST /predict` with live ML inference computing exact dropout risk probabilities (`predict_proba`).
3. **Threshold-Based Risk Categorization:**
   - **Low Risk:** Dropout probability `< 30%` (displayed in green)
   - **Medium Risk:** Dropout probability `30% to < 60%` (displayed in amber/yellow)
   - **High Risk:** Dropout probability `>= 60%` (displayed in red)
4. **Context-Aware Support Suggestions:** Generated constructive, student-centered intervention guidance tailored to the student's risk level and academic/financial flags (e.g. tutoring, financial aid counseling, academic workload rebalancing).
5. **Interactive UI Results Dashboard:** Enhanced `templates/index.html`, `static/css/style.css`, and `static/js/script.js` with a dynamic result banner, smooth animated risk gauge bar, model explanation box, suggestions card, and validated attribute snapshot table.
6. **Ethical AI & Privacy Safeguards:** Added clear, prominent notices highlighting that predictions are probabilistic decision-support signals designed strictly for student assistance, not deterministic or punitive actions.

---

## 2. Architecture & Data Flow

```
[ User Interaction in Browser ]
           │
           │ (1) User inputs 30 features or clicks 1-click sample button
           ▼
[ Frontend: script.js ]
           │
           │ (2) Asynchronous JSON POST request to /predict
           ▼
[ Flask Backend: app.py ]
           │
           │ (3) Validates 30 required 1st-semester features & numeric types
           ▼
[ Predictor Engine: src/predictor.py ]
           │
           │ (4) Orders features into DataFrame matching training schema
           │ (5) Runs Pipeline: StandardScaler -> RandomForestClassifier (150 trees)
           ▼
[ Risk Engine & Recommendations ]
           │
           │ (6) Computes dropout probability, assigns Low/Medium/High category
           │ (7) Formulates non-punitive support suggestions and explanation
           ▼
[ JSON API Response (HTTP 200) ]
           │
           │ (8) Returns probabilities, labels, suggestions, and summary
           ▼
[ Dynamic UI Rendering: script.js ]
           │
           └─> Animates color-coded risk gauge
           └─> Renders primary risk category badge & probability percentage
           └─> Populates recommended academic support actions list
           └─> Displays transparent input snapshot table
```

---

## 3. Input Feature Specification (Zero Future Leakage)

The integrated pipeline strictly utilizes the **30 early-warning features** collected during admission and the conclusion of **Semester 1**:

| Category | Count | Key Features |
|:---|:---:|:---|
| **Admission Details** | 7 | `Application mode`, `Application order`, `Course`, `Daytime/evening attendance`, `Previous qualification`, `Previous qualification (grade)`, `Admission grade` |
| **Demographics** | 7 | `Marital status`, `Gender`, `Age at enrollment`, `Nacionality`, `International`, `Displaced`, `Educational special needs` |
| **Socio-Economic** | 10 | `Tuition fees up to date`, `Debtor`, `Scholarship holder`, `Mother's qualification`, `Father's qualification`, `Mother's occupation`, `Father's occupation`, `Unemployment rate`, `Inflation rate`, `GDP` |
| **Academic Performance (Sem 1)** | 6 | `Curricular units 1st sem (approved)`, `Curricular units 1st sem (grade)`, `Curricular units 1st sem (enrolled)`, `Curricular units 1st sem (evaluations)`, `Curricular units 1st sem (credited)`, `Curricular units 1st sem (without evaluations)` |

> **Data Integrity Rule:** Second-semester features and target labels remain completely excluded from the web application and prediction pipeline to preserve true early-warning capability.

---

## 4. Benchmark Profile Verification Results

Using authentic test records from the UCI repository dataset, the end-to-end integration was validated across all three risk tiers:

| Benchmark Profile | 1st Sem Approved | 1st Sem Grade | Tuition Up To Date | Predicted Class | Dropout Risk Probability | Assigned Tier | Key Support Suggestion |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Low-Risk Student** | 7 / 7 units | 14.4 / 20 | Yes (1) | **Class 0** | **13.6%** | 🟢 **Low Risk** | Commend progress; explore honors or peer tutoring leadership |
| **Medium-Risk Student** | 5 / 6 units | 10.9 / 20 | Yes (1) | **Class 0** | **43.4%** | 🟡 **Medium Risk** | Schedule mid-term academic check-in; discuss study skills |
| **High-Risk Student** | 0 / 6 units | 0.0 / 20 | No (0) | **Class 1** | **98.0%** | 🔴 **High Risk** | Immediate advisor intervention; financial aid installment plan; course re-enrollment review |

---

## 5. Automated Verification & Test Coverage

The test suite in `test_app.py` exercises 8 automated integration checks:

1. `GET /` — Verifies home page HTML rendering, navigation, and Stage 8 result UI containers.
2. `GET /health` — Confirms server health, model loading status, and feature requirements.
3. `GET /api/sample/<tier>` — Validates authentic pre-fill payloads for low, medium, and high risk profiles.
4. `POST /predict (Low Risk)` — Confirms Class 0, probability `< 30%`, green badge, and suggestions.
5. `POST /predict (Medium Risk)` — Confirms probability between `30%` and `60%`, amber badge, and suggestions.
6. `POST /predict (High Risk)` — Confirms Class 1, probability `>= 60%`, red badge, and urgent suggestions.
7. `POST /predict (Missing Field)` — Validates that missing features trigger an HTTP 400 Bad Request error.
8. `POST /predict (Invalid Data)` — Validates that non-numeric inputs trigger an HTTP 400 Bad Request error.

**Result:** `8 / 8 tests passed successfully (100% pass rate)`.

---

## 6. How to Run and Interact with the Web Application

1. **Activate virtual environment (if applicable) and open terminal in project directory:**
   ```powershell
   cd c:\Users\chila\OneDrive\Desktop\student_dropout_prediction
   ```

2. **Run integration test suite:**
   ```powershell
   python test_app.py
   ```

3. **Start the Flask web application:**
   ```powershell
   python app.py
   ```

4. **Access the application in your browser:**
   ```
   http://127.0.0.1:5000
   ```

5. **Test Predictions:**
   - Click any of the **1-Click Sample Profile buttons** (*"Sample Low Risk"*, *"Sample Medium Risk"*, or *"Sample High Risk"*).
   - Click **"Evaluate Student Dropout Risk"**.
   - Observe the live Machine Learning inference results, animated progress gauge, supportive suggestions, and ethical notice.
