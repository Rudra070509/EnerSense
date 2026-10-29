#define RELAY_1 26
#define RELAY_2 27

void setup() {
  Serial.begin(115200);
  
  // Set relay pins as outputs
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);

  // Start with relays OFF
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
  
  Serial.println("Relay Test Started. WiFi is OFF.");
}

void loop() {
  Serial.println("Turning Relays ON (LOW)...");
  digitalWrite(RELAY_1, LOW);
  digitalWrite(RELAY_2, LOW);
  delay(2000); // Wait 2 seconds

  Serial.println("Turning Relays OFF (HIGH)...");
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
  delay(2000); // Wait 2 seconds
}