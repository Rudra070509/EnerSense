#include <Arduino.h>
#include <PZEM004Tv30.h>

#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("\n===========================================");
  Serial.println("       ⚡ PZEM-004T HARDWARE SCANNER ⚡     ");
  Serial.println("===========================================");
  Serial.println("Testing communication on Pin 16 (RX) & Pin 17 (TX)...\n");

  // Step 1: Test with the Universal Broadcast Address (0xF8)
  Serial.println("[TEST 1] Testing Universal Broadcast Address (0xF8)...");
  PZEM004Tv30 pzemBroadcast(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, 0xF8);
  float vBroadcast = pzemBroadcast.voltage();
  if (!isnan(vBroadcast)) {
    Serial.printf(">>> SUCCESS! Sensor responded to 0xF8! Voltage: %.1f V\n", vBroadcast);
    Serial.println("Address is currently: 0xF8");
    return;
  } else {
    Serial.println("  -> No response at 0xF8.");
  }

  // Step 2: Test with Address 0x02
  Serial.println("\n[TEST 2] Testing Address 0x02...");
  PZEM004Tv30 pzem2(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, 0x02);
  float v2 = pzem2.voltage();
  if (!isnan(v2)) {
    Serial.printf(">>> SUCCESS! Sensor responded to 0x02! Voltage: %.1f V\n", v2);
    Serial.println("Address is currently: 0x02");
    return;
  } else {
    Serial.println("  -> No response at 0x02.");
  }

  // Step 3: Test with Address 0x01
  Serial.println("\n[TEST 3] Testing Address 0x01...");
  PZEM004Tv30 pzem1(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, 0x01);
  float v1 = pzem1.voltage();
  if (!isnan(v1)) {
    Serial.printf(">>> SUCCESS! Sensor responded to 0x01! Voltage: %.1f V\n", v1);
    Serial.println("Address is currently: 0x01");
    return;
  } else {
    Serial.println("  -> No response at 0x01.");
  }

  // Step 4: Scan all addresses 1 to 10
  Serial.println("\n[TEST 4] Scanning addresses 0x03 to 0x0A...");
  for (uint8_t addr = 3; addr <= 10; addr++) {
    PZEM004Tv30 pzemScan(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, addr);
    float v = pzemScan.voltage();
    if (!isnan(v)) {
      Serial.printf(">>> FOUND SENSOR at address: 0x%02X! Voltage: %.1f V\n", addr, v);
      return;
    }
  }

  Serial.println("\n===========================================");
  Serial.println("❌ SENSOR DID NOT RESPOND TO ANY ADDRESS!");
  Serial.println("===========================================");
  Serial.println("Causes:");
  Serial.println("1. AC wall plug is NOT delivering live voltage to L and N.");
  Serial.println("2. Pins 16 and 17 need to be swapped (PZEM TX -> 16, RX -> 17).");
  Serial.println("3. 5V or GND is not seated firmly.");
}

void loop() {
  delay(1000);
}
