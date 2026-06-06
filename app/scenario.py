import numpy as np

# =========================================================================
# SELF-CONTAINED UPGRADED ENGINE (PERFECTLY ALIGNED WITH GOM SLOAN PROXY)
# =========================================================================
def local_simulate_shutdown(input_dict):
    T_inlet = float(input_dict["T_inlet"])
    T_sea = float(input_dict["T_seawater"])
    shutdown_time = max(float(input_dict["shutdown_time"]), 0.1)
    P = max(float(input_dict["P_inlet"]), 1.0)
    gas_gravity = float(input_dict["gas_gravity"])
    insulation = int(input_dict.get("insulation", 0))
    salinity = float(input_dict.get("salinity", 0.0))
    co2 = float(input_dict.get("CO2", 0.0))

    # Math Fix: Match your upgraded ML model explicitly
    T_eq_base = 13.5 * np.log(max(P, 1)) - 35.5
    gravity_bonus = 22.0 * (gas_gravity - 0.55)
    co2_bonus = 15.0 * co2
    salinity_penalty = -1.2 * salinity
    
    T_eq = np.clip(T_eq_base + gravity_bonus + co2_bonus + salinity_penalty, 0, 28)
    
    # Thermal Fix: Insulated stays warm (tau=24), Bare cools fast (tau=3.5)
    tau = 24.0 if insulation == 1 else 3.5

    time_steps = np.linspace(0, shutdown_time, 100)
    temperature = T_sea + (T_inlet - T_sea) * np.exp(-time_steps / tau)
    subcooling_profile = np.maximum(0, T_eq - temperature)

    return {
        "max_subcooling": float(np.max(subcooling_profile))
    }

def shutdown_scenario_analysis(base_input):
    """Generates 12 simulation checkpoints across an operational timeline."""
    shutdown_range = np.linspace(2, 72, 12) # Expanded window matching GoM design checks 
    results = []

    for t in shutdown_range:
        # Crucial Fix: Ensure clean item copying from the incoming processed data object
        input_case = {key: val for key, val in base_input.items()}
        input_case["shutdown_time"] = float(t)

        # Execute physical step trajectory simulation
        transient = local_simulate_shutdown(input_case)
        subcool = transient["max_subcooling"]
        q_water = float(input_case.get("Q_water", 0.0))

        # ACCURATE RISK MATRIX REPLICATING THE MAIN ML PIPELINE BOUNDARIES
        if q_water == 0 or subcool == 0:
            risk = "LOW"
        elif subcool > 15:
            risk = "HIGH"
        elif subcool > 5:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        results.append({
            "shutdown_time": round(float(t), 2),
            "risk": risk,
            "subcooling": round(float(subcool), 2)
        })

    return results

def compute_safe_window(results):
    """Calculates operational boundaries based on simulation outputs."""
    safe_limit = 0.0
    caution_limit = None

    # Step through chronological timeline steps to discover limits
    for r in results:
        if r["risk"] == "LOW":
            safe_limit = r["shutdown_time"]
        elif r["risk"] == "MEDIUM" and caution_limit is None:
            caution_limit = r["shutdown_time"]

    # Fallback thermal buffer defaults if the system parameters bypass thresholds
    if caution_limit is None:
        caution_limit = safe_limit + 4.0

    return {
        "safe_shutdown_hours": round(float(safe_limit), 1),
        "caution_start": round(float(caution_limit), 1),
        "critical_after": round(float(caution_limit + 8.0), 1) 
    }
