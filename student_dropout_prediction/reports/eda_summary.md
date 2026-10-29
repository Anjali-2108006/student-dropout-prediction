# Exploratory Data Analysis (EDA) Summary Report
**Project:** AI-Based Student Dropout Prediction and Early Warning System  
**Dataset Scope:** Training Set (3,539 student records)  
**Date:** 2026-10-28  

---

## 1. Executive Summary & Class Distribution
The training set comprises **3,539 student records** with **36 predictive attributes**.

- **Retained Students (Class 0):** 2,402 students (67.87%)
- **At-Risk Students (Class 1):** 1,137 students (32.13%)
- **Class Balance:** Approximately 2.1 : 1. The minority class is adequately represented, eliminating the immediate need for aggressive synthetic sampling (like SMOTE).

---

## 2. Key Descriptive Patterns Observed

### A. Academic Performance Metrics
1. **Curricular Units Approved in 1st Semester:**
   - Retained students pass an average of **5.69 units**.
   - At-risk students pass an average of only **2.53 units**.
   - *Correlation with Dropout Risk:* Strong negative correlation (**-0.48**).
2. **Curricular Units Approved in 2nd Semester:**
   - Retained students pass an average of **5.58 units**.
   - At-risk students pass an average of only **1.95 units**.
   - *Correlation with Dropout Risk:* Strongest negative correlation (**-0.57**).
3. **1st Semester Grade Averages:**
   - Retained students maintain an average grade of **12.19 / 20**.
   - At-risk students average **7.28 / 20**.

### B. Socio-Economic and Financial Health
1. **Tuition Fee Delinquency (`Tuition fees up to date`):**
   - Students whose tuition is **not up to date** exhibit a **86.71% dropout rate**.
   - Students whose tuition is **up to date** have only a **24.9% dropout rate**.
2. **Debtor Status (`Debtor`):**
   - Students with recognized financial debt show a **62.95% dropout rate**, compared to **28.06%** for debt-free students.
3. **Scholarship Support (`Scholarship holder`):**
   - Scholarship recipients experience a markedly lower dropout rate (**12.1%**) compared to non-recipients (**38.64%**).

### C. Demographic Factors
- **Age at Enrollment:** Older students entering university (age > 24) show a higher propensity toward dropping out (mean age for at-risk is 25.8 vs. 21.9 for retained students), likely reflecting competing employment and familial responsibilities.

---

## 3. Correlation vs. Causation: Critical Methodological Distinction
> **IMPORTANT SCIENTIFIC CAVEAT:**  
> All relationships highlighted in this report represent **observed statistical associations**, NOT direct causal mechanisms.
> - A student who is a `Debtor` is statistically more likely to drop out, but debt itself may simply be a proxy for broader systemic financial instability or job loss.
> - An older student (`Age at enrollment`) does not drop out *because* of their age; rather, age correlates with external obligations such as full-time employment and child care.

---

## 4. Most Promising Features for Machine Learning

1. **Academic Progress Signals:**
   - `Curricular units 1st sem (approved)`
   - `Curricular units 1st sem (grade)`
   - `Curricular units 1st sem (evaluations)`
   - `Curricular units 1st sem (without evaluations)`
2. **Financial Stress Signals:**
   - `Tuition fees up to date`
   - `Debtor`
   - `Scholarship holder`
3. **Background Signals:**
   - `Age at enrollment`
   - `Admission grade`
   - `Previous qualification (grade)`

---

## 5. Temporal Limitations & Data Leakage Considerations

1. **Second-Semester Features as Post-Hoc Data:**
   - While `Curricular units 2nd sem (approved)` is the strongest mathematical predictor (correlation -0.57), in a real-world **Early Warning System**, 2nd semester grades are unavailable at the start of the academic cycle.
   - For benchmark model training, we will assess models with both full features and 1st-semester-only features.
2. **Leakage Protection:**
   - All exploratory analysis was conducted exclusively on `train_data.csv`. The test set (`test_data.csv`) remains completely quarantined.

---

## 6. Generated Visualizations
The following figures have been created and saved in `reports/figures/`:
1. `01_dropout_distribution.png` — Target class distribution (Bar and Pie charts).
2. `02_sem1_grades_vs_dropout.png` — Boxplot comparing 1st-semester grades across classes.
3. `03_sem1_approved_units_vs_dropout.png` — Density plot of passed units.
4. `04_age_enrollment_vs_dropout.png` — Stacked histogram of age distribution.
5. `05_financial_factors_vs_dropout.png` — Risk rates by Tuition, Debt, and Scholarship status.
6. `06_academic_performance_comparison.png` — Side-by-side bar chart of Sem 1 vs Sem 2 performance.
7. `07_numerical_correlation_heatmap.png` — Correlation matrix of continuous features.

---

## 7. Next Steps: Stage 5
In **Stage 5**, we will move to **Machine Learning Model Training & Comparison**:
- Train baseline classifiers: Logistic Regression, Random Forest, and Gradient Boosting.
- Evaluate Accuracy, Precision, Recall (especially on Class 1 / At-Risk), F1-Score, and ROC-AUC.
- Compare models and select the best candidate for the Early Warning System.
