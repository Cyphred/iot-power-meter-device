import serial
import time
import redis

### DEVICE-SPECIFIC SETTINGS
# Change this to the api's url
url = 'http://192.168.1.10:8000/api' 
# Change this if using multiple meters
device_id = '1'
# Change this to something more secure
secret = 'iotpc'

# Initialize connection with redis server
redis_host="localhost"
redis_port=6379
print(f"Connecting to redis server at {redis_host}:{redis_port}")
redis_server = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
print("Connected to redis!")

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
def update_display(reading):
  load_connected = redis_server.get("LOAD_CONNECTED")
  server_online = redis_server.get("SERVER_ONLINE")
  sensor_error = redis_server.get("SENSOR_ERROR")
  
  try:
    write_buffer = ""

    if server_online == "1":
      write_buffer += "1"
    else:
      write_buffer += "0"
    
    write_buffer += ","

    if load_connected == "1":
      write_buffer += "1"
    else:
      write_buffer += "0"
    
    write_buffer += ","
    
    if sensor_error == "1":
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

# Send initial values
time.sleep(5)
update_display("0.0")

while True:
    try:
      # Read from serial
      line = arduino.readline().decode("utf-8")
      
      # Strip the line of newline characters
      stripped = line.rstrip("\r\n")
      print(stripped)

      # Split the data
      relay_on, watt_hours, amps = map(float, stripped.split(','))
      
      payload = {
        "timestamp": timestamp,
        "wattage": watt_hours
      }
      
      # Save to redis
      timestamp = int(time.time())
      redis_server.set(f"consumption:{timestamp}", f"{payload}")
    
      try:
        kwh_reading = float(redis_server.get("KWH_READING"))
        update_display(kwh_reading)
      except Exception as e:
        update_display("0.0")

      time.sleep(1)
    except KeyboardInterrupt:
        raise
    except Exception as e:
        # Handle other exceptions here
        print(f"An exception occurred: {e}")