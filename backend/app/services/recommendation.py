"""
Recommendation engine for AquaSentinel AI.
Maps environmental conditions and risk levels to actionable recommendations.
"""

# Recommendation rules based on risk level and conditions
RECOMMENDATIONS = {
    "high": [
        "🚨 Immediate water supply shutdown recommended",
        "🏥 Deploy medical response team to affected area",
        "💧 Emergency chlorination of water sources",
        "📢 Issue public boil-water advisory",
        "🧪 Collect water samples for lab analysis",
        "🚰 Activate emergency water distribution points",
    ],
    "medium": [
        "⚠️ Increase water quality monitoring frequency",
        "💧 Precautionary chlorination of water supply",
        "📋 Alert local health authorities",
        "🔬 Schedule water quality testing",
        "📢 Issue precautionary hygiene advisory",
    ],
    "low": [
        "✅ Continue routine water quality monitoring",
        "📊 Log data for trend analysis",
        "🔄 Maintain standard purification protocols",
    ],
}


def get_recommendation(risk_level: str, rainfall: float, ph_level: float,
                       contamination: float, cases_count: int) -> str:
    """
    Generate a context-aware recommendation based on risk level and conditions.
    Returns a formatted string of recommended actions.
    """
    level = risk_level.lower()
    actions = RECOMMENDATIONS.get(level, RECOMMENDATIONS["low"])

    # Add condition-specific extras
    extras = []
    if ph_level < 5.0:
        extras.append("⚗️ Critical pH detected — investigate industrial contamination")
    if contamination > 0.85:
        extras.append("☣️ Extreme contamination — evacuate nearby residents")
    if cases_count > 80:
        extras.append("🏨 Hospital capacity alert — prepare overflow facilities")
    if rainfall > 300:
        extras.append("🌧️ Severe flooding risk — deploy flood barriers")

    all_actions = actions + extras
    return " | ".join(all_actions)
