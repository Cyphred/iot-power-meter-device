#include <ArduinoJson.h>
#include <ArduinoJson.hpp>
#include <EmonLib.h>
#include <LiquidCrystal_I2C.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

#define RELAY_PIN 13
#define SCT_PIN A0
#define CURRENT_CAL 40.25 // Calculated and calibrated

const char* ssid = "LA FAMILIA WIFI";
const char* password = "SZMama27";
const char* serverName = "http://jeremyzantua.com:3001/api/meter/ping";
// unsigned long lastPingSuccessTime = 0;
// unsigned long lastPingTime = 0;
// unsigned long pingDelay = 5000; // 
long lastPingSuccessTime = 0;
long lastPingTime = 0;
long pingDelay = 5000; // 

float kwhSinceCutoff = 0;

EnergyMonitor emon1;
float kilos = 0;
int peakPower = 0;
// unsigned long time = 0; // may be 4
// unsigned long previousMillis = 0;
long _time = 0; // may be 4
long previousMillis = 0;
float kWh = 0;
float traiff = 18.36;
float costing = 0;
float msecout = 0;
float samplein = 0;
// unsigned long msecin = 3;
long msecin = 3;
double timein = 0;
double AC_power = 0;
double averageamps_AC = 0;
double ampsecondsin_AC = 0;
double RMSCurrent = 0;
double RMSPower;
bool flag = false;

bool relayOn = false;

void setRelay(bool state) {
  if (state) {
    digitalWrite(RELAY_PIN, LOW);
  } else {
    digitalWrite(RELAY_PIN, HIGH);
  }
  relayOn = state;
}

// Set the LCD address to 0x3F for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

String ampReading;
boolean online = false;
boolean cut = false;
boolean sensorError = false;

void setup() {
  lcd.init();
  lcd.clear();
  lcd.backlight();

  pinMode(RELAY_PIN, OUTPUT);
  setRelay(false);

  emon1.current(SCT_PIN, CURRENT_CAL);
  
  WiFi.begin(ssid, password);

  lcd.setCursor(0, 0);
  lcd.print("Connecting to");
  lcd.setCursor(0, 1);
  lcd.print("WiFi...");

  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Connected!");
  lcd.setCursor(0,1);
  lcd.print(WiFi.localIP());
  
  delay(1000);

  Serial.begin(115200);
}

void loop() {
  if ((millis() - lastPingTime) > pingDelay) {
    if(WiFi.status()== WL_CONNECTED){
      WiFiClient client;
      HTTPClient http;
      
      // Connect to the server IP/domain
      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("Authorization", "1:iotpc");

      String jsonData = "{\"currentNow\":" + String(RMSCurrent) + ",\"sensorError\":false,\"watthourNow\":" + String(kilos) + "}";           

      int httpResponseCode = http.POST(jsonData);
      
      if (httpResponseCode >= 200 && httpResponseCode < 300) {
        online = true;
        lastPingSuccessTime = millis();
      } else {
        online = false;
      }
      
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, http.getString());
      
      kwhSinceCutoff = doc["kwhSinceCutoff"];
      cut = doc["subscriberDisconnect"];
      
      http.end();
    }
    else {
      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("WiFi Disconnected");
    }
    lastPingTime = millis();
  }

  readCurrent();
  Serial.print(kilos); // Sends the watt hours reading via serial
  Serial.print(',');
  Serial.print(RMSCurrent, 2); // Sends the current reading via serial
  Serial.println();

  printScreen();

  // Update relay cut state
  if (cut && relayOn == true) {
    setRelay(false);
  } else if (!cut && relayOn == false) {
    setRelay(true);
  }
}

void printScreen() {
  // Display values on the LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(kwhSinceCutoff);
  lcd.print("KWH");

  lcd.setCursor(0, 1);
  lcd.print(double(RMSCurrent));
  lcd.print("A ");

  if (!online) {
    lcd.setCursor(13, 1);
    lcd.print("O");
  }
  if (cut) {
    lcd.setCursor(14, 1);
    lcd.print("D");
  }
  if (sensorError) {
    lcd.setCursor(15, 1);
    lcd.print("E");
  }
}

void readCurrent() {
  // ########################################################################
  // With this line taken out the conuter is much faster                    #
  RMSCurrent = emon1.calcIrms(1480); // TIME 33 , SECONDS:11 with this in    #
  // With line added TIME 33 , SECONDS:11 with this in                      #
  // with the line RMS current highlighted out TIME 197 , SECONDS:11        #
  // #########################################################################

  // Bit of a hack, gets rid of ghost readings
  if (RMSCurrent < 0.49)
    RMSCurrent = 0;

  RMSPower = 240.0 * RMSCurrent;    // Calculates RMS Power Assuming Voltage
                                    // 220VAC, change to 110VAC accordingly  #
  _time++;                           // increase the time
  msecin = millis();                // use mills
  timein = msecin / 1000;           // devide by 1000 to turn into seconds
  AC_power = AC_power + RMSPower;   // add them together
  averageamps_AC = AC_power / _time; // work out the avergae current draw
  ampsecondsin_AC =
      averageamps_AC * timein;     // work out the average reading with time
  kilos = ampsecondsin_AC / 3600;  // convert into watt hours
  kWh = kilos / 1000.00;           // convert it into kWh hours
  costing = kWh * traiff / 100.00; // Calculate the rough cost to run the heater

  if (timein > 10 & flag == false) {
    /*
    Serial.print("TIME ");
    Serial.print(time);
    Serial.print(" , SECONDS:");
    Serial.println(timein, 0);
    */
    flag = true;
  }
}

/*
void displayDetailed() {
  // Print the data
  lcd.setCursor(0, 0); // Displays all current data
  lcd.print(RMSCurrent);
  lcd.print("A");
  // lcd.setCursor(9, 0);          // Displays all current data
  // lcd.print(Irms);
  lcd.setCursor(0, 1);
  lcd.print(traiff);
  lcd.setCursor(0, 1);
  lcd.print(kilos, 0);
  lcd.print(" WWh   ");
  lcd.setCursor(10, 1);
  lcd.print(RMSPower);
  lcd.print("W ");
  lcd.setCursor(0, 2);
  lcd.print(kWh);
  lcd.print(" kWh");
  lcd.setCursor(9, 2);
  lcd.print(costing, 3);
  lcd.print(" T ");
  lcd.setCursor(0, 3);
  lcd.print(time);
  lcd.setCursor(10, 3);
  lcd.print(timein, 0);

  lcd.print(RMSCurrent);
  lcd.print("A");
  // lcd.setCursor(9, 0);          // Displays all current data
  // lcd.print(Irms);
  lcd.setCursor(0, 1);
  lcd.print(traiff);
  lcd.setCursor(0, 1);
  lcd.print(kilos, 0);
  lcd.print(" WWh   ");
  lcd.setCursor(10, 1);
  lcd.print(RMSPower);
  lcd.print("W ");
  lcd.setCursor(0, 2);
  lcd.print(kWh);
  lcd.print(" kWh");
  lcd.setCursor(9, 2);
  lcd.print(costing, 3);
  lcd.print(" T ");
  lcd.setCursor(0, 3);
  lcd.print(time);
  lcd.setCursor(10, 3);
  lcd.print(timein, 0);
}
*/
