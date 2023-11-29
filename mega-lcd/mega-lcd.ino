#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x3F for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.clear();
  lcd.backlight();

  lcd.setCursor(0,0);

  lcd.print("Initializing...");

  Serial.begin(9600);
}

String reading;
boolean cut, online, sensorError;

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n'); // Read a line from Serial monitor

    // Parse the input line
    int comma1 = input.indexOf(',');
    int comma2 = input.indexOf(',', comma1 + 1);
    int comma3 = input.indexOf(',', comma2 + 1);

    if (comma1 != -1 && comma2 != -1 && comma3 != -1) {
      // Extract values from the input line
      int firstValue = input.substring(0, comma1).toInt();
      int secondValue = input.substring(comma1 + 1, comma2).toInt();
      int thirdValue = input.substring(comma2 + 1, comma3).toInt();
      reading = input.substring(comma3 + 1);

      // Set variables based on the parsed values
      online = (firstValue == 1);
      cut = (secondValue == 1);
      sensorError = (thirdValue == 1);
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
  }
}