import OPi.GPIO as GPIO
GPIO.setmode(GPIO.BOARD)

relay = 13 # PA0
GPIO.setup(relay, GPIO.OUT)

def set_relay(pin, state):
    if state is True:
        GPIO.output(pin, GPIO.LOW)
    else:
        GPIO.output(pin, GPIO.HIGH)