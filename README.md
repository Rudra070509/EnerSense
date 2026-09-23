
# Home Energy Optimizer

## Overview

The **Home Energy Optimizer** is an IoT-based smart monitoring and control system designed to help households track, predict, and reduce their electricity consumption. By monitoring power consumption at the individual appliance level in real time, the system addresses the common issue of consumers lacking visibility into their usage until they receive their monthly bill.

## Key Features

* **Appliance-Level Monitoring:** Continuously tracks voltage, current, power, and cumulative energy of individual appliances using PZEM-004T sensors interfaced with an ESP32 microcontroller.


* **Predictive Billing:** Calculates daily energy usage and predicts the expected monthly bill in advance using realistic tariff-slab-based calculations.


* **AI-Powered Insights:** Integrates the Google Gemini API to analyze usage patterns and generate personalized, actionable energy-saving suggestions.


* **Remote Control:** Features a web dashboard that allows users to remotely switch appliances on or off via relay-based control.


* **Live Dashboard:** Presents live power usage, appliance-wise breakdowns, predicted bills, and AI suggestions in a single, accessible user interface.



## Tech Stack

### Hardware

* **Microcontroller:** ESP32 development board (WiFi + Bluetooth, dual-core)


* **Energy Sensor:** PZEM-004T v3.0 (x2) — AC voltage/current/power/energy sensor, 10A, TTL/Modbus RTU interface


* **Relay Module:** 2-Channel relay module, 5V, opto-isolated


* **Power Supply:** 5V DC, 2A+ USB adapter



### Software

* **Firmware:** Arduino IDE, C++ (PZEM004Tv30, PubSubClient libraries)


* **Communication:** MQTT (application layer), Modbus RTU (PZEM ↔ ESP32)


* **Backend:** Node.js with Express


* **Database:** MongoDB / PostgreSQL (time-series appliance readings)


* **Frontend:** React.js, Recharts / Chart.js for data visualization


* **AI Engine:** Google Gemini API



## How It Works

1. PZEM-004T sensors measure electrical parameters for connected appliances (demonstrated using two bulbs in the prototype).


2. The ESP32 reads this data over UART using the Modbus RTU protocol.


3. Data is transmitted over WiFi via MQTT to a backend server and stored in a time-series database.


4. The backend computes daily consumption and projects the monthly bill based on configured tariff slabs.


5. Usage data is passed to the Gemini API, which returns personalized suggestions.


6. The frontend web dashboard displays all insights and allows the user to send ON/OFF commands back to the ESP32 through the MQTT broker.



## Limitations

* The current prototype demonstrates functionality for two bulbs; scaling requires additional sensors and relay channels.


* Bill prediction accuracy relies heavily on the correct configuration of electricity tariff slabs by the user.


* The system requires a constant, stable WiFi connection for real-time transmission and control.


* The AI-generated insights depend on internet connectivity and the availability of the Gemini API.


* The prototype is restricted to monitoring single-phase AC loads and does not support three-phase power.





