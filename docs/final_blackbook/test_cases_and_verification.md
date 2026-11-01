# Home Energy Optimizer (EnerSense) — Test Cases & Verification Report

**Project Title:** Home Energy Optimizer (EnerSense)  
**Academic Institution:** Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai  
**Program:** Diploma in Computer Engineering (Final Year Blackbook Project)  
**Document Purpose:** Academic Testing Specification, Experimental Verification Log, and Traceability Matrix  

---

## 1. Testing Strategy and Methodology

The testing procedure for the **Home Energy Optimizer** platform incorporates a multi-tiered verification hierarchy tailored for an IoT embedded-cloud ecosystem:
1. **Hardware & Embedded Layer:** Verifying electrical pin continuity, optocoupler isolation, 230V AC mains line safety, sensor Modbus polling integrity, and active-LOW relay coil response.
2. **Communication & Transport Layer:** Verifying MQTT TCP packet dispatch (ESP32 $\rightarrow$ HiveMQ), WebSockets bridge routing (HiveMQ $\rightarrow$ React), and JSON payload schema compliance.
3. **Application & Algorithmic Layer:** Validating mathematical execution of MERC FY 2024–25 LT-I (B) telescopic slabs, tiered fixed demand fees, wheeling charges, TOD window triggers, and statutory state levies.
4. **Cognitive Cloud Layer:** Testing Google Gemini prompt injection, response sanitization, and fallback behavior under invalid API keys.
5. **Full-Stack User Interface Layer:** Verifying real-time Recharts 15-point line chart updates, glassmorphism modal rendering, and responsive toggle states.

---

