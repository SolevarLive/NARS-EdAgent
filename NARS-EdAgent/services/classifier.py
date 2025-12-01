import joblib
import os


MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "intent_classifier.pkl")
_model = None

def get_classifier():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def classify_intent(text: str):
    clf = get_classifier()
    pred = clf.predict([text.lower()])[0]
    proba = max(clf.predict_proba([text.lower()])[0])
    return pred, float(proba)