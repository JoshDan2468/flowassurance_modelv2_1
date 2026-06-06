from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import numpy as np

# ReportLab libraries for automated engineering documentation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

app = FastAPI(title="FAIP - Flow Assurance Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("reports", exist_ok=True)

# UPGRADED & LOCKED CONFIGURATION: Exactly matches your new 28-column Colab model
FEATURE_COLUMNS = [
    'T_inlet', 'P_inlet', 'Q_gas', 'Q_oil', 'Q_water', 'D_pipe',
    'T_seawater', 'gas_gravity', 'oil_API', 'salinity', 'H2S', 'CO2',
    'wax_content', 'asphaltene_index', 'insulation', 'chemical_injection',
    'age_days', 'shutdown_time', 'T_eq', 'subcooling', 'T_final',
    'time_below_eq', 'growth_factor', 'water_fraction', 'inhibition_effect',
    'liquid_flow', 'gas_velocity', 'slurry_viscosity_risk'
]

# ==========================================
# RELIABLE MODEL LOADING SEQUENCE
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

try:
    # Safely targets the models folder in the root path directory
    scaler = joblib.load(os.path.join(ROOT_DIR, "models", "scaler.joblib"))
    clf = joblib.load(os.path.join(ROOT_DIR, "models", "classifier.joblib"))
    reg = joblib.load(os.path.join(ROOT_DIR, "models", "regressor.joblib"))
    print("Models loaded successfully ✅")
except Exception as e:
    print("Model loading failed via structural path, trying local root fallback... ❌")
    try:
        scaler = joblib.load("models/scaler.joblib")
        clf = joblib.load("models/classifier.joblib")
        reg = joblib.load("models/regressor.joblib")
        print("Models loaded successfully via local root path ✅")
    except Exception as fallback_error:
        print("All model path loading attempts failed ❌", fallback_error)
        scaler, clf, reg = None, None, None

class InputData(BaseModel):
    T_inlet: float
    P_inlet: float
    Q_gas: float
    Q_oil: float
    Q_water: float
    D_pipe: float
    T_seawater: float
    gas_gravity: float
    oil_API: float
    salinity: float
    H2S: float
    CO2: float
    wax_content: float
    asphaltene_index: float
    insulation: int
    chemical_injection: float
    age_days: float
    shutdown_time: float

# ========================================================
# UPGRADED PHYSICS ENGINE (ALIGNED WITH NEW SLOAN PROXY)
# ========================================================
def simulate_shutdown_restart(input_dict):
    T_inlet = input_dict["T_inlet"]
    T_sea = input_dict["T_seawater"]
    shutdown_time = input_dict["shutdown_time"]
    P = input_dict["P_inlet"]
    gas_gravity = input_dict["gas_gravity"]
    insulation = int(input_dict["insulation"])
    salinity = input_dict["salinity"]
    co2 = input_dict["CO2"]

    # Math Fix: Heavier gas / CO2 raise T_eq; Salinity lowers it
    T_eq_base = 13.5 * np.log(max(P, 1)) - 35.5
    gravity_bonus = 22.0 * (gas_gravity - 0.55)
    co2_bonus = 15.0 * co2
    salinity_penalty = -1.2 * salinity

    T_eq = np.clip(T_eq_base + gravity_bonus + co2_bonus + salinity_penalty, 0, 28)

    # Thermal Fix: Insulated stays warm (tau=24), Bare cools fast (tau=3.5)
    tau = 24.0 if insulation == 1 else 3.5

    time = np.linspace(0, shutdown_time, 100)
    temperature = T_sea + (T_inlet - T_sea) * np.exp(-time / tau)
    subcooling_profile = np.maximum(0, T_eq - temperature)

    return {
        "time": time.tolist(),
        "temperature_profile": temperature.tolist(),
        "hydrate_equilibrium": float(T_eq),
        "max_subcooling": float(np.max(subcooling_profile)),
        "min_temperature": float(np.min(temperature))
    }

# ========================================================
# UPGRADED FEATURE ENGINEERING (ALIGNED WITH NEW FEATURES)
# ========================================================
def compute_features(input_dict, transient):
    f = input_dict.copy()

    f["T_eq"] = transient["hydrate_equilibrium"]
    f["subcooling"] = transient["max_subcooling"]
    f["T_final"] = transient["min_temperature"]

    temp_array = np.array(transient["temperature_profile"])

    # Transient feature math scaling calculations
    f["time_below_eq"] = float(np.sum(temp_array < f["T_eq"]) * (f["shutdown_time"] / 100.0))
    f["growth_factor"] = f["time_below_eq"] * f["subcooling"]
    f["water_fraction"] = f["Q_water"] / (f["Q_water"] + f["Q_oil"] + 1e-6)
    f["inhibition_effect"] = np.exp(-f["chemical_injection"] / 150.0)
    f["liquid_flow"] = f["Q_oil"] + f["Q_water"]

    D_in = f["D_pipe"] * 39.3701
    f["gas_velocity"] = f["Q_gas"] / (D_in**2 + 1e-6)

    # NEW ADVANCED SLURRY TRANSIT MECHANIC CRITICAL TO MATCH ML
    api_factor = (50.0 - f["oil_API"]) / 40.0
    solid_nucleation = 1.0 + (0.05 * f["wax_content"]) + (0.1 * f["asphaltene_index"])
    f["slurry_viscosity_risk"] = f["water_fraction"] * api_factor * solid_nucleation

    return f

def generate_intelligence(result):
    subcool = result["physics"]["max_subcooling"]
    risk = result["risk_level"]

    insights = []
    recommendations = []

    if subcool > 15:
        insights.append("Critical subcooling depth. Safe restart requires thermal management.")
    elif subcool > 5:
        insights.append("Moderate subcooling observed. Flow assurance watch recommended.")
    else:
        insights.append("Fluid core remains safely outside thermodynamic risk zone.")

    if risk == "HIGH":
        recommendations += ["Increase chemical inhibition treatment injection rate immediately.", "Shorten current planned shutdown duration window.", "Execute a highly controlled low-pressure thermal sweep restart."]
    elif risk == "MEDIUM":
        recommendations += ["Monitor baseline pressure metrics closely during pipeline startup.", "Validate continuous operational concentration of chemical injection lines."]
    else:
        recommendations.append("System operating normally. Standard cold restart procedures safe.")

    return {
        "insights": insights,
        "observations": [f"Max Subcooling: {subcool:.2f} °C", f"Duration: {result['transient']['time'][-1]:.1f} hrs"],
        "recommendations": recommendations
    }

@app.get("/")
def home():
    return {"status": "Flow Assurance Platform Online 🚀"}

# ==========================================
# PREDICT INTERFACE
# ==========================================
@app.post("/predict")
def predict(data: InputData):
    try:
        if scaler is None or clf is None or reg is None:
            return JSONResponse(status_code=500, content={"error": "Models uninitialized. Check joblib files."})

        input_dict = data.dict()
        transient = simulate_shutdown_restart(input_dict)
        features = compute_features(input_dict, transient)

        df = pd.DataFrame([features])
        df = df[FEATURE_COLUMNS]
        df_scaled = scaler.transform(df)

        # Secure XGBoost evaluation extraction
        hydrate_class = int(clf.predict(df_scaled)[0])
        hydrate_reg_score = float(reg.predict(df_scaled)[0])
        subcool = transient["max_subcooling"]

        # Accurate Physics-Driven Risk Classification Tiers
        if input_dict["Q_water"] == 0 or transient["max_subcooling"] == 0:
            risk = "LOW"
        elif hydrate_class == 2 or hydrate_reg_score > 0.55:
            risk = "HIGH"
        elif hydrate_class == 1 or hydrate_reg_score > 0.15:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        # Explicit translation dictionary for UI parsing compatibility
        alert_matrix = {
            0: "🟢 SAFE / OPERATIONAL SLURRY: No immediate action required.",
            1: "🟡 AMBER ALERT: Active crystal formation. Monitor pressures closely.",
            2: "🔴 RED CRITICAL ALERT: Immediate risk of solid blockage! Inject inhibitors."
        }

        result = {
            "classification": hydrate_class,
            "severity": round(hydrate_reg_score, 4),
            "risk_level": risk,
            "operational_status": alert_matrix[hydrate_class],
            "physics": {
                "max_subcooling": round(subcool, 2),
                "hydrate_flag": subcool > 0
            },
            "transient": transient
        }

        result.update(generate_intelligence(result))
        return result

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Internal Processing Error: {str(e)}"})

# =========================================================================
# SELF-CONTAINED SHUTDOWN OPTIMIZATION ENDPOINT (REPAIRED)
# =========================================================================
@app.post("/shutdown-analysis")
def shutdown_analysis(data: InputData):
    try:
        base_input = data.dict()
        shutdown_range = np.linspace(2, 72, 12)
        results = []

        # Local parameter definitions for isolated timeline checks
        P = max(float(base_input["P_inlet"]), 1.0)
        gas_gravity = float(base_input["gas_gravity"])
        salinity = float(base_input.get("salinity", 0.0))
        co2 = float(base_input.get("CO2", 0.0))
        insulation = int(base_input.get("insulation", 0))
        T_inlet = float(base_input["T_inlet"])
        T_sea = float(base_input["T_seawater"])
        q_water = float(base_input.get("Q_water", 0.0))

        # Aligned Sloan Proxy curves
        T_eq_base = 13.5 * np.log(max(P, 1)) - 35.5
        gravity_bonus = 22.0 * (gas_gravity - 0.55)
        co2_bonus = 15.0 * co2
        salinity_penalty = -1.2 * salinity
        T_eq = np.clip(T_eq_base + gravity_bonus + co2_bonus + salinity_penalty, 0, 28)

        tau = 24.0 if insulation == 1 else 3.5

        # Perform evaluation scans chronologically
        for t in shutdown_range:
            time_steps = np.linspace(0, float(t), 100)
            temperature = T_sea + (T_inlet - T_sea) * np.exp(-time_steps / tau)
            subcooling_profile = np.maximum(0, T_eq - temperature)
            subcool = float(np.max(subcooling_profile))

            if q_water == 0 or subcool == 0:
                risk = "LOW"
            elif subcool > 15:
                risk = "HIGH"
            elif subcool > 5:
                risk = "MEDIUM"
            else:
                risk = "LOW"

            results.append({
                "shutdown_time": round(float(t), 1),
                "risk": risk,
                "subcooling": round(float(subcool), 2)
            })

        # Process boundaries for KPI metrics
        safe_limit = 0.0
        caution_limit = None

        for r in results:
            if r["risk"] == "LOW":
                safe_limit = r["shutdown_time"]
            elif r["risk"] == "MEDIUM" and caution_limit is None:
                caution_limit = r["shutdown_time"]

        if caution_limit is None:
            caution_limit = safe_limit + 4.0

        return {
            "shutdown_profile": results,
            "operating_window": {
                "safe_shutdown_hours": round(float(safe_limit), 1),
                "caution_start": round(float(caution_limit), 1),
                "critical_after": round(float(caution_limit + 8.0), 1)
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Optimization Engine Crash: {str(e)}"})

# =========================================================================
# AUTOMATED REPORTLAB PDF REPORT ENGINE 📄
# =========================================================================
@app.post("/report")
def generate_report(data: InputData):
    try:
        if scaler is None or clf is None or reg is None:
            return JSONResponse(status_code=500, content={"error": "Models uninitialized"})

        input_dict = data.dict()
        transient = simulate_shutdown_restart(input_dict)
        features = compute_features(input_dict, transient)

        df = pd.DataFrame([features])[FEATURE_COLUMNS]
        df_scaled = scaler.transform(df)

        hydrate_class = int(clf.predict(df_scaled)[0])
        hydrate_reg_score = float(reg.predict(df_scaled)[0])
        subcool = transient["max_subcooling"]

        if input_dict["Q_water"] == 0 or subcool == 0:
            risk, alert_color = "LOW RISK (SAFE)", colors.HexColor("#2ECC71")
        elif hydrate_class == 2 or hydrate_reg_score > 0.55:
            risk, alert_color = "HIGH RISK (CRITICAL)", colors.HexColor("#E74C3C")
        elif hydrate_class == 1 or hydrate_reg_score > 0.15:
            risk, alert_color = "MEDIUM RISK (MONITOR)", colors.HexColor("#F39C12")
        else:
            risk, alert_color = "LOW RISK (SAFE)", colors.HexColor("#2ECC71")

        pdf_path = os.path.join("reports", "FAIP_Flow_Assurance_Report.pdf")
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
        )

        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            'ReportTitle', parent=styles['Heading1'],
            fontSize=20, leading=24, textColor=colors.HexColor("#1A252C"), spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle', parent=styles['Normal'],
            fontSize=10, leading=12, textColor=colors.HexColor("#7F8C8D"), spaceAfter=15
        )
        section_heading = ParagraphStyle(
            'SectionHeading', parent=styles['Heading2'],
            fontSize=13, leading=16, textColor=colors.HexColor("#2C3E50"), spaceBefore=12, spaceAfter=6
        )
        body_style = ParagraphStyle(
            'TableBody', parent=styles['Normal'],
            fontSize=9, leading=12, textColor=colors.HexColor("#34495E")
        )
        banner_style = ParagraphStyle(
            'BannerText', parent=styles['Normal'],
            fontSize=12, leading=15, textColor=colors.white, alignment=1
        )

        story.append(Paragraph("FAIP — FLOW ASSURANCE INTELLIGENCE PLATFORM", title_style))
        story.append(Paragraph("Deepwater Gulf of Mexico Hydrate Blockage Engineering Diagnostics", subtitle_style))
        story.append(Spacer(1, 4))

        banner_text = f"<b>DIAGNOSTIC STATUS: {risk}</b><br/>Thermodynamic Subcooling Depth: {subcool:.2f} °C"
        banner_table = Table([[Paragraph(banner_text, banner_style)]], colWidths=[530])
        banner_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), alert_color),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(banner_table)
        story.append(Spacer(1, 10))

        story.append(Paragraph("Executive Summary & Core Critical Indicators", section_heading))
        intel = generate_intelligence({"physics": {"max_subcooling": subcool}, "risk_level": risk.split()[0]})

        # ==========================================
        # UPGRADED SUMMARY TEXT ENGINE (BULLETPROOF)
        # ==========================================
        # Direct extraction from variables to bypass dictionary lookup errors
        final_temp = float(features.get("T_final", transient["min_temperature"]))
        hours_below = float(features.get("time_below_eq", 0.0))

        summary_text = (
            f"<b>Thermal Window:</b> The system spent approximately {hours_below:.1f} hours inside the hydrate equilibrium envelope, "
            f"reaching a final steady-state fluid temperature of {final_temp:.2f} °C against an ambient seabed sink of {input_dict['T_seawater']} °C.<br/><br/>"
            f"<b>Engineering Recommendations:</b> {', '.join(intel['recommendations'])}"
        )
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 12))

        story.append(Paragraph("Pipeline Configuration & Fluid Chemistry Matrix", section_heading))

        input_matrix = [
            [Paragraph("<b>Parameter Description</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Parameter Description</b>", body_style), Paragraph("<b>Value</b>", body_style)],
            [Paragraph("Inlet Temperature (°C)", body_style), Paragraph(str(input_dict['T_inlet']), body_style), Paragraph("Salinity (%)", body_style), Paragraph(str(input_dict['salinity']), body_style)],
            [Paragraph("Operating Pressure (bar)", body_style), Paragraph(str(input_dict['P_inlet']), body_style), Paragraph("Hydrogen Sulfide (H₂S %)", body_style), Paragraph(str(input_dict['H2S']), body_style)],
            [Paragraph("Gas Flow Rate (m³/s)", body_style), Paragraph(str(input_dict['Q_gas']), body_style), Paragraph("Carbon Dioxide (CO₂ %)", body_style), Paragraph(str(input_dict['CO2']), body_style)],
            [Paragraph("Oil Flow Rate (bbl/day)", body_style), Paragraph(str(input_dict['Q_oil']), body_style), Paragraph("Wax Fraction (%)", body_style), Paragraph(str(input_dict['wax_content']), body_style)],
            [Paragraph("Water Flow Rate (bbl/day)", body_style), Paragraph(str(input_dict['Q_water']), body_style), Paragraph("Asphaltene Index", body_style), Paragraph(str(input_dict['asphaltene_index']), body_style)],
            [Paragraph("Inner Pipe Diameter (m)", body_style), Paragraph(str(input_dict['D_pipe']), body_style), Paragraph("Thermal Insulation Flag", body_style), Paragraph("Yes (1)" if input_dict['insulation'] == 1 else "No (0)", body_style)],
            [Paragraph("Ambient Seawater Temp (°C)", body_style), Paragraph(str(input_dict['T_seawater']), body_style), Paragraph("Chemical Treatment (L/hr)", body_style), Paragraph(str(input_dict['chemical_injection']), body_style)],
            [Paragraph("Gas Specific Gravity", body_style), Paragraph(str(input_dict['gas_gravity']), body_style), Paragraph("Pipeline Age (days)", body_style), Paragraph(str(input_dict['age_days']), body_style)],
            [Paragraph("Crude Oil API", body_style), Paragraph(str(input_dict['oil_API']), body_style), Paragraph("Shutdown Duration (hrs)", body_style), Paragraph(str(input_dict['shutdown_time']), body_style)]
        ]

        param_table = Table(input_matrix, colWidths=[180, 85, 180, 85])
        param_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ECF0F1")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(param_table)

        doc.build(story)

        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename="FAIP_Flow_Assurance_Report.pdf"
        )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"PDF Generation Engine Crash: {str(e)}"})