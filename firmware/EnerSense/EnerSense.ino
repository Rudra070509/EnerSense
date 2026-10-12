#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "OPPOF31";
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

// Dedicated Hardware Serial2 (Default ESP32 pins)
#define PZEM_RX2_PIN 16
#define PZEM_TX2_PIN 17

// --- Objects ---
WiFiClient espClient;
PubSubClient client(espClient);

// PZEM connected to Serial2 using its verified address 0xF8!
PZEM004Tv30 pzem(Serial2, PZEM_RX2_PIN, PZEM_TX2_PIN, 0xF8);

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

    // Read live data from the verified PZEM on 0xF8
    float voltage = pzem.voltage();
    float current = pzem.current();
    float power   = pzem.power();
    float energy  = pzem.energy();

    bool hasError = false;
    
    if (isnan(voltage)) {
      Serial.println("Error reading PZEM");
      voltage = current = power = energy = 0.0;
      hasError = true;
    } else {
      Serial.printf("⚡ LIVE: Voltage=%.1fV | Current=%.3fA | Power=%.1fW | Energy=%.3fkWh\n", voltage, current, power, energy);
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
    
    // Map to appliance1 (Smart AC)
    JsonObject app1 = doc.createNestedObject("appliance1");
    app1["voltage"] = voltage;
    app1["current"] = current;
    app1["power"]   = power;
    app1["energy"]  = energy;

    // Mirror to appliance2 for complete dashboard display
    JsonObject app2 = doc.createNestedObject("appliance2");
    app2["voltage"] = voltage;
    app2["current"] = current;
    app2["power"]   = power;
    app2["energy"]  = energy;

    char jsonBuffer[300];
    serializeJson(doc, jsonBuffer);
    
    Serial.print("Publishing to Dashboard: ");
    Serial.println(jsonBuffer);
    client.publish(topic_telemetry, jsonBuffer);
    
    if (!hasError) {
      digitalWrite(LED_PIN, LOW);
      delay(50);
      digitalWrite(LED_PIN, HIGH);
    }
  }
}
