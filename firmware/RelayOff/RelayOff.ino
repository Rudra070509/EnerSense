// Hardware Pins for Relays
const int RELAY_1 = 26;
const int RELAY_2 = 27;

void setup() {
  // Configure relay pins as outputs
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  
  // Turn BOTH relays OFF immediately
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
}

void loop() {
  // Do nothing. Just sit quietly.
}
