# EnerSense Hardware Wiring Guide

This document details the complete wiring diagram and pinouts for the EnerSense IoT node, consisting of an ESP32, a 2-Channel Relay Module, and a PZEM-004T v3.0 Energy Sensor.

## ⚠️ Safety Warning
**This project involves working with live AC mains voltage (110V/220V).**
- Always completely unplug the AC power cord from the wall before touching any wires, the relay board, or the PZEM module.
- Never touch the bottom of the relay module or PZEM board when AC power is connected.

---

## 1. Low-Voltage DC Wiring (ESP32)

### Power (5V & GND)
The ESP32 is powered via USB from your computer or a 5V USB adapter. The ESP32's `VIN` (or `5V`) pin is used to supply power to both the Relay and the PZEM logic side.
* **ESP32 5V/VIN** ➡️ Connects to **Relay VCC** *AND* **PZEM 5V** (splice wires together)
* **ESP32 GND** ➡️ Connects to **Relay GND** *AND* **PZEM GND** (splice wires together)

### Relay Control (GPIO)
* **ESP32 Pin D26** ➡️ Connects to **Relay IN1**

### PZEM Modbus (UART2)
* **ESP32 Pin D16 (RX2)** ➡️ Connects to **PZEM TX**
* **ESP32 Pin D17 (TX2)** ➡️ Connects to **PZEM RX**

---

## 2. High-Voltage AC Wiring (Load & Sensors)

### AC Mains Input
* **AC Live Wire (Wall)** ➡️ Splits to **PZEM 'L' Terminal** *AND* **Relay 'COM' Terminal**
* **AC Neutral (Wall)** ➡️ Splits to **PZEM 'N' Terminal** *AND* **Appliance/Bulb Neutral Wire**

### Switching & Current Sensing
* **Relay 'NO' Terminal** ➡️ Passes **THROUGH** the center hole of the round PZEM CT Coil ➡️ Connects to **Appliance/Bulb Live Wire**.
* **CT Coil small wires** ➡️ Connect to the two small screw terminals on the PZEM-004T.

---

## 3. Circuit Diagram

```mermaid
graph TD
    classDef danger fill:#ffcccc,stroke:#ff0000,stroke-width:2px;
    classDef safe fill:#e6f3ff,stroke:#0066cc,stroke-width:2px;
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:2px;

    subgraph AC_Mains ["🔌 AC Wall Plug (110V/220V)"]
        Live[Live Wire / Red or Brown]:::danger
        Neutral[Neutral Wire / Black or Blue]:::danger
    end

    subgraph ESP32 ["🧠 ESP32 Board"]
        VIN[VIN / 5V]:::safe
        GND[GND]:::safe
        D26[Pin 26]:::safe
        RX2[Pin 16 / RX2]:::safe
        TX2[Pin 17 / TX2]:::safe
    end

    subgraph Relay ["⚡ Relay Module"]
        RVCC[VCC]:::safe
        RGND[GND]:::safe
        IN1[IN1]:::safe
        COM[COM Terminal]:::danger
        NO[NO Terminal]:::danger
    end

    subgraph PZEM ["🔋 PZEM-004T v3.0"]
        P5V[5V]:::safe
        PGND[GND]:::safe
        PTX[TX]:::safe
        PRX[RX]:::safe
        VAC_L[AC Terminal 'L']:::danger
        VAC_N[AC Terminal 'N']:::danger
        CT1[CT Coil Terminal 1]:::safe
        CT2[CT Coil Terminal 2]:::safe
    end
    
    subgraph CT_Coil ["⭕ Round CT Coil"]
        Wire1[Small Wire 1]:::safe
        Wire2[Small Wire 2]:::safe
        Hole((Pass bulb wire THROUGH hole)):::danger
    end

    subgraph Load ["💡 LED Bulb"]
        Bulb_L[Bulb Wire 1]:::danger
        Bulb_N[Bulb Wire 2]:::danger
    end

    %% ESP32 to Relay
    VIN -->|5V Power| RVCC
    GND -->|Ground| RGND
    D26 -->|Control Signal| IN1

    %% ESP32 to PZEM
    VIN -->|5V Power| P5V
    GND -->|Ground| PGND
    RX2 -->|UART Receive| PTX
    TX2 -->|UART Transmit| PRX

    %% CT Coil to PZEM
    Wire1 -.-> CT1
    Wire2 -.-> CT2

    %% AC High Voltage Wiring
    Live ====|Splice to PZEM| VAC_L
    Live ====|Live to Relay| COM
    
    Neutral ====|Splice to PZEM| VAC_N
    Neutral ====|Neutral to Bulb| Bulb_N

    %% Bulb Control & Current Sensing
    COM -.->|Internal Switch| NO
    NO ====|Live Wire| Hole
    Hole ====|Wire continues| Bulb_L
```
