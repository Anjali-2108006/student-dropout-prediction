"""
=============================================================================
Stage 4: Exploratory Data Analysis (EDA)
Project: AI-Based Student Dropout Prediction and Early Warning System
=============================================================================
This script performs a comprehensive exploratory data analysis on the
training set (3,539 student records):
1. Loads dataset/train_data.csv and models/feature_metadata.json.
2. Computes summary statistics, class distributions, and academic comparisons.
3. Generates and saves high-resolution visualizations in reports/figures/:
   - 01_dropout_distribution.png
   - 02_sem1_grades_vs_dropout.png
   - 03_sem1_approved_units_vs_dropout.png
   - 04_age_enrollment_vs_dropout.png
   - 05_financial_factors_vs_dropout.png (Debtor, Tuition, Scholarship)
   - 06_academic_performance_comparison.png (Sem 1 vs Sem 2)
   - 07_numerical_correlation_heatmap.png (Excluding nominal categories)
4. Generates a detailed markdown report: reports/eda_summary.md.
=============================================================================
"""

import os
import sys
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend suitable for headless generation
import matplotlib.pyplot as plt
import seaborn as sns

# Windows console UTF-8 handling
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Visual styling
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.labelsize": 11,
    "figure.titlesize": 15,
    "figure.autolayout": True,
})


def get_paths():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    models_dir = os.path.join(base_dir, "models")
    reports_dir = os.path.join(base_dir, "reports")
    figures_dir = os.path.join(reports_dir, "figures")

    os.makedirs(figures_dir, exist_ok=True)

    return {
        "train_csv": os.path.join(dataset_dir, "train_data.csv"),
        "meta_json": os.path.join(models_dir, "feature_metadata.json"),
        "figures_dir": figures_dir,
        "eda_report": os.path.join(reports_dir, "eda_summary.md"),
    }


