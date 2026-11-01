# Home Energy Optimizer (EnerSense) — Missing Information & Action Checklist

**Project Title:** Home Energy Optimizer (EnerSense)  
**Document Purpose:** Pre-Submission Checklist for Final Blackbook Review, Institutional Field Placeholders, and Viva Voce Hardware Verification  

---

## 1. Front Matter Institutional Placeholders (To Fill in Word Document)

Before final printing and binding, verify and fill in the following editable fields in `Home_Energy_Optimizer_Blackbook.docx`:

| Placeholder Token | Description | Location in Document | Suggested / Default Value | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `[COLLEGE NAME]` | Name of Polytechnic / Institute | Cover, Title, Certificate | Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai | Confirm exact spelling on college letterhead |
| `[STUDENT NAME 1]` | Candidate 1 Full Name | Title, Certificate, Declaration | `[STUDENT NAME 1]` | Enter official student name as per diploma enrollment |
| `[ROLL NUMBER 1]` | Candidate 1 Roll Number | Title, Certificate, Declaration | `[ROLL NUMBER 1]` | Enter student roll number |
| `[STUDENT NAME 2]` | Candidate 2 Full Name | Title, Certificate, Declaration | `[STUDENT NAME 2]` | Enter official student name as per diploma enrollment |
| `[ROLL NUMBER 2]` | Candidate 2 Roll Number | Title, Certificate, Declaration | `[ROLL NUMBER 2]` | Enter student roll number |
| `[PROJECT GUIDE NAME]` | Faculty Project Guide | Title, Certificate, Acknowledgement | Mrs. SHARYU KADAM | Confirm guide designation & qualification |
| `[HEAD OF DEPARTMENT]`| Head of Computer Engineering Dept | Certificate Page | `[HOD NAME]`, Lecturer & HOD | Enter official HOD name |
| `[PRINCIPAL NAME]` | Principal of the Polytechnic | Certificate Page | `[PRINCIPAL NAME]` | Enter Principal's full name |
| `[ACADEMIC YEAR]` | Academic Session | Cover, Certificate | 2025 – 2026 | Confirm diploma final year batch |
| `[SUBMISSION DATE]` | Date of Final Blackbook Submission | Certificate, Declaration | May / June 2026 | Enter official project defense date |

---

## 2. Hardware Test Bench Checklist (Prior to Practical Viva)

| # | Hardware Task | Current Status | Action Needed for Final Practical Demo |
| :--- | :--- | :--- | :--- |
| 1 | **PZEM Sensor 2 Optocoupler Replacement** | Workaround active (Software mirror) | Solder replacement PC817 optocoupler on Sensor 2 high-voltage isolation stage. |
| 2 | **Modbus Slave Address Assignment** | Sensor 1 at `0xF8` | Flash `PZEM_Address_Changer.ino` to set Sensor 1 to `0x01` and Sensor 2 to `0x02` to allow true dual-channel query. |
| 3 | **AC High-Voltage Wire Terminal Tightening** | Functional on test bench | Inspect screw terminal blocks on 230V live and neutral buses to ensure no stray copper strands touch the 5V logic headers. |
| 4 | **Enclosure / Acrylic Box Housing** | Open breadboard bench | Mount ESP32, relay module, and PZEM sensors inside an insulated, flame-retardant electrical enclosure for viva presentation safety. |
| 5 | **Relay Active-LOW Polarity Verification** | Confirmed (`LOW` = ON) | Ensure load bulbs are connected across `COM` and `NO` (Normally Open) contacts so they turn OFF when power is cut. |

---

## 3. Cloud Services & Software Configuration Checklist

| # | Software Parameter | Current Config | Pre-Demonstration Action |
| :--- | :--- | :--- | :--- |
| 1 | **Wi-Fi Credentials (`SSID` & `PASSWORD`)** | Test bench Wi-Fi credentials | Update `EnerSense.ino` with mobile hotspot SSID & password before the college viva demonstration. |
| 2 | **Google Gemini API Key** | `VITE_GEMINI_API_KEY` in `.env` | Verify API key has active quota and is not expired on Google AI Studio. |
| 3 | **PostgreSQL Neon Cloud Database** | Active on Neon Serverless | Ensure Neon project has not entered auto-suspend mode before the demonstration. |
| 4 | **HiveMQ Cloud Public Broker Reachability** | `broker.hivemq.com` Port 1883 & 8000 | Verify college Wi-Fi firewall allows outgoing TCP traffic on Port 1883 and WebSockets on Port 8000 (hotspot recommended). |

---

## 4. Blackbook Document Printing & Binding Checklist

- [ ] Print full document on 85–100 GSM Bond Paper (A4 size).
- [ ] Ensure double-sided or single-sided printing according to SBMP departmental guidelines.
- [ ] Verify that all 8 diagrams in Chapter 6 are crisp, high-resolution (300 DPI), and readable in color.
- [ ] Check that page numbering follows roman numerals (`i, ii, iii...`) for front matter and arabic numerals (`1, 2, 3...`) for chapters.
- [ ] Obtain physical signatures from Guide, HOD, and Principal on Certificate pages.
- [ ] Bind in official Departmental Black Leatherette hard binding with embossed gold lettering.
