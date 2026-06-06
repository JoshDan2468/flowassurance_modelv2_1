import numpy as np

# ================================
# TRANSIENT SIMULATION (INDUSTRY GRADE)
# ================================
def simulate_shutdown_restart(data, steps=100):
    """
    Simulates pipeline thermal behavior during shutdown and restart.

    Fully aligned with:
    - ML training physics
    - Backend logic
    - Subsea flow assurance principles
    """

    # ================================
    # INPUTS
    # ================================
    T_inlet = float(data["T_inlet"])
    T_sea = float(data["T_seawater"])
    shutdown_time = max(float(data["shutdown_time"]), 0.1)
    P = max(float(data["P_inlet"]), 1.0)
    gas_gravity = float(data["gas_gravity"])
    insulation = int(data.get("insulation", 0))

    # ================================
    # HYDRATE EQUILIBRIUM (MATCH ML)
    # ================================
    T_eq = 8 + 12 * np.log(P) - 18 * gas_gravity
    # FIX: Lowered floor limit to allow T_eq to drop naturally under low pressure
    T_eq = np.clip(T_eq, -15, 30)  

    # ================================
    # COOLING (SHUTDOWN)
    # ================================
    time_shutdown = np.linspace(0, shutdown_time, steps)

    # Insulation affects cooling rate
    tau_cooling = 6 if insulation == 1 else 3

    temp_shutdown = T_sea + (T_inlet - T_sea) * np.exp(-time_shutdown / tau_cooling)

    # ================================
    # RESTART (HEATING)
    # ================================
    restart_time = shutdown_time * 0.5  # realistic restart duration
    time_restart = np.linspace(0, restart_time, steps)

    tau_heating = 4 if insulation == 1 else 2

    temp_restart = temp_shutdown[-1] + (T_inlet - temp_shutdown[-1]) * (
        1 - np.exp(-time_restart / tau_heating)
    )

    # ================================
    # COMBINE PROFILES
    # ================================
    full_time = np.concatenate([time_shutdown, shutdown_time + time_restart])
    full_temp = np.concatenate([temp_shutdown, temp_restart])

    # ================================
    # SUBCOOLING PROFILE
    # ================================
    subcooling = np.maximum(0, T_eq - full_temp)

    # ================================
    # HYDRATE GROWTH (PHYSICS-BASED PROXY)
    # ================================
    time_factor = np.linspace(1, len(full_temp), len(full_temp))
    hydrate_growth = subcooling * np.log1p(time_factor)

    # ================================
    # OUTPUT
    # ================================
    return {
        "time": full_time.tolist(),
        "temperature_profile": full_temp.tolist(),
        "hydrate_equilibrium": float(T_eq),
        "subcooling_profile": subcooling.tolist(),
        "hydrate_risk_profile": hydrate_growth.tolist(),
        "min_temperature": float(np.min(full_temp)),
        "max_subcooling": float(np.max(subcooling)),
        "shutdown_time": shutdown_time
    }
