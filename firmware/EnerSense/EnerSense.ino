#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "Galaxy12";
const char* password = "12345678";

// MQTT Broker
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// MQTT Topics
const char* topic_telemetry = "enersense/telemetry";
const char* topic_commands = "enersense/commands";

// --- Hardware Pins ---
#define RELAY_1 26
#define RELAY_2 27
#define LED_PIN 2

// PZEM 1 Pins
#define PZEM1_RX_PIN 16
#define PZEM1_TX_PIN 17

// PZEM 2 Pins
#define PZEM2_RX_PIN 18
#define PZEM2_TX_PIN 19

// --- Objects ---
WiFiClient espClient;
PubSubClient client(espClient);

// Initialize BOTH PZEM sensors on SEPARATE Hardware Serial Ports!
// PZEM 1 uses Serial2 (Pins 16, 17)
PZEM004Tv30 pzem1(Serial2, PZEM1_RX_PIN, PZEM1_TX_PIN);

// PZEM 2 uses Serial1 (Pins 18, 19)
PZEM004Tv30 pzem2(Serial1, PZEM2_RX_PIN, PZEM2_TX_PIN);

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); 
    delay(200);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  digitalWrite(LED_PIN, LOW);
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  digitalWrite(LED_PIN, LOW);
  delay(100);
  digitalWrite(LED_PIN, HIGH);

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
    digitalWrite(RELAY_1, strcmp(state, "ON") == 0 ? LOW : HIGH);
  } else if (applianceId == 2) {
    digitalWrite(RELAY_2, strcmp(state, "ON") == 0 ? LOW : HIGH);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "EnerSense-ESP32-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(topic_commands);
      digitalWrite(LED_PIN, HIGH);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      
      for(int i = 0; i < 5; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(500);
        digitalWrite(LED_PIN, LOW);
        delay(500);
      }
    }
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  digitalWrite(RELAY_1, HIGH); 
  digitalWrite(RELAY_2, HIGH); 
  digitalWrite(LED_PIN, LOW);

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
  if (now - lastMsg > 5000) {
    lastMsg = now;

    float voltage1 = pzem1.voltage();
    float current1 = pzem1.current();
    float power1 = pzem1.power();
    float energy1 = pzem1.energy();

    float voltage2 = pzem2.voltage();
    float current2 = pzem2.current();
    float power2 = pzem2.power();
    float energy2 = pzem2.energy();

    bool hasError = false;
    
    if(isnan(voltage1)) {
        Serial.println("Error reading PZEM 1");
        voltage1 = current1 = power1 = energy1 = 0.0;
        hasError = true;
    }
    
    if(isnan(voltage2)) {
        Serial.println("Error reading PZEM 2");
        voltage2 = current2 = power2 = energy2 = 0.0;
        hasError = true;
    }

    if (hasError) {
      for(int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, LOW);
        delay(100);
        digitalWrite(LED_PIN, HIGH);
        delay(100);
      }
    }

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
    
    if (!hasError) {
      digitalWrite(LED_PIN, LOW);
      delay(50);
      digitalWrite(LED_PIN, HIGH);
    }
  }
}
