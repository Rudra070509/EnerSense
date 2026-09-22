#include <PZEM004Tv30.h>

// Relay pins (just to turn them off while we test the sensor)
const int RELAY_1 = 26;
const int RELAY_2 = 27;

// PZEM Hardware Serial Pins (UART2)
const int PZEM_RX_PIN = 16;
const int PZEM_TX_PIN = 17;

// Initialize the PZEM on Serial2
// If you only have one connected right now, this default constructor works perfectly.
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);

void setup() {
  Serial.begin(115200);
  
  // Turn off relays to stop the clicking
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);

  Serial.println("\n--- PZEM-004T V3.0 Test Started ---");
  Serial.println("Waiting for sensor data...\n");
}

void loop() {
  // Read the data from the sensor
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  // Check if the reading is valid (if voltage is NaN, the sensor isn't communicating)
  if(isnan(voltage)){
      Serial.println("Error reading voltage! Check your wiring.");
  } else {
      // Print the values to the Serial Monitor
      Serial.print("Voltage: ");      Serial.print(voltage);      Serial.println(" V");
      Serial.print("Current: ");      Serial.print(current);      Serial.println(" A");
      Serial.print("Power: ");        Serial.print(power);        Serial.println(" W");
      Serial.print("Energy: ");       Serial.print(energy,3);     Serial.println(" kWh");
      Serial.print("Frequency: ");    Serial.print(frequency, 1); Serial.println(" Hz");
      Serial.print("Power Factor: "); Serial.println(pf);
      Serial.println("-------------------------");
  }

  // Wait 2 seconds before reading again
  delay(2000);
}
