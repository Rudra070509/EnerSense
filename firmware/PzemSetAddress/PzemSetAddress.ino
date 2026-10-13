#include <PZEM004Tv30.h>

/*
  PZEM-004T v3.0 Modbus Address Setter
  
  Instructions:
  1. CONNECT ONLY ONE PZEM SENSOR AT A TIME to the ESP32!
  2. Wire ESP32 Pin 16 (RX2) to PZEM TX, and Pin 17 (TX2) to PZEM RX.
  3. Upload this code.
  4. Open the Serial Monitor at 115200 baud.
  5. The code will set the address to the value defined in NEW_ADDRESS.
*/

#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

// SET THIS TO THE NEW ADDRESS YOU WANT (e.g., 0x01, 0x02, etc.)
#define NEW_ADDRESS 0xF8 

// Connect to the PZEM using the factory default (0xF8) or any universal broadcast address
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("--- PZEM Address Setter ---");
  Serial.print("Current Address (before change): 0x");
  Serial.println(pzem.getAddress(), HEX);

  Serial.print("Setting new address to: 0x");
  Serial.println(NEW_ADDRESS, HEX);

  // Set the new address
  if(pzem.setAddress(NEW_ADDRESS)) {
    Serial.println("Success! Address changed.");
  } else {
    Serial.println("FAILED to change address. Check wiring.");
  }
  
  delay(1000);
  
  // Verify by attempting to read from the newly assigned address
  PZEM004Tv30 pzem_verify(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, NEW_ADDRESS);
  Serial.print("Verifying New Address: 0x");
  Serial.println(pzem_verify.getAddress(), HEX);
}

void loop() {
  // Do nothing
}
