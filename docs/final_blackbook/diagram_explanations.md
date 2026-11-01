# Home Energy Optimizer (EnerSense) — Blackbook Diagram Explanations

This document provides academic-grade documentation, operational analyses, and formal captions for the eight system diagrams developed for the Diploma in Computer Engineering Final Year Blackbook project: **"Home Energy Optimizer" (EnerSense)** at Shri Bhagubhai Mafatlal Polytechnic, Mumbai.

---

## Table of Contents
1. [Figure 6.1: Overall System Operational Workflow](#figure-61-overall-system-operational-workflow)
2. [Figure 6.2: Dual PZEM-004T Sensor Acquisition Flowchart](#figure-62-dual-pzem-004t-sensor-acquisition-flowchart)
3. [Figure 6.3: End-to-End Data Communication Architecture](#figure-63-end-to-end-data-communication-architecture)
4. [Figure 6.4: Electricity Bill Estimation & MERC Tariff Flowchart](#figure-64-electricity-bill-estimation--merc-tariff-flowchart)
5. [Figure 6.5: Bidirectional Relay Control & Actuation Flowchart](#figure-65-bidirectional-relay-control--actuation-flowchart)
6. [Figure 6.6: Google Gemini AI Advisory Pipeline Flowchart](#figure-66-google-gemini-ai-advisory-pipeline-flowchart)
7. [Figure 6.7: System Use Case Architecture Diagram](#figure-67-system-use-case-architecture-diagram)
8. [Figure 6.8: Diploma Engineering Project Gantt Chart & Roadmap](#figure-68-diploma-engineering-project-gantt-chart--roadmap)

---

### Figure 6.1: Overall System Operational Workflow
* **File Name:** `overall_system_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 1)
* **Purpose:** To illustrate the overarching lifecycle, execution stages, and supervisory control loops of the EnerSense platform, spanning from hardware power-on initialization to cloud communication, predictive billing, and responsive user actuation.
* **Blackbook-Ready Explanation:**
  The operational cycle begins when the ESP32 microcontroller executes its reset vector. During the initialization phase, the MCU configures its general-purpose input/output pins—setting `GPIO 2` for status LED signaling and `GPIO 26` / `GPIO 27` to logical `HIGH` (de-energizing the active-LOW relay channels to prevent startup load transients). Hardware serial interfaces (`Serial2` on Pins 16/17 and `Serial1` on Pins 18/19) are configured at 9600 baud for Modbus communication. 

  Next, the networking subsystem connects to the local 2.4 GHz Wi-Fi access point using WPA2 authentication. Upon obtaining an IP lease via DHCP, the ESP32 establishes a persistent TCP connection to the public HiveMQ MQTT broker on Port 1883 and subscribes to the actuation channel `enersense/commands`.

  The main operational loop runs every 5000 milliseconds. The ESP32 queries the PZEM-004T sensors for electrical telemetry (voltage, current, power, accumulated energy, line frequency, and power factor). If the Modbus response fails or returns `NaN`, safe fallback routines are triggered to maintain telemetry continuity without halting MCU execution. Valid readings are serialized into a JSON object and published to `enersense/telemetry`.

  The HiveMQ broker forwards this stream via WebSockets (`ws://broker.hivemq.com:8000/mqtt`) to the React single-page application (`MqttContext.jsx`). The frontend evaluates consumption metrics through the MERC LT-I (B) tariff engine, updates the real-time glassmorphism dashboard (including Recharts 15-point live power trends), supplies live context to the Google Gemini AI assistant, and listens for asynchronous relay actuation commands.
* **Key Implementation Details Represented:**
  - Microcontroller: ESP32 DevKit V1 (Xtensa dual-core 240 MHz).
  - Pin assignments: Relay 1 (`GPIO 26`), Relay 2 (`GPIO 27`), Status LED (`GPIO 2`).
  - Active-LOW safety logic on boot (`digitalWrite(PIN, HIGH)`).
  - Wi-Fi reconnection retry loop with visual LED flashing.
  - HiveMQ MQTT broker TCP connection (`broker.hivemq.com:1883`).
  - Dual PZEM query loop with 5000ms sampling cadence.
  - WebSockets telemetry bridge (`ws://broker.hivemq.com:8000/mqtt`).
  - Dynamic tariff projection and reactive state management in React.
* **Formal Blackbook Caption:**
  > **Figure 6.1:** Comprehensive operational flowchart of the Home Energy Optimizer system, demonstrating the sequential workflow across the ESP32 embedded firmware, HiveMQ MQTT cloud transport, reactive frontend ingestion, and closed-loop tariff calculations.

---

### Figure 6.2: Dual PZEM-004T Sensor Acquisition Flowchart
* **File Name:** `sensor_reading_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 2)
* **Purpose:** To detail the low-level UART Modbus RTU polling mechanism, timing constraints, frame validation checks, parameter scaling routines, and multi-channel aggregation logic implemented in the ESP32 firmware.
* **Blackbook-Ready Explanation:**
  The acquisition routine executes deterministically on each 5-second sampling tick. The ESP32 communicates with the Peacefair PZEM-004T V3.0 power sensor module via hardware serial at 9600 bps with 8 data bits, no parity, and 1 stop bit (8N1). Communication follows the industrial Modbus RTU protocol. The ESP32 acts as the master, issuing a Function Code `0x04` (*Read Input Registers*) command across registers `0x0000` through `0x0009` (10 consecutive 16-bit registers) directed to slave address `0xF8` (universal broadcast / default sensor address).

  A 200ms non-blocking timeout window guards against bus lockup. If the sensor fails to respond, error diagnostic flags are raised (pinpointing potential causes such as absent 230V AC line power required to energize the PZEM high-voltage side, loose 5V DC optical isolation rails, or swapped RX/TX jumper pins). When a raw frame is received, the firmware computes and compares the 16-bit cyclic redundancy check (CRC-16 Modbus) against the frame trailer.

  Upon CRC validation, the 16-bit and 32-bit integer register payloads are decoded using official scaling factors: Voltage (0.1 V resolution), Current (0.001 A resolution), Active Power (0.1 W resolution), Energy (1 Wh / 0.001 kWh resolution), Line Frequency (0.1 Hz resolution), and Power Factor (0.01 resolution). A sanity check ensures that no parameter evaluates to `NaN` and that line voltage exceeds 50V AC.

  In the dual-channel design, Sensor 1 monitors Branch 1 (Smart AC) and Sensor 2 monitors Branch 2 (OLED TV). The firmware aggregates individual power and energy sums (`totalPower = P1 + P2`, `totalEnergy = E1 + E2`) before passing the structured telemetry struct to the JSON packaging subsystem.
* **Key Implementation Details Represented:**
  - Hardware UART configuration: `Serial2` on RX=`GPIO 16`, TX=`GPIO 17`; `Serial1` on RX=`GPIO 18`, TX=`GPIO 19`.
  - Modbus RTU framing: Function Code `0x04`, 10 input registers, Address `0xF8`.
  - 200ms bus response timeout and CRC-16 Modbus polynomial verification.
  - Parameter scaling: Voltage (0.1V), Current (0.001A), Power (0.1W), Energy (1Wh), Frequency (0.1Hz), PF (0.01).
  - Bench hardware nuance documented: Test bench sensor mirroring applied to channel 2 during single-sensor hardware repair cycles.
* **Formal Blackbook Caption:**
  > **Figure 6.2:** Low-level UART Modbus RTU sensor acquisition flowchart for dual PZEM-004T energy monitoring modules, highlighting register querying, CRC-16 integrity verification, parameter extraction, and fault-handling logic.

---

### Figure 6.3: End-to-End Data Communication Architecture
* **File Name:** `data_communication_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 3)
* **Purpose:** To provide a complete architectural blueprint of the multi-protocol communication pipeline, delineating telemetry streaming from asynchronous actuation commands across the embedded hardware, public MQTT broker, React web application, Express.js backend, and Google Gemini AI services.
* **Blackbook-Ready Explanation:**
  The system employs a distributed, decoupled IoT communication architecture partitioned into distinct operational tiers:

  1. **Embedded Hardware Tier:** The ESP32 DevKit V1 operates as an edge gateway. Telemetry readings sampled from the dual PZEM modules are serialized into JSON and dispatched over standard MQTT (TCP Port 1883) to the topic `enersense/telemetry` using the `PubSubClient` C++ library. The ESP32 simultaneously maintains an active subscription to `enersense/commands`.
  
  2. **Message Broker Tier:** The HiveMQ Public Cloud Broker acts as the central event router. It features a native WebSockets proxy running on Port 8000 (`ws://broker.hivemq.com:8000/mqtt`). This bridge enables pure browser clients that cannot open raw TCP sockets to participate directly in the MQTT publish/subscribe topology without requiring custom WebSocket translating servers.

  3. **Web Application Tier:** The React 18 frontend establishes a persistent WebSocket connection via `mqtt.js` encapsulated within `MqttContext.jsx`. The application ingests telemetry payloads at 5-second intervals, recalculates real-time tariff estimations using `billing.js`, and streams telemetry into dynamic visual charts. When a user clicks an appliance switch, the client publishes an actuation payload directly to `enersense/commands`.

  4. **Backend & Cloud Intelligence Services:** User authentication, password recovery (OTP), and account profiles are handled via RESTful HTTPS requests to an Express.js backend running on Node.js, backed by a serverless PostgreSQL database hosted on Neon Cloud. Separately, natural language queries from the dashboard chat widget are transmitted over HTTPS via `@google/genai` to Google's Gemini API (`gemini-3.5-flash`), with live electrical metrics injected directly into the prompt context.
* **Key Implementation Details Represented:**
  - Separation of telemetry pipeline (`enersense/telemetry`, Port 1883 TCP -> Port 8000 WebSockets) and actuation pipeline (`enersense/commands`).
  - Direct browser-to-broker integration eliminating intermediary server latency for telemetry streaming.
  - Node.js Express server (`backend/server.js`) on Port 5000 managing auth endpoints (`/api/auth/signup`, `/api/auth/login`).
  - PostgreSQL schema (`backend/db.js`) on Neon Cloud with SSL encryption.
  - Google Gemini API (`@google/genai`) client-side HTTPS integration.
* **Formal Blackbook Caption:**
  > **Figure 6.3:** Multi-tier system communication architecture illustrating the decoupled telemetry and command pipelines across ESP32 edge hardware, HiveMQ MQTT/WebSocket broker, React frontend context, Node.js authentication backend, and Google Gemini AI cloud services.

---

### Figure 6.4: Electricity Bill Estimation & MERC Tariff Flowchart
* **File Name:** `electricity_bill_calculation_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 4)
* **Purpose:** To document the algorithmic execution of the tariff calculation engine implemented in `src/utils/billing.js`, adhering strictly to the Maharashtra Electricity Regulatory Commission (MERC) Multi-Year Tariff Order (Case No. 231 of 2022) for Category LT-I (B) Residential consumers for FY 2024–25.
* **Blackbook-Ready Explanation:**
  The billing algorithm evaluates instantaneous power draw and cumulative energy to formulate a 30-day billing estimate through an 8-stage mathematical sequence:

  1. **Telemetry Input & Run-Rate Formulation:** The engine receives `liveEnergyKwh` (cumulative sensor kWh) and `currentWatts` (instantaneous active power). The instantaneous run-rate is computed as:
     $$\text{runRateDailyKwh} = \frac{\text{currentWatts} \times 24}{1000}$$
     To accommodate test bench setups where cumulative kWh may be minimal, a blended baseline is employed: if `liveEnergyKwh > 0.1`, it is adopted; otherwise, $\max(\text{liveEnergyKwh} \times 2, \text{runRateDailyKwh})$ is utilized with a minimum floor of 4.0 kWh/day.

  2. **Monthly Energy Projection:**
     $$\text{projectedMonthlyKwh} = \text{estimatedDailyKwh} \times 30$$

  3. **Telescopic Slab Energy Charge (EC) Computation:** Residential tariff LT-I (B) uses non-linear telescopic slabs where incremental blocks of consumption are billed at progressive unit rates:
     - Slab 1 (0 to 100 kWh): ₹ 3.15 / kWh
     - Slab 2 (101 to 300 kWh): ₹ 5.40 / kWh
     - Slab 3 (301 to 500 kWh): ₹ 7.10 / kWh
     - Slab 4 (> 500 kWh): ₹ 8.15 / kWh
     $$\text{energyCharges} = \sum_{i=1}^{4} (\text{Units in Slab}_i \times \text{Rate}_i)$$

  4. **Tiered Fixed Demand Charges (FC):** Fixed charges are assessed based on monthly consumption tiers:
     - $\le 100\text{ kWh}$: ₹ 90 / month
     - $101 - 500\text{ kWh}$: ₹ 135 / month
     - $> 500\text{ kWh}$: ₹ 160 / month

  5. **Wheeling Fees & Fuel Adjustment Cost (FAC):** Wheeling charges for transmission grid maintenance are assessed at a flat rate of ₹ 2.60 / kWh. Fuel Adjustment Cost reflects variable generation fuel costs at ₹ 0.35 / kWh:
     $$\text{wheelingCharges} = \text{projectedMonthlyKwh} \times ₹ 2.60$$
     $$\text{facCharges} = \text{projectedMonthlyKwh} \times ₹ 0.35$$

  6. **Time-of-Day (TOD) Evaluation:** The system evaluates the real-time system clock against MERC TOD windows:
     - Night Off-Peak (22:00–06:00): Incentive rebate of -₹ 0.75 / unit.
     - Morning Peak (09:00–12:00): Surcharge penalty of +₹ 0.50 / unit.
     - Evening Peak (18:00–22:00): Surcharge penalty of +₹ 1.00 / unit.
     - Normal Hours: Base tariff (₹ 0.00 / unit adjustment).

  7. **Statutory Levies & Duty:** Maharashtra State Electricity Duty is levied at 16% on the taxable base:
     $$\text{taxableBase} = \text{energyCharges} + \text{wheelingCharges} + \text{fixedCharges}$$
     $$\text{electricityDuty} = \text{taxableBase} \times 0.16$$

  8. **Final Estimated Bill:**
     $$\text{totalPredictedBill} = \text{taxableBase} + \text{facCharges} + \text{electricityDuty}$$
     $$\text{effectiveUnitRate} = \frac{\text{totalPredictedBill}}{\text{projectedMonthlyKwh}}$$
     The resulting forecast object is dispatched to React Context, accompanied by an explicit disclaimer identifying the figure as an estimated projection rather than an official utility invoice.
* **Key Implementation Details Represented:**
  - Official MERC LT-I (B) slab boundaries (0-100, 101-300, 301-500, >500) and respective rates (₹3.15, ₹5.40, ₹7.10, ₹8.15).
  - Flat wheeling charge (₹2.60/kWh) and FAC charge (₹0.35/kWh).
  - Three-tier demand fixed charges (₹90, ₹135, ₹160).
  - TOD surcharge and rebate schedule.
  - Statutory 16% Maharashtra State Electricity Duty calculation.
* **Formal Blackbook Caption:**
  > **Figure 6.4:** Algorithmic flowchart of the MERC FY 2024–25 Category LT-I (B) electricity bill calculation engine, showing telescopic slab evaluation, tiered demand charges, wheeling fees, TOD adjustments, and statutory state levies.

---

### Figure 6.5: Bidirectional Relay Control & Actuation Flowchart
* **File Name:** `relay_control_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 5)
* **Purpose:** To illustrate the complete event-driven control pipeline that translates a user's dashboard toggle action into physical high-voltage load switching, detailing network dispatch, JSON deserialization, active-LOW GPIO switching, opto-isolation, and CT-based closed-loop verification.
* **Blackbook-Ready Explanation:**
  The actuation process begins when a user clicks an appliance toggle button on the EnerSense web dashboard (`AppliancesPage.jsx` or `DashboardPage.jsx`). The client-side handler `toggleAppliance(id)` in `MqttContext.jsx` inverts the current state (`ON` $\leftrightarrow$ `OFF`), optimistically updates the local React state for instantaneous UI responsiveness, and constructs a standardized JSON command payload:
  ```json
  { "applianceId": 1, "state": "ON" }
  ```
  
  This command is transmitted over WebSockets to HiveMQ on topic `enersense/commands`. HiveMQ routes the message over TCP Port 1883 to the subscribed ESP32 node. Upon arrival, the ESP32 `callback()` function copies the payload into a local buffer and invokes `deserializeJson()` from the `ArduinoJson` library. If syntax or parsing errors occur, the packet is safely discarded with a serial log warning, halting actuation.

  The parsed `applianceId` determines the destination GPIO:
  - Appliance 1 (Smart AC): `GPIO 26` (`RELAY_1`).
  - Appliance 2 (OLED TV): `GPIO 27` (`RELAY_2`).

  Because standard 5V relay breakout boards employ **active-LOW** logic, asserting state `ON` commands the ESP32 to pull the GPIO pin `LOW` (`0V`), whereas state `OFF` drives the pin `HIGH` (`3.3V`). Driving the pin `LOW` completes the path from the 5V rail through the current-limiting resistor and forward-biases the internal infrared LED of the PC817 optocoupler. The internal phototransistor conducts, saturating an onboard NPN driver transistor that energizes the 5V Songle SRD-05VDC-SL-C relay electromagnetic coil. An antiparallel 1N4007 flyback diode clamps reverse-EMF inductive transients when the coil is de-energized, protecting the MCU from inductive voltage spikes.

  Coil energization pulls the armature, snapping the mechanical Normally Open (NO) spring contacts closed against Common (COM). This closes the 230V AC phase conductor, energizing the load bulb. Confirmation does not rely on hypothetical electrical feedback lines; instead, physical closed-loop verification is achieved by the PZEM current transformer (CT) coil: on the subsequent 5-second polling cycle, the sensor detects the resulting current draw (e.g., transition from 0W to 60W), broadcasting verified physical power draw to the dashboard.
* **Key Implementation Details Represented:**
  - React handler: `toggleAppliance()` in `MqttContext.jsx`.
  - MQTT command topic: `enersense/commands`.
  - Firmware JSON parsing via `ArduinoJson`.
  - Active-LOW control logic: `digitalWrite(pin, LOW)` for ON; `digitalWrite(pin, HIGH)` for OFF.
  - Relay GPIO assignments: `GPIO 26` (Relay 1), `GPIO 27` (Relay 2).
  - PC817 optocoupler electrical isolation and 1N4007 flyback protection.
  - Songle SRD-05VDC-SL-C mechanical contact switching.
  - Closed-loop verification via PZEM CT coil telemetry.
* **Formal Blackbook Caption:**
  > **Figure 6.5:** Bidirectional relay control and actuation flowchart, tracing the path from a React UI toggle through HiveMQ MQTT distribution, ESP32 active-LOW GPIO assertion, PC817 optocoupler isolation, and physical CT verification.

---

### Figure 6.6: Google Gemini AI Advisory Pipeline Flowchart
* **File Name:** `ai_recommendation_flowchart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 6)
* **Purpose:** To demonstrate how real-time electrical telemetry is aggregated, synthesized into a domain-constrained system prompt, and processed via the Google Gemini generative AI API to deliver concise, context-aware energy optimization recommendations.
* **Blackbook-Ready Explanation:**
  The advisory pipeline is initiated when a user types an energy conservation query or requests billing insights through the EnerSense AI chat widget on the dashboard. Upon form submission, the `handleSendChat()` function validates that the prompt string is non-empty and that no prior request is actively pending. It optimistically appends the user's message to the `chatMessages` array and sets `isAiLoading` to `true`, displaying an animated `Loader2` typing spinner.

  Rather than transmitting raw text, the frontend context aggregator in `src/utils/gemini.js` extracts real-time telemetry from `MqttContext`:
  - `totalPowerToday`: Cumulative energy consumption in kWh.
  - `currentWatts`: Instantaneous real-time power draw.
  - `liveVoltage`: AC grid voltage (defaults to 238V if unmetered).
  - `estMonthlyBill`: Estimated bill formatted in INR.
  - `projectedMonthlyKwh`: Projected 30-day unit consumption.
  - `topAppliances`: Dynamic percentage breakdown between Appliance 1 and Appliance 2.

  The system synthesizes a multi-part prompt incorporating an explicit persona definition: *"EnerSense AI, a highly concise expert smart home energy assistant."* Strict behavioral guardrails are enforced: responses must remain strictly under two sentences, avoid unprompted statistical recaps, and suggest practical load-shifting actions (e.g., advising consumers to run heavy loads during MERC night off-peak hours between 22:00 and 06:00 to capitalize on the ₹0.75/unit rebate).

  The synthesized payload is dispatched over HTTPS to the Google Gemini endpoint using the `@google/genai` SDK, targeting `gemini-3.5-flash` (with fallback to `gemini-1.5-flash`) at a temperature of 0.5 for balanced, factual advice. If the network times out or the `VITE_GEMINI_API_KEY` is invalid or missing, an error catch block returns a graceful fallback message instructing the user to configure credentials. Upon a successful response, the text is extracted, sanitized, appended to state, and smoothly auto-scrolled into view inside a styled GlassCard chat bubble.
* **Key Implementation Details Represented:**
  - Chat interface: `DashboardPage.jsx` GlassCard component.
  - Context extraction: `liveEnergy`, `livePower`, `liveVoltage`, `predictedBill`, `topAppliances`.
  - Prompt engineering: `src/utils/gemini.js` with MERC tariff rules and two-sentence conciseness constraint.
  - Google GenAI SDK: `@google/genai` library targeting `gemini-3.5-flash`.
  - Non-blocking asynchronous HTTPS communication and graceful error handling.
  - Reactive chat state updates with automatic DOM scrolling (`scrollIntoView`).
* **Formal Blackbook Caption:**
  > **Figure 6.6:** Google Gemini AI advisory pipeline flowchart, illustrating real-time telemetry aggregation, prompt engineering with domain constraints, HTTPS SDK interaction, and reactive UI message rendering.

---

### Figure 6.7: System Use Case Architecture Diagram
* **File Name:** `use_case_diagram.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 7)
* **Purpose:** To define the formal functional scope of the EnerSense platform by modeling user and system interactions, delineating actor roles, and mapping dependency relationships (`<<include>>` and `<<extend>>`) in compliance with UML standards.
* **Blackbook-Ready Explanation:**
  The Use Case diagram establishes the functional boundaries of the Home Energy Optimizer system. The platform interacts with four distinct actors:
  
  1. **Primary Actor — Residential Consumer (Homeowner):** Interacts with the platform to manage accounts, inspect real-time voltage and power telemetry, review historical Recharts power curves, evaluate estimated electricity bills under MERC LT-I slabs, inspect Time-of-Day tariff pricing windows, toggle connected household appliances remotely, and interact with the Gemini AI assistant.
  2. **Secondary Actor — System Administrator / Field Technician:** Performs technical operations including hardware node health monitoring, sensor UART calibration, active-LOW relay diagnosis, and network credential provisioning.
  3. **System Actor — ESP32 IoT Hardware Node:** Autonomous edge actor that continuously samples PZEM-004T Modbus registers, formats JSON payloads, publishes telemetry over MQTT, and executes relay switching upon receipt of inbound actuation commands.
  4. **System Actor — Google Gemini Generative AI Service:** External cloud cognitive actor that receives injected telemetry prompts and returns natural language optimization advice.

  Key UML relationships are explicitly modeled:
  - `UC-04: Estimate Monthly Bill` has an `<<include>>` dependency on `UC-02: Monitor Real-Time Power & Energy Metrics`, as bill estimation strictly requires active telemetry inputs.
  - `UC-07: Query AI Assistant` has `<<include>>` dependencies on both `UC-02` (telemetry monitoring) and `UC-04` (bill estimation), as the prompt synthesizer injects live metrics and tariff tiers into every advisory query.
  - `UC-09: Overload & Tariff Alerts` conditionally extends `UC-02` whenever instantaneous power exceeds configured safety thresholds or when the system clock transitions into peak tariff periods.
* **Key Implementation Details Represented:**
  - 4 UML Actors: Residential Consumer, Field Admin, ESP32 Node, Google Gemini Service.
  - 9 Structured Use Cases: `UC-01` (Auth), `UC-02` (Telemetry), `UC-03` (Graphs), `UC-04` (Billing), `UC-05` (TOD), `UC-06` (Relay Control), `UC-07` (AI Advisor), `UC-08` (Sensor Sampling), `UC-09` (Diagnostics & Calibration).
  - Explicit UML stereotypes: `<<include>>` and `<<extend>>` relationship vectors.
  - System boundary encompassing embedded edge firmware, cloud brokers, and full-stack web software.
* **Formal Blackbook Caption:**
  > **Figure 6.7:** UML Use Case diagram of the Home Energy Optimizer system, establishing functional boundaries, actor associations (human, embedded, and cloud AI), and inclusion dependencies.

---

### Figure 6.8: Diploma Engineering Project Gantt Chart & Roadmap
* **File Name:** `project_gantt_chart.png` (also editable in `home_energy_optimizer_diagrams.drawio` Page 8)
* **Purpose:** To provide a comprehensive chronological project roadmap tracking task planning, milestones, hardware testing phases, full-stack implementation sprints, and blackbook documentation across the 2025–2026 academic year at Shri Bhagubhai Mafatlal Polytechnic.
* **Blackbook-Ready Explanation:**
  The project Gantt chart illustrates the structured engineering methodology adopted across the 12-month development cycle (July 2025 through June 2026):

  - **Phase 1: Problem Definition & Literature Survey (Jul 2025 – Aug 2025):** Evaluated existing home energy monitoring systems, investigated commercial smart meters, surveyed MERC tariff regulations, and drafted the initial project synopsis.
  - **Phase 2: Hardware Procurement & Sensor Calibration (Aug 2025 – Oct 2025):** Acquired the ESP32 DevKit V1, dual PZEM-004T V3.0 modules, 5V optocoupled relay board, and resistive load bulbs. Calibrated sensors against laboratory bench multimeters to verify measurement accuracy.
  - **Phase 3: Firmware & Dual UART Protocol Development (Oct 2025 – Dec 2025):** Programmed ESP32 firmware in C++ using Arduino IDE, implementing dual hardware serial Modbus communication, CRC-16 checks, and error recovery routines.
  - **Phase 4: MQTT Cloud Broker & WebSocket Integration (Nov 2025 – Jan 2026):** Deployed HiveMQ public broker infrastructure, configured topic hierarchies (`enersense/telemetry`, `enersense/commands`), and bridged MQTT to WebSockets for browser compatibility.
  - **Phase 5: React 18 Glassmorphism Dashboard Development (Jan 2026 – Mar 2026):** Designed responsive frontend using React 18, Vite, Tailwind CSS, and Recharts, implementing live power trend charts and appliance control cards.
  - **Phase 6: MERC Tariff Engine & Predictive Billing (Feb 2026 – Apr 2026):** Engineered mathematical modeling for Category LT-I (B) residential consumers in `billing.js`, incorporating telescopic slabs, flat wheeling charges, tiered demand fees, TOD windows, and statutory state levies.
  - **Phase 7: Google Gemini AI Advisory Chat Integration (Mar 2026 – Apr 2026):** Integrated `@google/genai` SDK with `gemini-3.5-flash`, establishing live telemetry context injection and prompt optimization.
  - **Phase 8: Node.js Backend & PostgreSQL Database (Jan 2026 – Mar 2026):** Constructed Express.js REST API on Port 5000, establishing user authentication routes, JWT sessions, and Neon PostgreSQL cloud schemas.
  - **Phase 9: System Bench Testing & Optocoupler Hardware Fix (Mar 2026 – May 2026):** Conducted prolonged multi-load bench testing. Diagnosed optocoupler breakdown on PZEM Sensor 1 following high-voltage test bench surge; implemented software mirroring fallback to maintain data flow while executing board-level optocoupler replacement.
  - **Phase 10: Final Blackbook Documentation & Oral Defense (May 2026 – Jun 2026):** Authored final-year engineering blackbook, prepared architectural diagrams, completed blackbook formatting, and finalized demonstration presentations for academic evaluation.
* **Key Implementation Details Represented:**
  - 10 distinct, chronologically ordered project milestones.
  - Color-coded milestone statuses: Completed (Blue `#0284C7`), Hardware Validation (Green `#10B981`), and Final Documentation (Amber `#F59E0B`).
  - Realistic timeline mirroring the MSBTE / SBMP final-year diploma academic curriculum.
  - Real-world engineering hurdle incorporated: PZEM optocoupler troubleshooting and dual-UART hardware diagnosis.
* **Formal Blackbook Caption:**
  > **Figure 6.8:** Academic project Gantt chart and milestone roadmap (July 2025 – June 2026) for the Home Energy Optimizer diploma engineering project, detailing hardware procurement, firmware architecture, full-stack implementation, and blackbook preparation.

---

### Verification and Deliverable Index
| Figure # | Diagram Title | Image Asset (`.png`) | Draw.io Page | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Figure 6.1** | Overall System Operational Workflow | `overall_system_flowchart.png` | Page 1: Overall System Flowchart | **Verified & Ready** |
| **Figure 6.2** | Dual PZEM-004T Sensor Acquisition Flowchart | `sensor_reading_flowchart.png` | Page 2: Sensor Reading Flowchart | **Verified & Ready** |
| **Figure 6.3** | End-to-End Data Communication Architecture | `data_communication_flowchart.png` | Page 3: Data Communication Flowchart | **Verified & Ready** |
| **Figure 6.4** | Electricity Bill Estimation & MERC Tariff Flowchart | `electricity_bill_calculation_flowchart.png` | Page 4: Electricity Bill Calculation Flowchart | **Verified & Ready** |
| **Figure 6.5** | Bidirectional Relay Control & Actuation Flowchart | `relay_control_flowchart.png` | Page 5: Relay Control Flowchart | **Verified & Ready** |
| **Figure 6.6** | Google Gemini AI Advisory Pipeline Flowchart | `ai_recommendation_flowchart.png` | Page 6: AI Recommendation Flowchart | **Verified & Ready** |
| **Figure 6.7** | System Use Case Architecture Diagram | `use_case_diagram.png` | Page 7: System Use Case Diagram | **Verified & Ready** |
| **Figure 6.8** | Diploma Engineering Project Gantt Chart & Roadmap | `project_gantt_chart.png` | Page 8: Project Gantt Chart | **Verified & Ready** |
