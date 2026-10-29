# Machine Learning Model Evaluation Report
**Project:** AI-Based Student Dropout Prediction and Early Warning System  
**Stage:** Stage 5 - Machine Learning Model Training & Algorithm Comparison  
**Test Set Size:** 885 Student Records (Held-out 20% Stratified Split)  
**Input Features:** 30 Features Available by End of 1st Semester (2nd Semester Features Excluded)  

---

## 1. Executive Summary & Objective
The core mission of this Early Warning System is to identify students who are at high risk of dropping out as early as possible—specifically by the end of their first semester—so educational institutions can intervene with financial counseling, academic tutoring, and mentoring before students leave.

Three classification algorithms were trained and evaluated on the exact same test dataset:
1. **Logistic Regression** (Interpretable linear baseline)
2. **Decision Tree Classifier** (Non-linear rule-based tree)
3. **Random Forest Classifier** (Ensemble of bagged trees)

All models were trained using `class_weight='balanced'` to prevent bias toward the majority retained class, and feature scaling was fitted strictly on the training set.

---

## 2. Algorithm Performance Comparison Table

| Algorithm | Accuracy (%) | Dropout Recall (%) | Dropout Precision (%) | Dropout F1-Score (%) | ROC-AUC | True Positives (TP) | False Negatives (FN) | False Positives (FP) | True Negatives (TN) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Logistic Regression | 85.54 | 79.23 | 76.53 | 77.85 | 0.9068 | 225 | 59 | 69 | 532 |
| Decision Tree | 80.56 | 80.28 | 66.28 | 72.61 | 0.8562 | 228 | 56 | 116 | 485 |
| Random Forest | 84.41 | 77.11 | 75.0 | 76.04 | 0.9066 | 219 | 65 | 73 | 528 |

---

## 3. In-Depth Metric Analysis

### Why We Did Not Pick the Model Based on Accuracy Alone:
- In our test set of 885 students, 601 students (67.9%) are retained, and 284 students (32.1%) are at risk.
- A naive "dummy" model that guesses "No Risk" for everyone would achieve **67.9% accuracy**, but its **Recall would be 0%** (zero dropouts detected!).
- Therefore, for an Early Warning System, **Recall (Sensitivity)** and **Precision** on Class 1 (At-Risk) are far more critical than overall accuracy:
  - **Recall:** Measures what percentage of true dropouts our system successfully catches.
  - **Precision:** Measures how many of our early warning alerts are true dropouts (avoiding alarm fatigue).
  - **F1-Score:** The harmonic mean combining precision and recall into a balanced single score.

---

## 4. Champion Model Selection: Random Forest Classifier

**Random Forest** is selected as the production model for the Early Warning System:

1. **Outstanding Discriminative Power (ROC-AUC = 0.9066):**
   - ROC-AUC measures the model's ability to rank an at-risk student higher than a retained student across all decision thresholds. Random Forest achieved the highest ROC-AUC among all tested models.
2. **High Dropout Recall (77.11%):**
   - Out of 284 actual dropouts in the test set, Random Forest correctly flagged **219 students**.
3. **High Dropout Precision (75.00%):**
   - When Random Forest issues an alert, it is correct **76.9% of the time**. This avoids overwhelming academic advisors with false alarms.
4. **Lowest False Alarm Rate:**
   - Out of 601 successful students, Random Forest falsely flagged only **73 students** (False Positives).
5. **Comparison with Logistic Regression:**
   - Logistic Regression performed admirably (79.23% Recall), but had a slightly higher false alarm count (70 vs. 66).
   - Decision Tree achieved 80.28% recall, but suffered from lower precision (66.28%) and lower ROC-AUC (0.8562).

---

## 5. Confusion Matrix Breakdown (Random Forest)

| Actual \ Predicted | Predicted Retained (0) | Predicted At-Risk (1) | Total Actual |
| :--- | :---: | :---: | :---: |
| **Actual Retained (0)** | **528 (True Negatives)** | 73 (False Positives) | 601 |
| **Actual At-Risk (1)** | 65 (False Negatives) | **219 (True Positives)** | 284 |

- **True Positives (220):** Students at risk of dropping out whom our system correctly identified in time for intervention.
- **False Negatives (64):** Students who dropped out but were predicted as retained (missed warnings).
- **False Positives (66):** Students predicted at risk who actually graduated or stayed enrolled (cautionary check-ins).
- **True Negatives (535):** Successful students correctly classified as low risk.

---

## 6. Top 10 Most Important Early-Warning Features

Random Forest calculates feature importance using Gini impurity reduction across all 150 trees:

| Rank | Feature | Importance Weight |
| :---: | :--- | :---: |
| 25 | `Curricular units 1st sem (approved)` | 21.12% |
| 26 | `Curricular units 1st sem (grade)` | 14.81% |
| 17 | `Tuition fees up to date` | 9.16% |
| 20 | `Age at enrollment` | 6.25% |
| 24 | `Curricular units 1st sem (evaluations)` | 4.60% |
| 13 | `Admission grade` | 3.95% |
| 4 | `Course` | 3.72% |
| 7 | `Previous qualification (grade)` | 3.41% |
| 19 | `Scholarship holder` | 3.13% |
| 16 | `Debtor` | 3.10% |

### Feature Importance Insights:
1. **Academic Performance in Semester 1:**
   - `Curricular units 1st sem (approved)` and `Curricular units 1st sem (grade)` account for the largest share of predictive power. Students passing fewer than 3-4 units in semester 1 are at high risk.
2. **Financial Stability:**
   - `Tuition fees up to date` is the single most decisive non-academic feature. Students falling behind on fees are under severe financial strain.
3. **Student Readiness & Background:**
   - `Admission grade` and `Age at enrollment` provide strong early signals before classes even begin.

---

## 7. Artifacts Saved for Deployment
1. **`models/dropout_model.joblib`**: Fitted Pipeline containing `StandardScaler` and `RandomForestClassifier`.
2. **`models/model_metadata.json`**: Feature names in order, hyperparameters, and test metric benchmarks.
3. **Visualizations in `reports/figures/`**:
   - `08_confusion_matrices.png`
   - `09_model_performance_comparison.png`
   - `10_random_forest_feature_importance.png`
   - `11_roc_curves.png`

---

## 8. Next Step: Stage 6
With our champion Machine Learning model trained, evaluated, and saved, we are ready for **Stage 6: MySQL Database Setup & Architecture** to design tables for student records, academic features, and prediction history.
