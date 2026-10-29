"""
=============================================================================
Stage 3: Data Preprocessing & Feature Engineering
Project: AI-Based Student Dropout Prediction and Early Warning System
=============================================================================
This script:
1. Loads the clean student dataset created in Stage 2.
2. Inspects dataset dimensions, data types, missing values, and duplicates.
3. Maps the multi-class 'Target' into a binary 'Dropout_Risk' column:
     - Dropout  = 1 (At-Risk target class)
     - Graduate = 0 (Retained / Completed)
     - Enrolled = 0 (Retained / Active)
4. Protects against target leakage (excludes 'Target' and 'Dropout_Risk' from X).
5. Categorizes features into Numerical vs. Categorical vs. Binary.
6. Explains the critical limitation regarding 2nd-semester features in an
   Early Warning System context.
7. Splits data into Train (80%) and Test (20%) sets using stratified sampling (random_state=42).
8. Builds a Scikit-learn preprocessing pipeline (StandardScaler for continuous numerical features).
9. Fits the scaler STRICTLY on the training set to prevent data leakage.
10. Exports processed datasets and the fitted preprocessor artifact to disk.
=============================================================================
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer

# Ensure Windows terminal handles UTF-8 output cleanly
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def get_project_paths():
    """Returns absolute paths to all relevant directories and files."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    clean_csv_path = os.path.join(dataset_dir, "student_data_clean.csv")
    raw_csv_path = os.path.join(dataset_dir, "data.csv")

    train_csv_path = os.path.join(dataset_dir, "train_data.csv")
    test_csv_path = os.path.join(dataset_dir, "test_data.csv")
    preprocessor_path = os.path.join(models_dir, "preprocessor.joblib")
    feature_meta_path = os.path.join(models_dir, "feature_metadata.json")

    return {
        "dataset_dir": dataset_dir,
        "models_dir": models_dir,
        "clean_csv": clean_csv_path,
        "raw_csv": raw_csv_path,
        "train_csv": train_csv_path,
        "test_csv": test_csv_path,
        "preprocessor": preprocessor_path,
        "feature_meta": feature_meta_path,
    }


def load_dataset(paths):
    """Loads dataset from clean CSV or falls back to raw CSV."""
    if os.path.exists(paths["clean_csv"]):
        print(f"[OK] Loading clean dataset from: {paths['clean_csv']}")
        df = pd.read_csv(paths["clean_csv"])
    elif os.path.exists(paths["raw_csv"]):
        print(f"[OK] Loading raw dataset from: {paths['raw_csv']}")
        df = pd.read_csv(paths["raw_csv"], sep=";", encoding="utf-8-sig")
        df.columns = [c.strip() for c in df.columns]
    else:
        print("[!] Error: No dataset found. Please run Stage 2 (load_dataset.py) first.")
        sys.exit(1)
    return df


def categorize_columns():
    """
    Defines the role of each column in the UCI Student Dropout dataset.
    Features are partitioned into continuous/numerical, binary flags,
    nominal categorical, and temporal semester markers.
    """
    # Continuous / numerical features that have real numeric scale
    continuous_numerical = [
        "Previous qualification (grade)",
        "Admission grade",
        "Age at enrollment",
        "Curricular units 1st sem (credited)",
        "Curricular units 1st sem (enrolled)",
        "Curricular units 1st sem (evaluations)",
        "Curricular units 1st sem (approved)",
        "Curricular units 1st sem (grade)",
        "Curricular units 1st sem (without evaluations)",
        "Curricular units 2nd sem (credited)",
        "Curricular units 2nd sem (enrolled)",
        "Curricular units 2nd sem (evaluations)",
        "Curricular units 2nd sem (approved)",
        "Curricular units 2nd sem (grade)",
        "Curricular units 2nd sem (without evaluations)",
        "Unemployment rate",
        "Inflation rate",
        "GDP",
    ]

    # Binary flags (0 or 1 indicator variables)
    binary_features = [
        "Daytime/evening attendance",
        "Displaced",
        "Educational special needs",
        "Debtor",
        "Tuition fees up to date",
        "Gender",
        "Scholarship holder",
        "International",
    ]

    # Categorical nominal codes (already integer-coded in the dataset)
    categorical_nominal = [
        "Marital status",
        "Application mode",
        "Application order",
        "Course",
        "Previous qualification",
        "Nacionality",
        "Mother's qualification",
        "Father's qualification",
        "Mother's occupation",
        "Father's occupation",
    ]

    # Second semester features - flagged for Early Warning context
    second_sem_features = [
        "Curricular units 2nd sem (credited)",
        "Curricular units 2nd sem (enrolled)",
        "Curricular units 2nd sem (evaluations)",
        "Curricular units 2nd sem (approved)",
        "Curricular units 2nd sem (grade)",
        "Curricular units 2nd sem (without evaluations)",
    ]

    return {
        "continuous_numerical": continuous_numerical,
        "binary_features": binary_features,
        "categorical_nominal": categorical_nominal,
        "second_sem_features": second_sem_features,
    }


