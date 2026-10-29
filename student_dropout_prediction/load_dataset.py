"""
=============================================================================
Stage 2: Dataset Collection and Loading
Project: AI-Based Student Dropout Prediction and Early Warning System
=============================================================================
This script:
1. Loads the official UCI "Predict Students' Dropout and Academic Success" dataset.
2. Inspects dataset structure (rows, columns, headers, data types).
3. Inspects the target variable ('Target') and class distribution.
4. Checks for missing values (NaNs) and duplicate rows.
5. Exports a standardized clean copy ('student_data_clean.csv') with clean headers
   and standard comma separation, keeping all original data intact.
=============================================================================
"""

import os
import sys
import urllib.request
import zipfile
import pandas as pd

# Ensure terminal stdout handles UTF-8 on Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def get_dataset_paths():
    """
    Locates or determines file paths regardless of whether the script
    is executed from the project root or from inside subfolders.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    os.makedirs(dataset_dir, exist_ok=True)

    raw_zip_path = os.path.join(dataset_dir, "predict_students_dropout_and_academic_success.zip")
    raw_csv_path = os.path.join(dataset_dir, "data.csv")
    clean_csv_path = os.path.join(dataset_dir, "student_data_clean.csv")

    return dataset_dir, raw_zip_path, raw_csv_path, clean_csv_path


def download_dataset_if_missing(raw_zip_path, raw_csv_path, dataset_dir):
    """
    Checks if raw dataset exists; if not, automatically downloads and extracts
    the official archive from the UCI Machine Learning Repository.
    """
    if os.path.exists(raw_csv_path):
        print(f"[OK] Raw dataset found at: {raw_csv_path}")
        return

    print("[INFO] Dataset not found locally. Downloading from UCI Machine Learning Repository...")
    uci_zip_url = "https://archive.ics.uci.edu/static/public/697/predict+students+dropout+and+academic+success.zip"

    try:
        req = urllib.request.Request(uci_zip_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response, open(raw_zip_path, "wb") as out_file:
            out_file.write(response.read())
        print(f"[OK] Downloaded zip archive ({os.path.getsize(raw_zip_path):,} bytes).")

        with zipfile.ZipFile(raw_zip_path, "r") as zip_ref:
            zip_ref.extractall(dataset_dir)
        print(f"[OK] Extracted 'data.csv' to: {dataset_dir}")

    except Exception as exc:
        print(f"[!] Automated download failed: {exc}")
        print("\n=== MANUAL DOWNLOAD INSTRUCTIONS ===")
        print("1. Visit: https://archive.ics.uci.edu/dataset/697/predict+students+dropout+and+academic+success")
        print("2. Click the 'Download' button.")
        print("3. Unzip the downloaded file and place 'data.csv' directly inside:")
        print(f"   {dataset_dir}")
        print("4. Re-run this script: python load_dataset.py\n")
        raise SystemExit(1)


def main():
    print("=" * 78)
    print("STAGE 2: DATASET LOADING & INSPECTION")
    print("Project: AI-Based Student Dropout Prediction and Early Warning System")
    print("=" * 78)

    # 1. Resolve file paths and ensure dataset exists
    dataset_dir, raw_zip_path, raw_csv_path, clean_csv_path = get_dataset_paths()
    download_dataset_if_missing(raw_zip_path, raw_csv_path, dataset_dir)

    # 2. Identify the file format
    # The official UCI release file is named 'data.csv'. It uses semicolon (;)
    # delimiters and is encoded with UTF-8 BOM ('utf-8-sig').
    print("\n" + "-" * 78)
    print("STEP 1: IDENTIFYING FILE FORMAT & LOADING DATA")
    print("-" * 78)
    print(f"File Path: {raw_csv_path}")
    print(f"File Format: Delimited Text (CSV)")
    print(f"Delimiter: Semicolon (';')")
    print(f"Encoding: UTF-8 with BOM (utf-8-sig)")

    # Load dataset using pandas
    df = pd.read_csv(raw_csv_path, sep=";", encoding="utf-8-sig")
    print("[OK] Dataset successfully loaded into a Pandas DataFrame!")

    # 3. Display Rows & Columns (Shape)
    print("\n" + "-" * 78)
    print("STEP 2: DATASET SHAPE (DIMENSIONS)")
    print("-" * 78)
    num_rows, num_cols = df.shape
    print(f"Total Number of Rows (Student Records): {num_rows:,}")
    print(f"Total Number of Columns (Features + Target): {num_cols}")

    # 4. Display the first 10 rows
    print("\n" + "-" * 78)
    print("STEP 3: FIRST 10 ROWS OF DATASET")
    print("-" * 78)
    pd.set_option("display.max_columns", 10)
    pd.set_option("display.width", 1000)
    print(df.head(10))

    # 5. Display all Column Names
    print("\n" + "-" * 78)
    print("STEP 4: ALL 37 COLUMN NAMES")
    print("-" * 78)
    for idx, col in enumerate(df.columns, start=1):
        # Indicate if a header contains whitespace artifacts (e.g. trailing tabs)
        has_special = "\t" in col or col.endswith(" ")
        note = " (Note: Contains trailing whitespace/tab)" if has_special else ""
        print(f"  {idx:2d}. {repr(col)}{note}")

    # 6. Display Data Types of all Columns
    print("\n" + "-" * 78)
    print("STEP 5: DATA TYPES OF ALL COLUMNS")
    print("-" * 78)
    print(df.dtypes.to_string())

    # 7. Display Target Column & Unique Values
    print("\n" + "-" * 78)
    print("STEP 6: TARGET COLUMN ANALYSIS")
    print("-" * 78)
    target_column_name = "Target"
    unique_targets = df[target_column_name].unique()
    print(f"Target Column Name: '{target_column_name}'")
    print(f"Unique Target Values: {list(unique_targets)}")

    # 8. Display Target Class Counts and Distribution
    print("\n" + "-" * 78)
    print("STEP 7: TARGET CLASS DISTRIBUTION (COUNTS & PERCENTAGES)")
    print("-" * 78)
    target_counts = df[target_column_name].value_counts()
    target_percentages = df[target_column_name].value_counts(normalize=True) * 100

    distribution_df = pd.DataFrame({
        "Student Count": target_counts,
        "Percentage (%)": target_percentages.round(2)
    })
    print(distribution_df.to_string())

    # 9. Check for Missing Values
    print("\n" + "-" * 78)
    print("STEP 8: MISSING VALUES (NaN) CHECK")
    print("-" * 78)
    missing_series = df.isnull().sum()
    total_missing = missing_series.sum()
    print(f"Total Missing Values in Dataset: {total_missing}")
    if total_missing == 0:
        print("[OK] The dataset contains ZERO missing values across all columns.")
    else:
        print("Missing values by column:")
        print(missing_series[missing_series > 0])

    # 10. Check for Duplicate Rows
    print("\n" + "-" * 78)
    print("STEP 9: DUPLICATE ROWS CHECK")
    print("-" * 78)
    num_duplicates = df.duplicated().sum()
    print(f"Total Duplicate Rows: {num_duplicates}")
    if num_duplicates == 0:
        print("[OK] No duplicate student rows found. Each row represents a unique record.")
    else:
        print(f"[!] Warning: Found {num_duplicates} duplicate rows.")

    # 11. Save a Clean Copy of the Dataset
    # Notice: In the original UCI data.csv, 'Daytime/evening attendance\t' has a trailing tab.
    # We strip trailing/leading whitespace from column names for clean Python access,
    # and save as standard comma-separated CSV ('student_data_clean.csv') without altering any row values.
    print("\n" + "-" * 78)
    print("STEP 10: SAVING CLEAN COPY OF DATASET")
    print("-" * 78)
    clean_df = df.copy()
    clean_df.columns = [col.strip() for col in clean_df.columns]
    clean_df.to_csv(clean_csv_path, index=False, encoding="utf-8")
    print(f"[OK] Clean copy saved successfully at: {clean_csv_path}")
    print(f"    - Number of rows: {len(clean_df):,}")
    print(f"    - Number of columns: {len(clean_df.columns)}")
    print(f"    - Format: Standard Comma-Separated Values (CSV)")
    print(f"    - Original data values preserved: 100% intact (No rows or columns dropped)")

    print("\n" + "=" * 78)
    print("[OK] STAGE 2 COMPLETED SUCCESSFULLY!")
    print("=" * 78)


if __name__ == "__main__":
    main()
