# Models Directory

This folder holds trained and serialized Machine Learning artifacts.

## Files Stored Here (Generated in Stage 4)
- **`dropout_model.joblib` / `dropout_model.pkl`**:
  The best-performing trained machine learning classifier (e.g., Random Forest or Gradient Boosting) exported using `joblib`.
- **`scaler.joblib` / `scaler.pkl`**:
  Fitted feature scaler (e.g., `StandardScaler`) used to transform incoming real-time web input features before feeding them into the model.
- **`feature_columns.json`**:
  Ordered list of feature column names ensuring exact column alignment during inference.

*These serialized artifacts will be loaded into the Flask backend (`app.py`) for live prediction.*
