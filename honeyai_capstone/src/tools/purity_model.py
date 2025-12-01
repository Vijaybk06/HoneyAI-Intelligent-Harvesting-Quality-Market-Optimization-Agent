# Lightweight rule-based purity estimator for reproducible demo


def predict_purity(features: dict) -> dict:
    moisture = float(features.get("moisture", 20))
    hmf = float(features.get("hmf", 10))

    score = 100.0
    score -= max(0.0, (moisture - 17.0) * 3.0)
    score -= hmf * 0.5
    score = max(0.0, min(100.0, score))

    label = "High" if score >= 80 else ("Medium" if score >= 60 else "Low")
    confidence = min(0.99, score / 100.0)

    return {
        "purity_percent": round(score, 1),
        "label": label,
        "confidence": round(confidence, 2),
    }