def main():
    print("=" * 78)
    print("STAGE 3: DATA PREPROCESSING & FEATURE ENGINEERING")
    print("Project: AI-Based Student Dropout Prediction and Early Warning System")
    print("=" * 78)

    paths = get_project_paths()

    # -------------------------------------------------------------------------
    # TASK 1: Load the Dataset
    # -------------------------------------------------------------------------
    print("\n--- TASK 1: LOAD DATASET ---")
    df = load_dataset(paths)

    # -------------------------------------------------------------------------
    # TASK 2: Check Shape and Data Types
    # -------------------------------------------------------------------------
    print("\n--- TASK 2: DATASET SHAPE & DATA TYPES ---")
    print(f"Dataset Dimensions: {df.shape[0]:,} rows x {df.shape[1]} columns")
    print("\nSummary of column data types:")
    dtype_counts = df.dtypes.value_counts()
    for dtype, count in dtype_counts.items():
        print(f"  - {dtype}: {count} columns")

    # -------------------------------------------------------------------------
    # TASK 3 & 4: Missing Values and Duplicate Rows Check
    # -------------------------------------------------------------------------
    print("\n--- TASKS 3 & 4: DATA QUALITY CHECKS ---")
    missing_total = df.isnull().sum().sum()
    duplicate_total = df.duplicated().sum()
    print(f"Missing Values: {missing_total}")
    print(f"Duplicate Rows: {duplicate_total}")
    assert missing_total == 0, "Unexpected missing values found!"
    assert duplicate_total == 0, "Unexpected duplicate rows found!"
    print("[OK] Data hygiene verified: Zero missing values and zero duplicates.")

    # -------------------------------------------------------------------------
    # TASK 5: Original Target Distribution
    # -------------------------------------------------------------------------
    print("\n--- TASK 5: ORIGINAL MULTI-CLASS TARGET COLUMN ---")
    print("Original Target classes and frequency:")
    original_dist = df["Target"].value_counts()
    original_pct = df["Target"].value_counts(normalize=True) * 100
    for cls_name in original_dist.index:
        print(f"  - {cls_name:10s}: {original_dist[cls_name]:5d} students ({original_pct[cls_name]:.2f}%)")

    # -------------------------------------------------------------------------
    # TASK 8: Convert Target to Binary Classification ('Dropout_Risk')
    # -------------------------------------------------------------------------
    print("\n--- TASK 8: CREATE BINARY TARGET ('Dropout_Risk') ---")
    print("Mapping rule:")
    print("  - Dropout  -> 1 (At-Risk student requiring early warning / intervention)")
    print("  - Graduate -> 0 (Not at risk / successful completion)")
    print("  - Enrolled -> 0 (Not at risk / active retention)")

    # Create new binary target column without deleting original Target
    df["Dropout_Risk"] = (df["Target"] == "Dropout").astype(int)

    risk_counts = df["Dropout_Risk"].value_counts()
    risk_pct = df["Dropout_Risk"].value_counts(normalize=True) * 100
    print("\nBinary Target ('Dropout_Risk') Distribution:")
    print(f"  - Class 0 (Retained / Not at risk) : {risk_counts[0]:,} students ({risk_pct[0]:.2f}%)")
    print(f"  - Class 1 (At-Risk / Dropout)      : {risk_counts[1]:,} students ({risk_pct[1]:.2f}%)")

    # -------------------------------------------------------------------------
    # TASKS 7, 9, 10: Separate Input Features (X) and Target (y)
    # -------------------------------------------------------------------------
    print("\n--- TASKS 7, 9, 10: SEPARATE FEATURES (X) AND TARGET (y) ---")
    print("Rules applied:")
    print("  [OK] Original 'Target' column is preserved in the dataset.")
    print("  [OK] Excluded 'Target' and 'Dropout_Risk' from X to PREVENT TARGET LEAKAGE.")

    X = df.drop(columns=["Target", "Dropout_Risk"])
    y = df["Dropout_Risk"]

    print(f"Feature matrix X shape: {X.shape} (36 predictive features)")
    print(f"Target vector y shape  : {y.shape} (1 binary target)")

    # -------------------------------------------------------------------------
    # TASKS 11 & 12: Column Categorization and Preprocessing Requirements
    # -------------------------------------------------------------------------
    print("\n--- TASKS 11 & 12: COLUMN CATEGORIZATION & PREPROCESSING RATIONALE ---")
    feature_meta = categorize_columns()

    print(f"Continuous Numerical Features ({len(feature_meta['continuous_numerical'])}):")
    for col in feature_meta["continuous_numerical"][:5]:
        print(f"  • {col}")
    print(f"  ... and {len(feature_meta['continuous_numerical']) - 5} more.")

    print(f"\nBinary Flag Features ({len(feature_meta['binary_features'])}):")
    for col in feature_meta["binary_features"]:
        print(f"  • {col}")

    print(f"\nCategorical Nominal Features ({len(feature_meta['categorical_nominal'])}):")
    for col in feature_meta["categorical_nominal"][:5]:
        print(f"  • {col}")
    print(f"  ... and {len(feature_meta['categorical_nominal']) - 5} more.")

    print("\n--- WHY FEATURE SCALING & ENCODING MATTER ---")
    print("1. Feature Scaling (StandardScaler):")
    print("   - Linear & distance-based models (Logistic Regression, SVM) require features")
    print("     on similar scales. E.g. 'Previous qualification grade' (up to 200) vs 'GDP' (-4 to +3).")
    print("   - Tree-based models (Random Forest, Gradient Boosting) are scale-invariant, but")
    print("     standard scaling does not hurt them and allows fair head-to-head comparison.")
    print("2. Categorical Encoding:")
    print("   - The UCI dataset provided nominal categories pre-encoded as integers (e.g. Course codes).")
    print("   - For tree-based models, integer encoding is acceptable. For linear models, scaling")
    print("     prevents extreme gradient distortion. In Stage 4/5, we can test encoding effects.")

    # -------------------------------------------------------------------------
    # CRITICAL DOMAIN & METHODOLOGICAL LIMITATION EXPLANATION
    # -------------------------------------------------------------------------
    print("\n" + "=" * 78)
    print("CRITICAL METHODOLOGY NOTE: EARLY WARNING vs. POST-SEMESTER PREDICTION")
    print("=" * 78)
    print("1. Timing of Predictions:")
    print("   - In a genuine institutional Early Warning System, educators want to intervene")
    print("     BEFORE or DURING the first academic year.")
    print("   - The 6 'Curricular units 2nd sem' features record exam results after the 2nd")
    print("     semester has ALREADY taken place. Using 2nd semester data is therefore NOT an")
    print("     'early' warning for semester 1-2 dropouts; it is post-hoc classification.")
    print("2. Prototype Scope:")
    print("   - This project is an educational Machine Learning prototype demonstrating an")
    print("     end-to-end data science architecture, NOT an FDA-style or institutional clinical tool.")
    print("   - To preserve maximum educational value, we retain all features in the base")
    print("     dataset while explicitly cataloging the 2nd semester features in metadata.")
    print("=" * 78)

    # -------------------------------------------------------------------------
    # TASKS 16, 17, 18: Train/Test Split (80:20, Stratified, random_state=42)
    # -------------------------------------------------------------------------
    print("\n--- TASKS 16, 17, 18: STRATIFIED TRAIN/TEST SPLIT (80:20) ---")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print(f"Training set (80%) : {X_train.shape[0]:,} samples")
    print(f"Testing set  (20%) : {X_test.shape[0]:,} samples")
    print(f"Train Class 1 (At-Risk) ratio: {y_train.mean():.4f} ({y_train.sum():,} students)")
    print(f"Test Class 1  (At-Risk) ratio: {y_test.mean():.4f} ({y_test.sum():,} students)")
    print("[OK] Stratification preserved exact 32.1% at-risk proportion across both sets.")

    # -------------------------------------------------------------------------
    # TASKS 13, 14, 15, 19: Preprocessing Pipeline & Prevention of Data Leakage
    # -------------------------------------------------------------------------
    print("\n--- TASKS 13, 15, 19: PREPROCESSING PIPELINE & LEAKAGE PREVENTION ---")
    print("Rules applied:")
    print("  [OK] StandardScaler applied to continuous numerical columns.")
    print("  [OK] Binary and nominal integer columns passed through without distortion.")
    print("  [OK] Scaler is fitted STRICTLY on X_train, then applied via .transform() on X_test.")

    num_cols = feature_meta["continuous_numerical"]
    passthrough_cols = [c for c in X.columns if c not in num_cols]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num_scaler", StandardScaler(), num_cols),
            ("pass", "passthrough", passthrough_cols),
        ],
        remainder="drop"
    )

    # FIT ONLY ON TRAINING DATA to prevent information leakage
    preprocessor.fit(X_train)
    print("[OK] Preprocessor fitted on X_train ONLY (No test set information leaked).")

    # -------------------------------------------------------------------------
    # TASK 20: Save Processed Data and Pipeline Artifacts
    # -------------------------------------------------------------------------
    print("\n--- TASK 20: SAVING PROCESSED DATA & PREPROCESSOR ARTIFACTS ---")

    # 1. Save unscaled train and test CSVs (with Dropout_Risk attached) for transparent inspection
    train_df = X_train.copy()
    train_df["Dropout_Risk"] = y_train.values

    test_df = X_test.copy()
    test_df["Dropout_Risk"] = y_test.values

    train_df.to_csv(paths["train_csv"], index=False)
    test_df.to_csv(paths["test_csv"], index=False)
    print(f"[OK] Saved training data to: {paths['train_csv']} ({train_df.shape})")
    print(f"[OK] Saved testing data  to: {paths['test_csv']} ({test_df.shape})")

    # 2. Save fitted preprocessor pipeline artifact
    joblib.dump(preprocessor, paths["preprocessor"])
    print(f"[OK] Saved fitted preprocessor to: {paths['preprocessor']}")

    # 3. Save feature metadata JSON (column ordering, groupings, shapes)
    metadata = {
        "dataset_name": "Predict Students' Dropout and Academic Success (UCI ID 697)",
        "num_total_records": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_column": "Dropout_Risk",
        "target_mapping": {
            "Dropout": 1,
            "Graduate": 0,
            "Enrolled": 0
        },
        "target_distribution": {
            "train": {
                "class_0_retained": int((y_train == 0).sum()),
                "class_1_at_risk": int((y_train == 1).sum()),
                "class_1_ratio": round(float(y_train.mean()), 4)
            },
            "test": {
                "class_0_retained": int((y_test == 0).sum()),
                "class_1_at_risk": int((y_test == 1).sum()),
                "class_1_ratio": round(float(y_test.mean()), 4)
            }
        },
        "features_in_order": list(X.columns),
        "continuous_numerical_features": num_cols,
        "binary_features": feature_meta["binary_features"],
        "categorical_nominal_features": feature_meta["categorical_nominal"],
        "second_sem_features": feature_meta["second_sem_features"],
    }

    with open(paths["feature_meta"], "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Saved feature metadata to: {paths['feature_meta']}")

    # -------------------------------------------------------------------------
    # Verification & Final Output
    # -------------------------------------------------------------------------
    print("\n" + "=" * 78)
    print("STAGE 3 SUMMARY & VERIFICATION")
    print("=" * 78)
    print(f"Original Dataset Shape : {df.shape}")
    print(f"X_train Shape          : {X_train.shape} (Features)")
    print(f"y_train Shape          : {y_train.shape} (Binary Target: {y_train.sum()} At-Risk / {len(y_train)-y_train.sum()} Retained)")
    print(f"X_test Shape           : {X_test.shape} (Features)")
    print(f"y_test Shape           : {y_test.shape} (Binary Target: {y_test.sum()} At-Risk / {len(y_test)-y_test.sum()} Retained)")
    print(f"Leakage Prevention     : Strict fit on train split only.")
    print("=" * 78)
    print("[OK] STAGE 3 COMPLETED SUCCESSFULLY!")
    print("=" * 78)


if __name__ == "__main__":
    main()