## 2. Comprehensive Test Case Matrix

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-HW-01** | ESP32 Power-On Reset & Peripherals Initialization | 5V DC micro-USB connected; firmware flashed | 1. Apply power to ESP32.<br>2. Observe Serial Monitor at 115200 baud.<br>3. Inspect GPIO 2, 26, and 27 default voltage states. | Status LED flashes; Relays 1 & 2 set to logical HIGH (de-energized/OFF); Boot message printed. | ESP32 booted; Serial monitor displayed init logs; Relay channels remained de-energized on startup. | **PASSED (Verified)** |
| **TC-HW-02** | Wi-Fi Station Association & DHCP Lease | Valid 2.4 GHz WPA2 SSID and password in firmware | 1. Power on ESP32 within range of Wi-Fi AP.<br>2. Monitor connection loop. | ESP32 connects within 10 seconds and receives valid local IPv4 address via DHCP. | Connected to Wi-Fi; valid IP assigned (`192.168.x.x`). | **PASSED (Verified)** |
| **TC-HW-03** | PZEM-004T Sensor 1 Modbus RTU Interrogation | AC mains live (230V) connected to L/N terminals; Serial2 wired to GPIO 16/17 | 1. Issue Modbus Function 0x04 to address 0xF8.<br>2. Await response within 200ms.<br>3. Verify CRC-16 checksum. | Sensor returns 10 registers with valid non-NaN voltage, current, active power, and energy. | Sensor 1 responded successfully at address `0xF8` with Voltage 239.6 V, Frequency 50.0 Hz, valid power readings. | **PASSED (Verified)** |
| **TC-HW-04** | Dual UART Independent Sensor 2 Interrogation | PZEM Sensor 2 connected to Serial1 (GPIO 18/19); AC mains live | 1. Issue Modbus command on Serial1 to address 0x02 or 0xF8.<br>2. Check for register response. | Sensor 2 returns independent electrical measurements for Load 2. | Sensor 2 failed to respond due to bench optocoupler breakdown from test surge; software mirror active. | **FAILED / BENCH FALLBACK (Documented)** |
| **TC-HW-05** | Opto-Isolated Active-LOW Relay 1 Switching | Relay board powered via 5V VIN rail; GPIO 26 connected to IN1 | 1. Execute `digitalWrite(26, LOW)`.<br>2. Verify optocoupler LED illumination and mechanical click. | Songle SRD-05VDC coil energizes; NO contact snaps to COM; Load 1 bulb turns ON. | Relay contact snapped closed with audible click; 60W bulb energized; active-LOW confirmed. | **PASSED (Verified)** |
| **TC-HW-06** | Opto-Isolated Active-LOW Relay 2 Switching | Relay board powered via 5V VIN rail; GPIO 27 connected to IN2 | 1. Execute `digitalWrite(27, LOW)`.<br>2. Verify optocoupler LED illumination and mechanical click. | Songle SRD-05VDC coil energizes; NO contact snaps to COM; Load 2 bulb turns ON. | Relay contact closed; Load 2 energized; active-LOW confirmed. | **PASSED (Verified)** |
| **TC-COMM-01** | HiveMQ MQTT TCP Telemetry Publishing | ESP32 connected to Wi-Fi; broker `broker.hivemq.com:1883` reachable | 1. Assemble JSON telemetry struct.<br>2. Call `client.publish("enersense/telemetry", buffer)`.<br>3. Inspect MQTT client desktop tool. | Payload received on broker with QoS 0 every 5000ms containing voltage, totalPower, and appliance arrays. | HiveMQ Web Client verified message arrival every 5 seconds with valid JSON syntax. | **PASSED (Verified)** |
| **TC-COMM-02** | WebSockets Bridge Ingestion in React Frontend | React app running; WebSocket connected to `ws://broker.hivemq.com:8000/mqtt` | 1. Subscribe to `enersense/telemetry` via `mqtt.js` in `MqttContext.jsx`.<br>2. Inspect React state console. | WebSocket stream parses JSON payload and populates `telemetry` state object. | Live telemetry received; state updated in React DevTools; gauge values animated. | **PASSED (Verified)** |
| **TC-COMM-03** | Bidirectional Remote Actuation Command Dispatch | React dashboard loaded; user toggles Appliance 1 switch | 1. User clicks UI toggle switch.<br>2. React dispatches `{ "applianceId": 1, "state": "ON" }` to `enersense/commands`.<br>3. ESP32 parses JSON in callback. | ESP32 asserts GPIO 26 LOW; relay clicks ON; physical load powers up. | Command published via WebSockets; received by ESP32; GPIO 26 driven LOW; bulb turned ON. | **PASSED (Verified)** |
| **TC-BILL-01** | MERC Slab 1 (0–100 kWh) Calculation | `projectedMonthlyKwh = 80 kWh` | 1. Pass 80 kWh to `calculateBill()`.<br>2. Compute EC = $80 \times 3.15 = 252$.<br>3. Add FC = ₹90, Wheeling = $80 \times 2.60 = 208$.<br>4. Apply 16% Duty on Taxable Base ₹550. | Total Bill matches mathematical formula: ₹252 + ₹208 + ₹90 + ₹28 (FAC) + ₹88 (Duty) = ₹666. | Returned ₹666; slab tier labeled "0-100 kWh (Base Tier)"; effective unit rate ₹8.32/kWh. | **PASSED (Verified)** |
| **TC-BILL-02** | MERC Slab 2 (101–300 kWh) Telescopic Progression | `projectedMonthlyKwh = 200 kWh` | 1. Compute Slab 1 (100 @ 3.15) + Slab 2 (100 @ 5.40) = ₹855.<br>2. Add FC (₹135) + Wheeling (₹520) + FAC (₹70) + 16% Duty (₹241.60). | Total predicted bill matches ₹1,821.60. | Returned ₹1,822; telescopic distribution confirmed. | **PASSED (Verified)** |
| **TC-BILL-03** | MERC Time-of-Day (TOD) Night Rebate Evaluation | System clock between 22:00 and 06:00 | 1. Evaluate TOD engine at 23:30.<br>2. Verify rebate indicator. | Status reflects "Night Off-Peak (22:00-06:00)"; TOD incentive applied: -₹0.75/unit. | TOD correctly identified as Night Off-Peak; UI badge displayed green moon icon with -₹0.75 advice. | **PASSED (Verified)** |
| **TC-AI-01** | Google Gemini Context-Aware Advisory Generation | Valid `VITE_GEMINI_API_KEY`; live power = 120W; night TOD slot | 1. Submit prompt "How can I reduce my bill?"<br>2. Trigger `handleSendChat()`.<br>3. Inspect Gemini prompt and response. | Gemini receives injected power and TOD context; returns concise advice under 2 sentences recommending night load shifting. | AI response received in ~1.2s: "Your current draw is moderate. Shift high-wattage appliance cycles to the 22:00-06:00 off-peak window to save ₹0.75 per unit under MERC rules." | **PASSED (Verified)** |
| **TC-AI-02** | Google Gemini Missing/Invalid API Key Handling | `VITE_GEMINI_API_KEY` empty or invalid string | 1. Send chat prompt.<br>2. Trigger API catch block. | Catch block intercepts error; returns friendly fallback message without crashing dashboard. | Catch block returned: "Gemini API key is missing or invalid. Please configure VITE_GEMINI_API_KEY in your environment."; UI remained stable. | **PASSED (Verified)** |
| **TC-DB-01** | User Authentication via Express & PostgreSQL | Express backend running on Port 5000; Neon PostgreSQL connected | 1. Submit signup request to `/api/auth/signup`.<br>2. Check `users` table record. | HTTP 201 Created; password securely hashed with bcrypt; user record inserted. | User account created; JWT token issued; record present in Neon PostgreSQL database. | **PASSED (Verified)** |
| **TC-DB-02** | Long-Term 5-Second Telemetry Archival to SQL | Telemetry stream active | 1. Periodically write 5-second PZEM records to a database telemetry table. | Telemetry records appended continuously with timestamps. | Telemetry currently streams directly to React; automatic SQL logging is a planned future extension. | **PROPOSED / PENDING VERIFICATION** |

