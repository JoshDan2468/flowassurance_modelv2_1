import numpy as np

# ================================
# FEATURE ENGINEERING (ALIGNED WITH ML + BACKEND)
# ================================
def compute_features(data, transient):
    """
    Generate ML features from input data and transient simulation.

    MUST remain consistent with:
    - ML training pipeline
    - Backend prediction logic
    """

    # Copy to avoid mutation
    f = data.copy()

    # ================================
    # TRANSIENT-BASED FEATURES (CRITICAL)
    # ================================
    f["T_eq"] = transient["hydrate_equilibrium"]
    f["subcooling"] = transient["max_subcooling"]
    f["T_final"] = transient["min_temperature"]

    # Convert temperature profile safely
    temp_profile = np.array(transient["temperature_profile"], dtype=float)

    # Time spent below hydrate equilibrium (discrete time steps)
    # Corrected to match ML training: exact duration in hours
    f["time_below_eq"] = float(np.sum(temp_profile < f["T_eq"]) * (f["shutdown_time"] / 100.0))

    # ================================
    # FLOW ASSURANCE PHYSICS FEATURES
    # ================================
    f["growth_factor"] = f["time_below_eq"] * f["subcooling"]

    # Avoid divide-by-zero
    f["water_fraction"] = f["Q_water"] / (f["Q_water"] + f["Q_oil"] + 1e-6)

    # Chemical inhibition effect
    # Corrected to match ML training: / 150.0
    f["inhibition_effect"] = np.exp(-f["chemical_injection"] / 150.0)

    # Liquid flow
    f["liquid_flow"] = f["Q_oil"] + f["Q_water"]

    # ================================
    # VELOCITY (CRITICAL FIX ⚠️)
    # Must match ML training exactly
    # ================================
    D_in = f["D_pipe"] * 39.3701  # meters → inches
    f["gas_velocity"] = f["Q_gas"] / (D_in**2 + 1e-6)

    # ================================
    # SLURRY MECHANICS (ADDED TO MATCH ML TRAINING)
    # ================================
    api_factor = (50.0 - f["oil_API"]) / 40.0 # Heavier oil = higher plug risk
    solid_nucleation = 1.0 + (0.05 * f["wax_content"]) + (0.1 * f["asphaltene_index"])
    f["slurry_viscosity_risk"] = f["water_fraction"] * api_factor * solid_nucleation

    # ================================
    # NUMERICAL STABILITY
    # ================================
    for k, v in f.items():
        if isinstance(v, float):
            if np.isnan(v) or np.isinf(v):
                f[k] = 0.0

    return f