import serial
import re
import requests
import time
import json

json_config = open("/home/jeremy/iot-power-meter-device/config.json")
config = json.load(json_config)

# Device-specific settings
url = config['servers'][0]
device_id = config['meterId']
secret = config['secret']

# TODO Connect to mongodb

# Make sure it's the only ttyUSB device attached
arduino_dev=None
arduino=None

for i in range(16):
    try:
        if arduino_dev is not None:
            break
        print(f"trying ttyACM{i}")
        arduino=serial.Serial(f"/dev/ttyACM{i}", 9600)
        arduino_dev=f"/dev/ttyACM{i}"
        print(f"trying {arduino_dev}")
    except Exception as e:
        print(e)
        continue

if not arduino:
    print("Could not connect to a suitable tty device")
    exit()

arduino_buffer=""

print(f"Connected to {arduino_dev}")

# Updates the display on the arduino solution
# TODO Fix this to directly use the LCD with the Orange Pi
def update_display(online, power_cut, sensor_error, reading):
  try:
    write_buffer = ""

    if online is True:
      write_buffer += "1"
    else:
      write_buffer += "0"
    
    write_buffer += ","

    if power_cut is True:
      write_buffer += "1"
    else:
      write_buffer += "0"
    
    write_buffer += ","
    
    if sensor_error is True:
      write_buffer += "1"
    else:
      write_buffer += "0"
    
    write_buffer += ","
    
    write_buffer += reading

    # Write to serial only if buffer is not empty
    if write_buffer != "":
        print(f'Writing {write_buffer} to arduino...')
        write_buffer += "\n"
        arduino.write(write_buffer.encode('utf-8'))
    
  except Exception as e:
    print(f"An exception occured: {e}")

online = True
power_cut = False
sensor_error = False
counter = 0.0

while True:
    try:
      online = not online
      power_cut = not power_cut
      sensor_error = not sensor_error
      counter += 1

      update_display(online, power_cut, sensor_error, f"{counter}")
      print("Sending update")
      time.sleep(1)
    except KeyboardInterrupt:
        raise
    except Exception as e:
        # Handle other exceptions here
        print(f"An exception occurred: {e}")