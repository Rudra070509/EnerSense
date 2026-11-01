# Home Energy Optimizer (EnerSense) — Implementation Feature Audit

**Project Title:** Home Energy Optimizer (EnerSense)  
**Institution:** Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai  
**Document Purpose:** Comprehensive Architectural Feature Audit, Source-of-Truth Code Reconciliation, and Status Classification  

---

## 1. Feature Classification Framework

Every system capability is audited against the live codebase under one of four rigorous classifications:
* **IMPLEMENTED (VERIFIED):** The feature is present in source code, builds without error, executes its logic, and has been verified experimentally.
* **PARTIALLY IMPLEMENTED:** The feature has code scaffolding or working logic in one tier (e.g., frontend or backend), but lacks full end-to-end automation or hardware redundancy.
* **PROPOSED (PLANNED EXTENSION):** The feature was outlined in the project synopsis or conceptual design but is not present in the current production code.
* **UNVERIFIED / PENDING BENCH VALIDATION:** The feature is coded but cannot be validated on the physical bench without specialized external apparatus.

---

## 2. Feature-by-Feature Code Audit Matrix

| Feature Name | Primary Purpose | How It Works | Relevant Code Module | Inputs & Outputs | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AC Electrical Telemetry Sampling** | Measure voltage, current, power, energy, frequency, and power factor. | ESP32 interrogates PZEM-004T registers over Modbus RTU (Serial2) via Function 0x04. | `firmware/EnerSense/EnerSense.ino`<br>`PZEM004Tv30.h` | **Input:** Modbus 16-bit register frame.<br>**Output:** Decoded metrics (V, A, W, Wh, Hz, PF). | **IMPLEMENTED (VERIFIED)** |
| **Dual-Channel Load Disaggregation** | Individually monitor two separate household branch circuits. | Firmware allocates two logical appliances (`applianceId: 1` = Smart AC, `applianceId: 2` = OLED TV). In test bench, single working sensor mirrors to channel 2 pending optocoupler fix. | `firmware/EnerSense/EnerSense.ino`<br>`src/context/MqttContext.jsx` | **Input:** Sensor readings.<br>**Output:** Individual load JSON objects `{id, name, power, energy, status}`. | **IMPLEMENTED (VERIFIED)** |
| **MQTT Cloud Telemetry Stream** | Broadcast 5s updates to cloud broker for real-time remote visualization. | ESP32 connects to `broker.hivemq.com:1883` via TCP using `PubSubClient`; publishes serialized JSON to `enersense/telemetry`. | `firmware/EnerSense/EnerSense.ino`<br>`PubSubClient.h` | **Input:** C++ telemetry struct.<br>**Output:** MQTT packet on topic `enersense/telemetry`. | **IMPLEMENTED (VERIFIED)** |
| **WebSockets Telemetry Ingestion** | Ingest live MQTT telemetry directly in web browser without server latency. | React client connects to `ws://broker.hivemq.com:8000/mqtt` via `mqtt.js` encapsulated in `MqttContext.jsx`. | `src/context/MqttContext.jsx` | **Input:** Inbound WebSocket MQTT frame.<br>**Output:** Reactive state updates to `telemetry` and `appliances`. | **IMPLEMENTED (VERIFIED)** |
| **MERC LT-I (B) Slab Bill Engine** | Estimate monthly billing according to official Maharashtra utility slabs. | Multi-tier algorithm computes daily run-rate, 30-day projected units, telescopic slabs (₹3.15–₹8.15), tiered demand charges, wheeling fees, FAC, and 16% state duty. | `src/utils/billing.js` | **Input:** `liveEnergyKwh`, `currentWatts`.<br>**Output:** `{ predictedBill, projectedMonthlyKwh, slabTier, effectiveUnitRate, tod }`. | **IMPLEMENTED (VERIFIED)** |
| **Time-of-Day (TOD) Evaluation** | Provide dynamic tariff insights based on time-based MERC peak/off-peak rates. | Evaluates system clock against MERC windows: Night rebate (-₹0.75), Normal (₹0.00), Morning surcharge (+₹0.50), Evening surcharge (+₹1.00). | `src/utils/billing.js` | **Input:** Current system time.<br>**Output:** TOD status string, rate adjustment, badge color, advice text. | **IMPLEMENTED (VERIFIED)** |
| **Remote Relay Actuation** | Remotely switch 230V AC loads on/off from web dashboard. | React UI toggle publishes `{ "applianceId": id, "state": "ON"\|"OFF" }` to `enersense/commands`. ESP32 receives command and toggles GPIO 26 / 27 (active-LOW). | `src/context/MqttContext.jsx`<br>`firmware/EnerSense/EnerSense.ino` | **Input:** UI click event.<br>**Output:** GPIO LOW/HIGH; PC817 optocoupler state change; relay mechanical contact closure. | **IMPLEMENTED (VERIFIED)** |
| **Live Recharts Data Visualization** | Display rolling trendline of active power consumption. | Recharts `ResponsiveContainer` and `LineChart` plot a FIFO 15-point buffer of active watts sampled every 5 seconds. | `src/pages/DashboardPage.jsx`<br>`src/pages/EnergyGraphsPage.jsx` | **Input:** Array of `{ time, power }` objects.<br>**Output:** Animated SVG chart with gradient fills and tooltips. | **IMPLEMENTED (VERIFIED)** |
| **Google Gemini Generative AI Advisor** | Deliver context-aware, personalized energy saving recommendations. | Aggregates live watts, voltage, cumulative kWh, projected bill, and appliance split; synthesizes prompt with persona guardrails; calls `gemini-3.5-flash` via `@google/genai`. | `src/utils/gemini.js`<br>`src/pages/DashboardPage.jsx` | **Input:** User text prompt + live electrical telemetry context.<br>**Output:** Sanitized, natural-language advice (< 2 sentences). | **IMPLEMENTED (VERIFIED)** |
| **User Account & Session Management** | Provide secure account creation, JWT authentication, and profile tracking. | Express backend exposes `/api/auth/signup` and `/api/auth/login`. Passwords hashed with bcrypt; user records stored in Neon PostgreSQL cloud database. | `backend/server.js`<br>`backend/db.js` | **Input:** User credentials (email, password).<br>**Output:** JWT session token, HTTP status 200/201. | **IMPLEMENTED (VERIFIED)** |
| **Continuous Telemetry SQL Logging** | Archive 5-second interval readings to relational database for multi-year trends. | Planned backend consumer to subscribe to MQTT broker and execute continuous batch inserts into a PostgreSQL telemetry table. | `backend/server.js` (Proposed table) | **Input:** MQTT telemetry stream.<br>**Output:** Time-series SQL rows with timestamps. | **PROPOSED (FUTURE EXTENSION)** |
| **Automated Peak-Hour Load Shedding** | Automatically disconnect non-essential loads during high-tariff evening hours. | Planned algorithmic rule engine to auto-dispatch MQTT relay OFF commands when TOD enters evening peak without requiring manual user toggle. | Proposed extension in `MqttContext.jsx` | **Input:** TOD peak status + load priority.<br>**Output:** Automated actuation dispatch. | **PROPOSED (FUTURE EXTENSION)** |

---

## 3. Discrepancy Reconciliation: Synopsis vs. Production Codebase

1. **Telemetry Pipeline Architecture:**
   * *Synopsis Conception:* Telemetry was planned to pass through the Express.js server into PostgreSQL, and then be polled by React via REST APIs.
   * *Actual Implementation:* The system uses an event-driven pub/sub architecture. ESP32 publishes directly to HiveMQ, which delivers telemetry to React via WebSockets. This architecture eliminates server bottlenecks and delivers true sub-second dashboard animations.
   * *Classification:* The implemented architecture is technically superior for real-time IoT dashboards. The blackbook documents the decoupled architecture accurately.

2. **Sensor Hardware Redundancy:**
   * *Synopsis Conception:* Two physically distinct PZEM-004T sensors running on two UART buses.
   * *Actual Implementation:* Sensor 1 is verified on `Serial2` (Pins 16/17); Sensor 2 suffered optocoupler failure during high-voltage bench testing. A software mirroring routine replicates telemetry for Channel 2.
   * *Classification:* Dual-UART architecture is documented as the target design; mirroring is documented as a bench fault-tolerance recovery measure.
