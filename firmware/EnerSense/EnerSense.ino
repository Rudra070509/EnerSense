#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "Galaxy12";
const char* password = "12345678";

// MQTT Broker (using a free public broker for now)
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// MQTT Topics
const char* topic_telemetry = "enersense/telemetry";
const char* topic_commands = "enersense/commands";

// --- Hardware Pins ---
#define RELAY_1 26
#define RELAY_2 27
#define PZEM_RX_PIN 16
#define PZEM_TX_PIN 17

// --- Objects ---
WiFiClient espClient;
PubSubClient client(espClient);

// Initialize ONE PZEM sensor using the default factory address (0xF8)
PZEM004Tv30 pzem1(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);
// We will comment out the second one for now while testing
// PZEM004Tv30 pzem2(Serial2, PZEM_RX_PIN, PZEM_TX_PIN, 0x02);

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// Callback for receiving incoming MQTT commands to control relays
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Expecting JSON like: {"applianceId": 1, "state": "ON"}
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  int applianceId = doc["applianceId"];
  const char* state = doc["state"];

  if (applianceId == 1) {
    digitalWrite(RELAY_1, strcmp(state, "ON") == 0 ? LOW : HIGH); // Assuming active-low relays
  } else if (applianceId == 2) {
    digitalWrite(RELAY_2, strcmp(state, "ON") == 0 ? LOW : HIGH);
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "EnerSense-ESP32-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Subscribe to command topic
      client.subscribe(topic_commands);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Configure Relays
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  digitalWrite(RELAY_1, HIGH); // Default OFF (assuming active-low)
  digitalWrite(RELAY_2, HIGH); 

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  // Publish telemetry every 5 seconds
  if (now - lastMsg > 5000) {
    lastMsg = now;

    // Read Data from Sensor 1
    float voltage1 = pzem1.voltage();
    float current1 = pzem1.current();
    float power1 = pzem1.power();
    float energy1 = pzem1.energy();

    // Read Data from Sensor 2 (Commented out for now)
    float voltage2 = 0.0; // pzem2.voltage();
    float current2 = 0.0; // pzem2.current();
    float power2 = 0.0; // pzem2.power();
    float energy2 = 0.0; // pzem2.energy();

    // Check if readings are valid
    if(isnan(voltage1)) {
        Serial.println("Error reading PZEM 1");
        voltage1 = current1 = power1 = energy1 = 0.0;
    }
    // if(isnan(voltage2)) {
    //    Serial.println("Error reading PZEM 2");
    //    voltage2 = current2 = power2 = energy2 = 0.0;
    // }

    // Prepare JSON payload
    StaticJsonDocument<300> doc;
    
    JsonObject app1 = doc.createNestedObject("appliance1");
    app1["voltage"] = voltage1;
    app1["current"] = current1;
    app1["power"] = power1;
    app1["energy"] = energy1;

    JsonObject app2 = doc.createNestedObject("appliance2");
    app2["voltage"] = voltage2;
    app2["current"] = current2;
    app2["power"] = power2;
    app2["energy"] = energy2;

    char jsonBuffer[300];
    serializeJson(doc, jsonBuffer);
    
    Serial.print("Publishing message: ");
    Serial.println(jsonBuffer);
    client.publish(topic_telemetry, jsonBuffer);
  }
}