def main():
    print("=" * 78)
    print("STAGE 4: EXPLORATORY DATA ANALYSIS (EDA)")
    print("Project: AI-Based Student Dropout Prediction and Early Warning System")
    print("=" * 78)

    paths = get_paths()

    # 1. Load Training Data & Metadata
    print(f"\n[OK] Loading training data from: {paths['train_csv']}")
    df = pd.read_csv(paths["train_csv"])

    with open(paths["meta_json"], "r", encoding="utf-8") as f:
        meta = json.load(f)

    # 2. Display Dataset Dimensions & Structure
    print("\n--- DATASET OVERVIEW (TRAINING SET ONLY) ---")
    print(f"Total Training Records : {df.shape[0]:,} students")
    print(f"Total Columns          : {df.shape[1]} (36 Features + 'Dropout_Risk')")
    print(f"Analysis Scope         : Strictly training split (Prevents test data leakage)")

    # 3. Class Counts & Percentages
    target_counts = df["Dropout_Risk"].value_counts()
    target_pct = df["Dropout_Risk"].value_counts(normalize=True) * 100

    n_retained = int(target_counts[0])
    n_at_risk = int(target_counts[1])
    pct_retained = target_pct[0]
    pct_at_risk = target_pct[1]

    print("\n--- DROPOUT RISK DISTRIBUTION ---")
    print(f"  • Retained (Class 0) : {n_retained:,} students ({pct_retained:.2f}%)")
    print(f"  • At-Risk  (Class 1) : {n_at_risk:,} students ({pct_at_risk:.2f}%)")
    print(f"  • Total Training     : {len(df):,} students")

    # 4. Summary Statistics
    print("\n--- SUMMARY STATISTICS OF KEY NUMERICAL FEATURES ---")
    key_metrics = [
        "Age at enrollment",
        "Curricular units 1st sem (enrolled)",
        "Curricular units 1st sem (approved)",
        "Curricular units 1st sem (grade)",
        "Curricular units 1st sem (evaluations)",
        "Curricular units 2nd sem (approved)",
        "Curricular units 2nd sem (grade)",
    ]
    summary_stats = df[key_metrics].describe().T[["mean", "std", "min", "50%", "max"]]
    summary_stats.rename(columns={"50%": "median"}, inplace=True)
    print(summary_stats.round(2).to_string())

    # 5. Comparing Academic Performance between Groups
    print("\n--- COMPARATIVE ANALYSIS: AT-RISK vs. RETAINED STUDENTS ---")
    comp_cols = [
        "Curricular units 1st sem (approved)",
        "Curricular units 1st sem (grade)",
        "Curricular units 1st sem (evaluations)",
        "Curricular units 2nd sem (approved)",
        "Curricular units 2nd sem (grade)",
        "Age at enrollment",
    ]
    group_comp = df.groupby("Dropout_Risk")[comp_cols].mean().T
    group_comp.columns = ["Retained (Mean)", "At-Risk (Mean)"]
    group_comp["Difference (AtRisk - Retained)"] = group_comp["At-Risk (Mean)"] - group_comp["Retained (Mean)"]
    print(group_comp.round(2).to_string())

    # Financial Factors Comparison
    print("\n--- FINANCIAL & ADMINISTRATIVE RISK RATES ---")
    def get_risk_rate(col_name):
        rates = df.groupby(col_name)["Dropout_Risk"].agg(["count", "mean"])
        rates["Dropout Rate (%)"] = (rates["mean"] * 100).round(2)
        return rates

    tuition_rates = get_risk_rate("Tuition fees up to date")
    debtor_rates = get_risk_rate("Debtor")
    scholarship_rates = get_risk_rate("Scholarship holder")

    print("\nTuition Fees Up To Date (0 = No, 1 = Yes):")
    print(tuition_rates[["count", "Dropout Rate (%)"]].to_string())

    print("\nDebtor Status (0 = No, 1 = Yes / Has Debt):")
    print(debtor_rates[["count", "Dropout Rate (%)"]].to_string())

    print("\nScholarship Holder (0 = No, 1 = Yes):")
    print(scholarship_rates[["count", "Dropout Rate (%)"]].to_string())

    # -------------------------------------------------------------------------
    # GENERATING VISUALIZATIONS
    # -------------------------------------------------------------------------
    print("\n--- GENERATING VISUALIZATIONS (REPORTS/FIGURES) ---")

    # Chart 1: Dropout Class Distribution (Bar + Pie)
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    bar_colors = ["#2ecc71", "#e74c3c"]
    axes[0].bar(["Retained (0)", "At-Risk (1)"], [n_retained, n_at_risk], color=bar_colors, width=0.5, edgecolor="black")
    axes[0].set_title("Student Count by Retention Status", pad=12)
    axes[0].set_ylabel("Number of Students")
    for idx, val in enumerate([n_retained, n_at_risk]):
        axes[0].text(idx, val + 50, f"{val:,}\n({val/len(df)*100:.1f}%)", ha="center", fontweight="bold")
    axes[0].set_ylim(0, max(n_retained, n_at_risk) * 1.15)

    axes[1].pie(
        [n_retained, n_at_risk],
        labels=["Retained (Graduate/Enrolled)", "At-Risk (Dropout)"],
        autopct="%1.1f%%",
        colors=bar_colors,
        startangle=140,
        wedgeprops={"edgecolor": "white", "linewidth": 2},
        explode=(0, 0.08)
    )
    axes[1].set_title("Dropout Risk Proportion (Training Set)", pad=12)
    plt.savefig(os.path.join(paths["figures_dir"], "01_dropout_distribution.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 01_dropout_distribution.png")

    # Chart 2: First-Semester Grades vs Dropout
    plt.figure(figsize=(9, 5))
    sns.boxplot(
        x="Dropout_Risk",
        y="Curricular units 1st sem (grade)",
        data=df,
        hue="Dropout_Risk",
        legend=False,
        palette=["#2ecc71", "#e74c3c"]
    )
    plt.xticks([0, 1], ["Retained (Class 0)", "At-Risk (Class 1)"])
    plt.xlabel("Student Category")
    plt.ylabel("1st Semester Average Grade (0 - 20 Scale)")
    plt.title("First-Semester Grade Distribution by Dropout Risk Status", pad=12)
    plt.savefig(os.path.join(paths["figures_dir"], "02_sem1_grades_vs_dropout.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 02_sem1_grades_vs_dropout.png")

    # Chart 3: Approved Curricular Units in 1st Sem vs Dropout
    plt.figure(figsize=(9, 5))
    sns.kdeplot(
        data=df,
        x="Curricular units 1st sem (approved)",
        hue="Dropout_Risk",
        palette=["#2ecc71", "#e74c3c"],
        common_norm=False,
        fill=True,
        alpha=0.4,
        linewidth=2
    )
    plt.title("Distribution of 1st Semester Approved Units", pad=12)
    plt.xlabel("Number of Curricular Units Approved (1st Sem)")
    plt.ylabel("Density")
    plt.legend(title="Risk Status", labels=["At-Risk (1)", "Retained (0)"])
    plt.savefig(os.path.join(paths["figures_dir"], "03_sem1_approved_units_vs_dropout.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 03_sem1_approved_units_vs_dropout.png")

    # Chart 4: Age at Enrollment vs Dropout
    plt.figure(figsize=(9, 5))
    sns.histplot(
        data=df,
        x="Age at enrollment",
        hue="Dropout_Risk",
        palette=["#2ecc71", "#e74c3c"],
        multiple="stack",
        bins=25,
        edgecolor="white"
    )
    plt.title("Age at Enrollment Distribution (Stacked by Dropout Status)", pad=12)
    plt.xlabel("Age at Enrollment (Years)")
    plt.ylabel("Student Count")
    plt.legend(title="Risk Status", labels=["At-Risk (1)", "Retained (0)"])
    plt.savefig(os.path.join(paths["figures_dir"], "04_age_enrollment_vs_dropout.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 04_age_enrollment_vs_dropout.png")

    # Chart 5: Financial Factors (Debtor, Tuition, Scholarship)
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    def plot_bar_rate(ax, col, title, labels):
        risk_rates = df.groupby(col)["Dropout_Risk"].mean() * 100
        bars = ax.bar(labels, risk_rates, color=["#3498db", "#e67e22"], edgecolor="black", width=0.5)
        ax.set_title(title, pad=10)
        ax.set_ylabel("Dropout Risk Rate (%)")
        ax.set_ylim(0, 100)
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width() / 2, height + 2, f"{height:.1f}%", ha="center", fontweight="bold")

    plot_bar_rate(axes[0], "Tuition fees up to date", "Tuition Fees Status", ["Overdue (0)", "Up to Date (1)"])
    plot_bar_rate(axes[1], "Debtor", "Student Debt Status", ["No Debt (0)", "Has Debt (1)"])
    plot_bar_rate(axes[2], "Scholarship holder", "Scholarship Status", ["No Scholarship (0)", "Scholarship (1)"])

    plt.suptitle("Impact of Socio-Economic & Financial Indicators on Dropout Risk", fontsize=14, y=1.02)
    plt.savefig(os.path.join(paths["figures_dir"], "05_financial_factors_vs_dropout.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 05_financial_factors_vs_dropout.png")

    # Chart 6: Academic Performance Comparison: Sem 1 vs Sem 2
    sem_comp_data = pd.DataFrame({
        "Metric": [
            "1st Sem Approved", "2nd Sem Approved",
            "1st Sem Grade", "2nd Sem Grade",
            "1st Sem Evals", "2nd Sem Evals",
        ],
        "Retained": [
            df[df["Dropout_Risk"] == 0]["Curricular units 1st sem (approved)"].mean(),
            df[df["Dropout_Risk"] == 0]["Curricular units 2nd sem (approved)"].mean(),
            df[df["Dropout_Risk"] == 0]["Curricular units 1st sem (grade)"].mean(),
            df[df["Dropout_Risk"] == 0]["Curricular units 2nd sem (grade)"].mean(),
            df[df["Dropout_Risk"] == 0]["Curricular units 1st sem (evaluations)"].mean(),
            df[df["Dropout_Risk"] == 0]["Curricular units 2nd sem (evaluations)"].mean(),
        ],
        "At-Risk": [
            df[df["Dropout_Risk"] == 1]["Curricular units 1st sem (approved)"].mean(),
            df[df["Dropout_Risk"] == 1]["Curricular units 2nd sem (approved)"].mean(),
            df[df["Dropout_Risk"] == 1]["Curricular units 1st sem (grade)"].mean(),
            df[df["Dropout_Risk"] == 1]["Curricular units 2nd sem (grade)"].mean(),
            df[df["Dropout_Risk"] == 1]["Curricular units 1st sem (evaluations)"].mean(),
            df[df["Dropout_Risk"] == 1]["Curricular units 2nd sem (evaluations)"].mean(),
        ],
    })

    plt.figure(figsize=(11, 5))
    x = np.arange(len(sem_comp_data["Metric"]))
    width = 0.35
    plt.bar(x - width/2, sem_comp_data["Retained"], width, label="Retained Students", color="#2ecc71", edgecolor="black")
    plt.bar(x + width/2, sem_comp_data["At-Risk"], width, label="At-Risk Students", color="#e74c3c", edgecolor="black")
    plt.xticks(x, sem_comp_data["Metric"], rotation=15, ha="right")
    plt.ylabel("Average Value")
    plt.title("Academic Metric Comparison: Retained vs. At-Risk Students", pad=12)
    plt.legend()
    plt.savefig(os.path.join(paths["figures_dir"], "06_academic_performance_comparison.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 06_academic_performance_comparison.png")

    # Chart 7: Correlation Heatmap for Continuous Numerical Features ONLY
    # Strictly exclude integer-coded nominals (Marital status, Application mode, Course, Nationality, etc.)
    num_cols = meta.get("continuous_numerical_features", meta.get("continuous_numerical", []))
    num_features = num_cols + ["Dropout_Risk"]
    corr_matrix = df[num_features].corr()

    plt.figure(figsize=(14, 11))
    sns.heatmap(
        corr_matrix,
        cmap="coolwarm",
        annot=True,
        fmt=".2f",
        linewidths=0.5,
        cbar_kws={"shrink": 0.8},
        annot_kws={"size": 8}
    )
    plt.title("Correlation Matrix of Continuous Numerical Features & Dropout Risk\n(Strictly Excludes Nominal Categorical Variables)", pad=14)
    plt.savefig(os.path.join(paths["figures_dir"], "07_numerical_correlation_heatmap.png"), dpi=200, bbox_inches="tight")
    plt.close()
    print("[OK] Saved: 07_numerical_correlation_heatmap.png")

    # -------------------------------------------------------------------------
    # GENERATING MARKDOWN SUMMARY REPORT
    # -------------------------------------------------------------------------
    report_content = f"""# Exploratory Data Analysis (EDA) Summary Report
**Project:** AI-Based Student Dropout Prediction and Early Warning System  
**Dataset Scope:** Training Set ({len(df):,} student records)  
**Date:** 2026-10-28  

---

## 1. Executive Summary & Class Distribution
The training set comprises **{len(df):,} student records** with **36 predictive attributes**.

- **Retained Students (Class 0):** {n_retained:,} students ({pct_retained:.2f}%)
- **At-Risk Students (Class 1):** {n_at_risk:,} students ({pct_at_risk:.2f}%)
- **Class Balance:** Approximately 2.1 : 1. The minority class is adequately represented, eliminating the immediate need for aggressive synthetic sampling (like SMOTE).

---

## 2. Key Descriptive Patterns Observed

### A. Academic Performance Metrics
1. **Curricular Units Approved in 1st Semester:**
   - Retained students pass an average of **{df[df['Dropout_Risk']==0]['Curricular units 1st sem (approved)'].mean():.2f} units**.
   - At-risk students pass an average of only **{df[df['Dropout_Risk']==1]['Curricular units 1st sem (approved)'].mean():.2f} units**.
   - *Correlation with Dropout Risk:* Strong negative correlation (**{corr_matrix.loc['Curricular units 1st sem (approved)', 'Dropout_Risk']:.2f}**).
2. **Curricular Units Approved in 2nd Semester:**
   - Retained students pass an average of **{df[df['Dropout_Risk']==0]['Curricular units 2nd sem (approved)'].mean():.2f} units**.
   - At-risk students pass an average of only **{df[df['Dropout_Risk']==1]['Curricular units 2nd sem (approved)'].mean():.2f} units**.
   - *Correlation with Dropout Risk:* Strongest negative correlation (**{corr_matrix.loc['Curricular units 2nd sem (approved)', 'Dropout_Risk']:.2f}**).
3. **1st Semester Grade Averages:**
   - Retained students maintain an average grade of **{df[df['Dropout_Risk']==0]['Curricular units 1st sem (grade)'].mean():.2f} / 20**.
   - At-risk students average **{df[df['Dropout_Risk']==1]['Curricular units 1st sem (grade)'].mean():.2f} / 20**.

### B. Socio-Economic and Financial Health
1. **Tuition Fee Delinquency (`Tuition fees up to date`):**
   - Students whose tuition is **not up to date** exhibit a **{tuition_rates.loc[0, 'Dropout Rate (%)']}% dropout rate**.
   - Students whose tuition is **up to date** have only a **{tuition_rates.loc[1, 'Dropout Rate (%)']}% dropout rate**.
2. **Debtor Status (`Debtor`):**
   - Students with recognized financial debt show a **{debtor_rates.loc[1, 'Dropout Rate (%)']}% dropout rate**, compared to **{debtor_rates.loc[0, 'Dropout Rate (%)']}%** for debt-free students.
3. **Scholarship Support (`Scholarship holder`):**
   - Scholarship recipients experience a markedly lower dropout rate (**{scholarship_rates.loc[1, 'Dropout Rate (%)']}%**) compared to non-recipients (**{scholarship_rates.loc[0, 'Dropout Rate (%)']}%**).

### C. Demographic Factors
- **Age at Enrollment:** Older students entering university (age > 24) show a higher propensity toward dropping out (mean age for at-risk is {df[df['Dropout_Risk']==1]['Age at enrollment'].mean():.1f} vs. {df[df['Dropout_Risk']==0]['Age at enrollment'].mean():.1f} for retained students), likely reflecting competing employment and familial responsibilities.

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
   - While `Curricular units 2nd sem (approved)` is the strongest mathematical predictor (correlation {corr_matrix.loc['Curricular units 2nd sem (approved)', 'Dropout_Risk']:.2f}), in a real-world **Early Warning System**, 2nd semester grades are unavailable at the start of the academic cycle.
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
"""

    with open(paths["eda_report"], "w", encoding="utf-8") as f:
        f.write(report_content)
    print(f"[OK] Generated EDA summary report: {paths['eda_report']}")

    print("\n" + "=" * 78)
    print("STAGE 4 (EDA) COMPLETED SUCCESSFULLY!")
    print("=" * 78)


if __name__ == "__main__":
    main()
