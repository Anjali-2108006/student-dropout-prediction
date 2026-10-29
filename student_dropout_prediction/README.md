# AI-Based Student Dropout Prediction and Early Warning System

An end-to-end Machine Learning web application designed to identify students at risk of dropping out early in their academic journey. By analyzing academic performance, attendance, engagement, and socio-demographic factors, the system alerts counselors and educators with actionable early warning indicators.

---

## 📌 Project Objectives
1. **Accurate Risk Identification**: Train machine learning models on historical student data to accurately classify student retention status without arbitrary or hardcoded rules.
2. **Early Intervention**: Calculate calibrated dropout probability scores to generate early warnings before academic terms conclude.
3. **Persistent Record Keeping**: Store student records, predictor attributes, risk ratings, and timestamps in a structured MySQL database.
4. **Intuitive Dashboard**: Provide an interactive Flask web portal with HTML/CSS/JavaScript for administrators and counselors to view analytics and evaluate individual student risk.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Machine Learning Backend** | Python, Scikit-learn, Pandas, NumPy, Joblib |
| **Web Backend** | Flask |
| **Database** | MySQL (via `mysql-connector-python`) |
| **Frontend UI** | HTML5, CSS3, JavaScript |
| **Development & Exploration** | Jupyter Notebooks |

---

## 📁 Project Directory Structure

```text
student_dropout_prediction/
│
├── dataset/                  # Stores raw and preprocessed student data (CSV files)
│   ├── README.md             # Dataset documentation and column dictionary
│   ├── data.csv              # Original raw dataset from UCI (semicolon-delimited)
│   ├── student_data_clean.csv# Clean CSV copy (standard comma-separated, trimmed headers)
│   ├── train_data.csv        # 80% Stratified training set (3,539 rows)
│   └── test_data.csv         # 20% Stratified testing set (885 rows)
│
├── notebooks/                # Jupyter Notebooks for data science exploration
│   ├── README.md             # Notebook workflow guide
│   ├── eda.ipynb             # Interactive Exploratory Data Analysis
│   ├── 02_data_preprocessing_and_feature_engineering.ipynb # Preprocessing
│   └── 03_model_training_and_evaluation.ipynb              # Model Training & Comparison
│
├── models/                   # Serialized ML models and preprocessors (.joblib / .pkl)
│   ├── README.md             # Model artifact specifications
│   ├── dropout_model.joblib  # Production champion model (Random Forest pipeline)
│   ├── preprocessor.joblib   # Fitted StandardScaler pipeline artifact
│   ├── feature_metadata.json # Metadata and feature categorization dictionary
│   └── model_metadata.json   # Benchmark metrics, feature importances, and config
│
├── reports/                  # Generated reports and analytical charts
│   ├── eda_summary.md        # Comprehensive findings from exploratory analysis
│   ├── model_evaluation_report.md # Algorithm comparison and metrics report
│   ├── model_validation.md   # Stage 6 model verification and sample test report
│   └── figures/              # High-resolution charts (.png) for EDA and modeling
│
├── src/                      # Modular Python scripts for database and ML inference
│   ├── __init__.py           # Python package marker
│   └── predictor.py          # Reusable inference engine and input validator
│
├── templates/                # Jinja2 HTML templates for the Flask application
│   └── index.html            # Modern responsive student risk evaluation dashboard
│
├── static/                   # Static web assets served by Flask
│   ├── css/
│   │   └── style.css         # Modern responsive dashboard stylesheets
│   ├── js/
│   │   └── script.js         # Fetch asynchronous client logic and sample loader
│   └── images/               # Logos, icons, and illustrations
│
├── .gitignore                # Specifies intentionally untracked files for Git
├── app.py                    # Flask web application backend controller
├── load_dataset.py           # Dataset collection, inspection, and verification script
├── preprocess_data.py        # Data preprocessing, binary mapping, and split pipeline
├── run_eda.py                # Exploratory Data Analysis and chart generation script
├── train_models.py           # ML model training, evaluation, and serialization script
├── validate_model.py         # Model validation, sample test runs, and pipeline testing
├── test_app.py               # Flask backend and route automated test suite
├── requirements.txt          # Python package dependencies
└── README.md                 # Complete project documentation
```

---

## 🗺️ Step-by-Step Project Roadmap

- [x] **Stage 1: Project Setup**
  - Create standardized folder hierarchy.
  - Define dependencies in `requirements.txt`.
  - Establish documentation and environment guidelines.
- [x] **Stage 2: Dataset Collection and Loading**
  - Download official UCI benchmark dataset (4,424 rows, 37 columns).
  - Inspect dimensions, data types, class distribution, nulls, and duplicates.
  - Create `load_dataset.py` and export clean copy `student_data_clean.csv`.
