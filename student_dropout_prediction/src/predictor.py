"""
=============================================================================
Module: src/predictor.py
Project: AI-Based Student Dropout Prediction and Early Warning System
=============================================================================
Reusable, production-ready inference engine for student dropout risk prediction.
Features:
- Loads serialized champion pipeline (StandardScaler + RandomForestClassifier).
- Validates student record features against the 30 early-warning feature schema.
- Calculates dropout probability and assigns risk tiers (Low, Medium, High).
- Provides actionable early warning recommendations for academic advisors.
=============================================================================
"""

import os
import json
import joblib
import pandas as pd
import numpy as np


class StudentDropoutPredictor:
    """
    Inference handler for Student Dropout Prediction and Early Warning System.
    """

    DEFAULT_THRESHOLDS = {
        "low_upper": 0.30,      # < 30% -> Low Risk
        "medium_upper": 0.60,   # 30% to < 60% -> Medium Risk
                                # >= 60% -> High Risk
    }

    def __init__(self, model_path=None, meta_path=None, thresholds=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = model_path or os.path.join(base_dir, "models", "dropout_model.joblib")
        self.meta_path = meta_path or os.path.join(base_dir, "models", "model_metadata.json")
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS

        self.model = None
        self.feature_names = []
        self._load_model_and_metadata()

    def _load_model_and_metadata(self):
        """Loads the serialized model and feature metadata."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found at: '{self.model_path}'. "
                f"Please run Stage 5 (train_models.py) to train and save the model."
            )

        try:
            self.model = joblib.load(self.model_path)
        except Exception as exc:
            raise RuntimeError(f"Failed to load model from '{self.model_path}': {exc}")

        if os.path.exists(self.meta_path):
            with open(self.meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                self.feature_names = meta.get("early_warning_features", [])

        # Fallback to model's feature_names_in_ if available
        if not self.feature_names and hasattr(self.model, "feature_names_in_"):
            self.feature_names = list(self.model.feature_names_in_)

        if not self.feature_names:
            raise ValueError("Unable to determine expected feature names for the predictor.")

    def get_risk_category(self, probability: float) -> str:
        """
        Maps dropout probability to an early warning risk category:
        - Low Risk    : probability < 30%
        - Medium Risk : 30% <= probability < 60%
        - High Risk   : probability >= 60%
        """
        if probability < self.thresholds["low_upper"]:
            return "Low Risk"
        elif probability < self.thresholds["medium_upper"]:
            return "Medium Risk"
        else:
            return "High Risk"

    def get_support_suggestions(self, risk_category: str, student_data: dict) -> list:
        """
        Provides supportive, constructive academic suggestions based on risk category.
        Non-punitive, student-centered early intervention guidance.
        """
        if risk_category == "High Risk":
            return [
                "Recommend timely review by authorized academic staff.",
                "Consider offering academic counselling or mentoring.",
                "Check for financial or other support needs (e.g., emergency tuition assistance or payment plans)."
            ]
        elif risk_category == "Medium Risk":
            return [
                "Review academic progress and discuss semester 1 examination results.",
                "Offer additional academic guidance and course-load balancing.",
                "Check whether the student needs study skills or tutoring support."
            ]
        else:
            return [
                "Continue regular academic monitoring.",
                "Encourage participation in advanced learning and peer mentoring activities."
            ]

    def get_explanation(self, risk_category: str, probability: float) -> str:
        """
        Generates a clear explanation in simple language without automated blame.
        """
        pct = round(probability * 100, 1)
        if risk_category == "High Risk":
            return (
                f"The model identified this student as having a high predicted dropout risk ({pct}%) "
                "based on the information provided. Timely review by academic advisors is recommended "
                "to provide proactive support."
            )
        elif risk_category == "Medium Risk":
            return (
                f"The model identified this student as having a moderate predicted dropout risk ({pct}%) "
                "based on the information provided. An advisory check-in is recommended to support continued progress."
            )
        else:
            return (
                f"The model identified this student as having a low predicted dropout risk ({pct}%) "
                "based on the information provided. The student demonstrates positive retention indicators."
            )

    def validate_input(self, data: dict) -> pd.DataFrame:
        """
        Validates that all required 30 features are present, converts values
        to float, and arranges them in the exact order expected by the pipeline.
        """
        if not isinstance(data, dict):
            raise TypeError(f"Input student record must be a dictionary, got: {type(data).__name__}")

        missing_keys = [feat for feat in self.feature_names if feat not in data]
        if missing_keys:
            raise ValueError(
                f"Missing {len(missing_keys)} required feature(s): {missing_keys}"
            )

        cleaned_data = {}
        for feat in self.feature_names:
            val = data[feat]
            if val is None or (isinstance(val, str) and val.strip() == ""):
                raise ValueError(f"Feature '{feat}' cannot be empty or null.")
            try:
                cleaned_data[feat] = float(val)
            except (ValueError, TypeError):
                raise ValueError(
                    f"Feature '{feat}' must be a numerical value. Received: {repr(val)}"
                )

        # Return DataFrame with columns in exact order
        return pd.DataFrame([cleaned_data], columns=self.feature_names)

    def predict(self, student_data: dict) -> dict:
        """
        Generates dropout risk prediction for a single student dictionary.

        Returns a structured dictionary:
        {
            "dropout_risk_class": 0 or 1,
            "dropout_probability": float (0.0 to 1.0),
            "retention_probability": float (0.0 to 1.0),
            "risk_category": "Low" | "Medium" | "High",
            "risk_percentage": float (0.0% to 100.0%),
            "recommendations": list of str
        }
        """
        df_input = self.validate_input(student_data)

        # Run pipeline inference
        predicted_class = int(self.model.predict(df_input)[0])
        probabilities = self.model.predict_proba(df_input)[0]

        retention_prob = float(probabilities[0])
        dropout_prob = float(probabilities[1])

        risk_category = self.get_risk_category(dropout_prob)
        support_suggestions = self.get_support_suggestions(risk_category, student_data)
        explanation = self.get_explanation(risk_category, dropout_prob)

        return {
            "dropout_risk_class": predicted_class,
            "dropout_risk_label": "Dropout (Class 1)" if predicted_class == 1 else "Graduate / Enrolled (Class 0)",
            "dropout_probability": round(dropout_prob, 4),
            "retention_probability": round(retention_prob, 4),
            "dropout_risk_percentage": round(dropout_prob * 100, 1),
            "risk_percentage": round(dropout_prob * 100, 1),
            "risk_category": risk_category,
            "explanation": explanation,
            "support_suggestions": support_suggestions,
            "recommendations": support_suggestions,
            "ethical_note": (
                "This tool provides an estimated dropout risk based on a machine learning model. "
                "It is intended to support student assistance and academic monitoring, not to make "
                "final decisions about students. Predictions may be inaccurate and should be reviewed "
                "by authorized staff."
            )
        }

    def predict_batch(self, students_df: pd.DataFrame) -> pd.DataFrame:
        """
        Batch prediction for multiple student records in a DataFrame.
        """
        missing_cols = [c for c in self.feature_names if c not in students_df.columns]
        if missing_cols:
            raise ValueError(f"Batch DataFrame missing required columns: {missing_cols}")

        df_subset = students_df[self.feature_names].astype(float)
        preds = self.model.predict(df_subset)
        probas = self.model.predict_proba(df_subset)[:, 1]

        result_df = students_df.copy()
        result_df["Predicted_Dropout_Risk"] = preds
        result_df["Dropout_Probability"] = probas.round(4)
        result_df["Risk_Category"] = [self.get_risk_category(p) for p in probas]
        return result_df


# Module-level convenience functions
_predictor_instance = None


def get_predictor() -> StudentDropoutPredictor:
    """Singleton getter for the StudentDropoutPredictor."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = StudentDropoutPredictor()
    return _predictor_instance


def predict_student(student_dict: dict) -> dict:
    """Convenience function to predict a single student record."""
    predictor = get_predictor()
    return predictor.predict(student_dict)
