"""
Recommendation engine for AquaSentinel AI.
Maps environmental conditions, risk levels, and severity to actionable recommendations.
"""

# RECOMMENDATIONS by Risk Level
RISK_RECOMMENDATIONS = {
    "high": [
        "🚨 Immediate water supply shutdown recommended",
        "💧 Emergency chlorination of water sources",
        "📢 Issue public boil-water advisory",
    ],
    "medium": [
        "⚠️ Increase water quality monitoring frequency",
        "💧 Precautionary chlorination of water supply",
        "🔬 Schedule water quality testing",
    ],
    "low": [
        "✅ Continue routine water quality monitoring",
        "🔄 Maintain standard purification protocols",
    ],
}

# RECOMMENDATIONS by Severity (Smarter Logic)
SEVERITY_RECOMMENDATIONS = {
    "CRITICAL": "🔥 EMERGENCY: Immediate evacuation and deployment of full medical response units.",
    "HIGH": "🚨 ALERT: High risk detected — prioritize water treatment and public notification.",
    "WARNING": "⚠️ WARNING: Moderate risk rising — increase surveillance and lab frequency.",
    "INFO": "ℹ️ INFO: Routine surveillance active — no immediate action required.",
}


def get_recommendation(risk_level: str, rainfall: float, ph_level: float,
                       contamination: float, cases_count: int, 
                       severity: str = "INFO", trend: str = "STABLE") -> str:
    """
    Generate a context-aware recommendation based on risk level, conditions, severity, and trend.
    Returns a formatted string of recommended actions.
    """
    level = risk_level.lower()
    base_actions = RISK_RECOMMENDATIONS.get(level, RISK_RECOMMENDATIONS["low"])
    
    # 1. Start with severity-specific advice
    final_actions = [SEVERITY_RECOMMENDATIONS.get(severity, SEVERITY_RECOMMENDATIONS["INFO"])]
    
    # 2. Add trend-specific commentary
    if trend == "RISING":
        final_actions.append("📈 TREND: Risk level is RISING. Accelerate preventive measures.")
    elif trend == "STABLE" and level != "high":
        final_actions.append("📊 TREND: Situation is stable. Continue monitoring.")
    elif trend == "FALLING":
        final_actions.append("📉 TREND: Risk level is declining. Prepare to scale back alerts.")

    # 3. Add risk-level actions
    final_actions.extend(base_actions)

    # 4. Add condition-specific extras
    if ph_level < 5.0 or ph_level > 8.5:
        final_actions.append("⚗️ pH Out of Range — inspect for industrial leaks or runoff.")
    if contamination > 0.85:
        final_actions.append("☣️ Extreme contamination detected — investigate source immediately.")
    if cases_count > 80:
        final_actions.append("🏨 Outbreak Alert — notify all nearby healthcare facilities.")
    if rainfall > 300:
        final_actions.append("🌧️ Flood Warning — move medical supplies to high ground.")

    return " | ".join(final_actions)
