// The onboard LED on most ESP32 dev boards is connected to GPIO 2.
const int ledPin = 2;

void setup() {
  // Initialize the serial communication at 115200 baud rate
  Serial.begin(115200);
  
  // Configure the LED pin as an output
  pinMode(ledPin, OUTPUT);
  
  Serial.println("\nESP32 Basic Test Started!");
  Serial.println("If you see this, your computer is successfully communicating with the ESP32!");
}

void loop() {
  // Turn the LED on
  digitalWrite(ledPin, HIGH);
  Serial.println("LED is ON");
  delay(1000); // Wait for 1 second (1000 milliseconds)

  // Turn the LED off
  digitalWrite(ledPin, LOW);
  Serial.println("LED is OFF");
  delay(1000); // Wait for 1 second
}
