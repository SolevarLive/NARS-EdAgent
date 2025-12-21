import joblib
import os
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent / "data" / "intent_classifier_v2.pkl"

_model = None

def get_classifier():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Модель не найдена: {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
        print(f"Модель загружена: {MODEL_PATH.name}")
    return _model

def classify_intent(text: str):
    clf = get_classifier()
    pred = clf.predict([text.lower()])[0]
    proba = max(clf.predict_proba([text.lower()])[0])
    return pred, float(proba)