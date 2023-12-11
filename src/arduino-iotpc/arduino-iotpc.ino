#include <EmonLib.h>
#include <LiquidCrystal_I2C.h>

#define RELAY_PIN A1
#define SCT_PIN A0
#define CURRENT_CAL 58.633 // Calculated and calibrated

EnergyMonitor emon1;
float kilos = 0;
int peakPower = 0;
unsigned long time = 0; //may be 4
unsigned long previousMillis = 0;
float kWh = 0;
float traiff  = 18.36;
float costing = 0;
float msecout = 0;
float samplein = 0;
unsigned long msecin = 3;
double timein = 0;
double AC_power = 0;
double averageamps_AC = 0;
double ampsecondsin_AC = 0;
double RMSCurrent = 0;
double RMSPower;
bool flag = false;

// Set the LCD address to 0x3F for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.clear();
  lcd.backlight();
  
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  emon1.current(SCT_PIN, CURRENT_CAL);

  lcd.setCursor(0,0);
  //lcd.print("Initializing...");
  
  Serial.begin(9600);
}

String reading;
boolean online = false;
boolean cut = false;
boolean sensorError = false;
boolean waitingForPi = true;

void loop() {
  /*
  if (Serial.available() > 0) {
    if (waitingForPi) waitingForPi = false;

    String input = Serial.readStringUntil('\n'); // Read a line from Serial monitor

    // Parse the input line
    int comma1 = input.indexOf(',');

    if (comma1 != -1 && comma2 != -1) {
      // Extract values from the input line
      int firstValue = input.substring(0, comma1).toInt();
      int secondValue = input.substring(comma1 + 1, comma2).toInt();

      // Set variables based on the parsed values
      online = (firstValue == 1);
      cut = (secondValue == 1);
    }

    // Display values on the LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(reading);
    lcd.print(" KWH");

    lcd.setCursor(0, 1);
    if (!online) lcd.print("OFF ");
    if (cut) lcd.print("DISC ");
    if (sensorError) lcd.print("ERR ");
    */
    
    readCurrent();

    // Print the data
  lcd.setCursor(0, 0);          // Displays all current data
  lcd.print(RMSCurrent);
  lcd.print("A");
  //lcd.setCursor(9, 0);          // Displays all current data
  //lcd.print(Irms);
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
  lcd.print(timein, 0);;

  lcd.print(RMSCurrent);
  lcd.print("A");
  //lcd.setCursor(9, 0);          // Displays all current data
  //lcd.print(Irms);
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
  lcd.print(timein, 0);;
  }


void readCurrent() {
  // ########################################################################
  // With this line taken out the conuter is much faster                    #
  RMSCurrent = emon1.calcIrms(1480);// TIME 33 , SECONDS:11 with this in    #
  // With line added TIME 33 , SECONDS:11 with this in                      #
  // with the line RMS current highlighted out TIME 197 , SECONDS:11        #
  //#########################################################################
  RMSPower = 240.0 * RMSCurrent;    //Calculates RMS Power Assuming Voltage 220VAC, change to 110VAC accordingly  #
  time ++;// increase the time
  msecin = millis();// use mills
  timein = msecin / 1000;// devide by 1000 to turn into seconds
  AC_power = AC_power + RMSPower; // add them together
  averageamps_AC = AC_power / time;//work out the avergae current draw
  ampsecondsin_AC = averageamps_AC * timein; //work out the average reading with time
  kilos  = ampsecondsin_AC / 3600;// convert into watt hours
  kWh = kilos / 1000.00; // convert it into kWh hours
  costing =  kWh * traiff / 100.00;// Calculate the rough cost to run the heater

  if (timein > 10 & flag == false)
  {

    Serial.print("TIME ");
    Serial.print(time);
    Serial.print(" , SECONDS:");
    Serial.println(timein, 0);
    flag = true;
  }
}