- [x] **Stage 3: Data Preprocessing & Feature Engineering**
  - Map multi-class Target into binary `Dropout_Risk` (1: Dropout, 0: Graduate/Enrolled).
  - Partition features into Continuous, Binary, and Nominal categories.
  - Address temporal 2nd-semester feature limitations in an Early Warning context.
  - Perform 80:20 stratified train-test split (`random_state=42`).
  - Fit `StandardScaler` pipeline strictly on training data to prevent data leakage.
  - Save `train_data.csv`, `test_data.csv`, `preprocessor.joblib`, and `feature_metadata.json`.
- [x] **Stage 4: Exploratory Data Analysis (EDA)**
  - Analyze training dataset distributions, class counts, and summary statistics.
  - Generate visualizations for dropout risk, academic metrics, and financial status.
  - Correlate continuous numerical features without treating nominals as continuous.
  - Create `notebooks/eda.ipynb`, `run_eda.py`, charts in `reports/figures/`, and `reports/eda_summary.md`.
- [x] **Stage 5: Machine Learning Model Training & Algorithm Comparison**
  - Enforce Early Warning constraint (exclude 2nd-sem features; use 30 1st-sem features).
  - Train Logistic Regression, Decision Tree, and Random Forest using `class_weight='balanced'`.
  - Evaluate on held-out test set (Accuracy, Precision, Recall, F1-Score, ROC-AUC).
  - Create confusion matrices, ROC curves, and feature importance charts.
  - Save champion model to `models/dropout_model.joblib`.
- [x] **Stage 6: Model Validation, Testing, and Final Model Preparation**
  - Re-validate champion model on held-out test data (885 records).
  - Test real student profiles across Low (<30%), Medium (30-60%), and High (>=60%) risk categories.
  - Build reusable production predictor `src/predictor.py` with input validation and recommendations.
  - Test edge-case error handling (missing keys, non-numeric strings, nulls).
  - Generate `reports/model_validation.md` and update `models/model_metadata.json`.
- [x] **Stage 7: Frontend and Backend Development** *(Completed)*
  - Build modern responsive HTML5/CSS3/JavaScript dashboard (`templates/index.html`, `static/`).
  - Implement 4 structured feature groups covering all 30 early-warning attributes.
  - Build Flask backend routes: `GET /`, `GET /health`, `POST /predict`, `GET /api/sample/<tier>`.
  - Implement asynchronous form submission with `fetch()` and loading states.
  - Validate inputs and reject missing or non-numeric entries (no fake predictions).
- [x] **Stage 8: ML Model Integration & Real-Time Prediction** *(Completed)*
  - Integrated `models/dropout_model.joblib` into Flask via thread-safe `src/predictor.py` singleton.
  - Replaced placeholder responses in `POST /predict` with live Random Forest inference.
  - Configured risk categorization: Low Risk (<30%), Medium Risk (30-59%), High Risk (>=60%).
  - Added dynamic UI results: animated risk gauge, risk tier badges, model explanation, and support suggestions.
  - Included ethical AI disclaimer and student attribute snapshot table.
  - Verified with 8 automated integration tests (`test_app.py`) across all risk tiers.
- [x] **Stage 9: Student Risk Dashboard & Early Warning Overview** *(Completed)*
  - Create database schema for student records, academic metrics, and prediction history.
  - Write backend connection scripts in `src/`.
- [x] **Stage 10: Final Testing, Verification & Project Wrap-Up** *(Completed)*
  - End-to-end verification and documentation review.

---

## ⚡ Quick Start: Environment Setup

### 1. Create a Python Virtual Environment
Open PowerShell or your terminal in the `student_dropout_prediction` folder:
```powershell
python -m venv venv
```

### 2. Activate the Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (Command Prompt)**:
  ```cmd
  venv\Scripts\activate.bat
  ```

### 3. Install Required Dependencies
```powershell
pip install -r requirements.txt
```
## 🚀 Deploy to Render

Render is a cloud platform that can host your Flask app with a single configuration file.

### 1️⃣ Add a `render.yaml`
Create a `render.yaml` at the project root (see the newly added file). It tells Render how to build and start the service.

### 2️⃣ Configure environment variables (optional)
If you need any secrets (e.g., API keys), add them in the Render dashboard under **Environment**. This project does **not** require any.

### 3️⃣ Deploy
1. Sign up at https://render.com and create a new **Web Service**.
2. Connect your GitHub repository (or push this folder to a new repo).
3. Render will read `render.yaml`, install the dependencies from `requirements.txt`, and start the app with `gunicorn app:app`.

### 4️⃣ Verify
After deployment, open the provided URL. The home page (`/`) should load, and the health endpoint (`/health`) should return `{ "status": "ok" }`.

### 5️⃣ Next steps
- Set a custom domain if desired.
- Enable HTTPS (Render provides it automatically).
- Monitor logs via the Render dashboard.

**Note:** The app uses relative paths, so it works on Linux as well as Windows.
