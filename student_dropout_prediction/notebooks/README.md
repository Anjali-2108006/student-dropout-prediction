# Notebooks Directory

This directory is reserved for Jupyter Notebooks (`.ipynb`) used during data science exploration, experimentation, and model evaluation before exporting production code to Flask.

## Planned Notebooks
1. **`01_exploratory_data_analysis.ipynb`**:
   - Inspect dataset shape, data types, and missing values.
   - Statistical summaries (mean, median, standard deviations).
   - Data visualisations (dropout distribution, correlation heatmaps, feature importance graphs).

2. **`02_data_preprocessing_and_feature_engineering.ipynb`**:
   - Missing value imputation and outlier handling.
   - Categorical encoding (One-Hot, Ordinal/Label encoding).
   - Feature scaling (StandardScaler or MinMaxScaler).
   - Train/test splitting.

3. **`03_model_training_and_evaluation.ipynb`**:
   - Training multiple algorithms (e.g., Logistic Regression, Random Forest, Gradient Boosting).
   - Hyperparameter tuning and cross-validation.
   - Evaluation metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC.
   - Serializing the best performing model and scaler to the `models/` directory using `joblib`.
