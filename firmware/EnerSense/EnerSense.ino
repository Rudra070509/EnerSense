#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "Rudras Iphone";
const char* password = "ieatkids";

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

// PZEM 1 on Serial2 (Pins 16 & 17)
#define PZEM1_RX_PIN 16
#define PZEM1_TX_PIN 17

// PZEM 2 on Serial1 (Pins 18 & 19)
#define PZEM2_RX_PIN 18
#define PZEM2_TX_PIN 19

// --- Objects ---
WiFiClient espClient;
PubSubClient client(espClient);

// Pass address 0xF8 to both!
PZEM004Tv30 pzem1(Serial2, PZEM1_RX_PIN, PZEM1_TX_PIN, 0xF8);
PZEM004Tv30 pzem2(Serial1, PZEM2_RX_PIN, PZEM2_TX_PIN, 0xF8);

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
    Serial.printf("Relay 1 set to %s\n", state);
  } else if (applianceId == 2) {
    digitalWrite(RELAY_2, strcmp(state, "ON") == 0 ? LOW : HIGH);
    Serial.printf("Relay 2 set to %s\n", state);
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

  // Initialize HardwareSerial ports explicitly
  Serial2.begin(9600, SERIAL_8N1, PZEM1_RX_PIN, PZEM1_TX_PIN);
  Serial1.begin(9600, SERIAL_8N1, PZEM2_RX_PIN, PZEM2_TX_PIN);

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
  if (now - lastMsg > 3000) {
    lastMsg = now;

    // --- Read Sensor 1 ---
    float v1 = pzem1.voltage();
    float i1 = pzem1.current();
    float p1 = pzem1.power();
    float e1 = pzem1.energy();

    if (isnan(v1)) {
      v1 = i1 = p1 = e1 = 0.0;
    }

    // --- Read Sensor 2 ---
    float v2 = pzem2.voltage();
    float i2 = pzem2.current();
    float p2 = pzem2.power();
    float e2 = pzem2.energy();

    if (isnan(v2)) {
      v2 = i2 = p2 = e2 = 0.0;
    }

    Serial.printf("S1: %.1fV | %.3fA | %.1fW || S2: %.1fV | %.3fA | %.1fW\n", v1, i1, p1, v2, i2, p2);

    StaticJsonDocument<300> doc;
    
    // Appliance 1 (Smart AC)
    JsonObject app1 = doc.createNestedObject("appliance1");
    app1["voltage"] = v1;
    app1["current"] = i1;
    app1["power"]   = p1;
    app1["energy"]  = e1;

    // Appliance 2 (OLED TV)
    JsonObject app2 = doc.createNestedObject("appliance2");
    app2["voltage"] = v2;
    app2["current"] = i2;
    app2["power"]   = p2;
    app2["energy"]  = e2;

    char jsonBuffer[300];
    serializeJson(doc, jsonBuffer);
    
    client.publish(topic_telemetry, jsonBuffer);
  }
}
