import numpy as np
import pandas as pd
import joblib

# Explicitly match the exact feature columns the models were trained on
FEATURE_COLUMNS = [
    'T_inlet', 'P_inlet', 'Q_gas', 'Q_oil', 'Q_water', 'D_pipe',
    'T_seawater', 'gas_gravity', 'oil_API', 'salinity', 'H2S', 'CO2',
    'wax_content', 'asphaltene_index', 'insulation', 'chemical_injection',
    'age_days', 'shutdown_time', 'T_eq', 'subcooling', 'T_final',
    'time_below_eq', 'growth_factor', 'water_fraction', 'inhibition_effect',
    'liquid_flow', 'gas_velocity', 'slurry_viscosity_risk'
]

def load_ml_pipeline():
    """Loads the serialized scaling and modeling artifacts securely."""
    try:
        scaler = joblib.load("models/scaler.joblib")
        classifier = joblib.load("models/classifier.joblib")
        regressor = joblib.load("models/regressor.joblib")
        return scaler, classifier, regressor
    except FileNotFoundError:
        raise FileNotFoundError("Model files missing! Please run your training script first.")

def predict_hydrate_risk(raw_input_dict):
    """
    Accepts raw production metrics, engineers physics features, 
    and outputs operational risk classifications.
    """
    # 1. Load the trained pipeline
    scaler, clf, reg = load_ml_pipeline()
    
    # 2. Extract operational variables for transient processing
    T_inlet = raw_input_dict["T_inlet"]
    T_sea = raw_input_dict["T_seawater"]
    shutdown_time = raw_input_dict["shutdown_time"]
    P = raw_input_dict["P_inlet"]
    gas_gravity = raw_input_dict["gas_gravity"]
    insulation = raw_input_dict["insulation"]
    salinity = raw_input_dict["salinity"]
    co2 = raw_input_dict["CO2"]

    # 3. Calculate Embedded Physics (Sloan Proxy)
    T_eq_base = 13.5 * np.log(max(P, 1)) - 35.5
    gravity_bonus = 22.0 * (gas_gravity - 0.55)
    co2_bonus = 15.0 * co2
    salinity_penalty = -1.2 * salinity
    
    T_eq = np.clip(T_eq_base + gravity_bonus + co2_bonus + salinity_penalty, 0, 28)
    tau = 24.0 if insulation == 1 else 3.5

    # Simulate temperature decay across 100 timeline slices
    time_array = np.linspace(0, shutdown_time, 100)
    temp_profile = T_sea + (T_inlet - T_sea) * np.exp(-time_array / tau)
    subcooling = np.maximum(0, T_eq - temp_profile)

    # 4. Map Engineered Features to match training setup
    processed = raw_input_dict.copy()
    processed["T_eq"] = T_eq
    processed["subcooling"] = np.max(subcooling)
    processed["T_final"] = np.min(temp_profile)
    
    processed["time_below_eq"] = float(np.sum(temp_profile < T_eq) * (shutdown_time / 100.0))
    processed["growth_factor"] = processed["time_below_eq"] * processed["subcooling"]
    processed["water_fraction"] = processed["Q_water"] / (processed["Q_water"] + processed["Q_oil"] + 1e-6)
    processed["inhibition_effect"] = np.exp(-processed["chemical_injection"] / 150.0)
    processed["liquid_flow"] = processed["Q_oil"] + processed["Q_water"]

    D_in = processed["D_pipe"] * 39.3701
    processed["gas_velocity"] = processed["Q_gas"] / (D_in**2 + 1e-6)

    api_factor = (50.0 - processed["oil_API"]) / 40.0
    solid_nucleation = 1.0 + (0.05 * processed["wax_content"]) + (0.1 * processed["asphaltene_index"])
    processed["slurry_viscosity_risk"] = processed["water_fraction"] * api_factor * solid_nucleation

    # Convert to Dataframe and structurally force feature order alignment
    df = pd.DataFrame([processed])[FEATURE_COLUMNS]

    # 5. Execute ML Scaling & Prediction Inference
    scaled_features = scaler.transform(df)
    risk_intensity = reg.predict(scaled_features)[0]
    risk_class = clf.predict(scaled_features)[0]
    class_probabilities = clf.predict_proba(scaled_features)[0]

    # Map class integers to human-readable field actions
    alert_matrix = {
        0: "🟢 SAFE / OPERATIONAL SLURRY: No immediate action required.",
        1: "🟡 AMBER ALERT: Active crystal formation. Monitor pressures closely.",
        2: "🔴 RED CRITICAL ALERT: Immediate risk of solid blockage! Inject inhibitors."
    }

    return {
        "calculated_hydrate_temp_c": round(T_eq, 2),
        "final_fluid_temp_c": round(processed["T_final"], 2),
        "hours_in_hydrate_zone": round(processed["time_below_eq"], 1),
        "continuous_risk_index": round(float(risk_intensity), 4),
        "operational_status": alert_matrix[risk_class],
        "confidence_score": round(float(class_probabilities[risk_class] * 100), 1)
    }

# ========================================================
# EXAMPLE RUN: Testing your baseline Gulf of Mexico system
# ========================================================
if __name__ == "__main__":
    baseline_scenario = {
        'T_inlet': 40.0,
        'P_inlet': 220.0,
        'Q_gas': 55.0,
        'Q_oil': 8000.0,
        'Q_water': 6500.0,
        'D_pipe': 0.2,
        'T_seawater': 4.0,
        'gas_gravity': 0.74,
        'oil_API': 31.0,
        'salinity': 1.0,
        'H2S': 0.03,
        'CO2': 2.5,
        'wax_content': 4.0,
        'asphaltene_index': 1.2,
        'insulation': 0,             # Bare pipe
        'chemical_injection': 0.0,    # No mitigation
        'age_days': 1500.0,
        'shutdown_time': 48.0        # Long shutdown
    }

    print("\n--- Executing Flow Assurance Diagnostic ---")
    results = predict_hydrate_risk(baseline_scenario)
    for key, val in results.items():
        print(f"{key.replace('_', ' ').title()}: {val}")