---

## 3. Physical Bench Testing Log & Observations

### 3.1 PZEM-004T Address Scanner Verification
During bench setup, hardware UART communication was validated using a dedicated firmware scanner script. The sensor was probed across broadcast address `0xF8` and discrete addresses `0x01` through `0x0A`.

```text
===========================================
       ⚡ PZEM-004T HARDWARE SCANNER ⚡     
===========================================
Testing communication on Pin 16 (RX) & Pin 17 (TX)...

[TEST 1] Testing Universal Broadcast Address (0xF8)...
>>> SUCCESS! Sensor responded to 0xF8! Voltage: 239.6 V
Address is currently: 0xF8
```

### 3.2 Electrical Safety & Physical Verification Rules
* **Galvanic Isolation:** The PC817 optocouplers on the relay module and PZEM-004T ensure the 3.3V ESP32 microcontroller logic is physically isolated from the 230V AC mains potential.
* **Closed-Loop Feedback:** Physical load verification is performed via the PZEM current transformer (CT) coil rather than assumed software state:
  - Relay de-energized $\rightarrow$ Current = 0.000 A, Power = 0.0 W.
  - Relay energized (60W bulb) $\rightarrow$ Current $\approx 0.260$ A, Power $\approx 62.4$ W, PF $\approx 0.99$.

---

## 4. Test Summary & Traceability

* **Total Test Cases Defined:** 16
* **Verified & Passed:** 14
* **Failed / Hardware Bench Workaround Documented:** 1 (PZEM 2 optocoupler breakdown; handled via mirror fallback)
* **Proposed Future Extension:** 1 (Long-term continuous SQL telemetry logging)
* **Testing Integrity Affirmation:** No results have been fabricated. All passing tests reflect verified terminal logs, serial monitor traces, or browser devtools network captures.
