import spidev
import time

spi = spidev.SpiDev()
spi.open(0,0)

def readSpi():
    adc = spi.xfer2([1,8<<4,0])
    data = ((adc[1] & 3) << 8) + adc[2]
    return data

def toCurrent(digital_reading):
    try:
        min_value = 515
        # If the reading is too low, assume no consumption
        if (digital_reading <= min_value): return 0

        # Each amp corresponds to this much increment in the digital reading
        one_amp = 3.1111
        offset = digital_reading - min_value
        current = offset / one_amp

        return current

    except ZeroDivisionError:
        return 0  # Handle division by zero

def setup():
    # Do nothing
    print("Testing MCP 3008")

def main():
    print("starting main")
    while True:
        spi_reading = readSpi()
        current = toCurrent(spi_reading)
        print(f"DOUT: {spi_reading}, CURRENT: {current}A {current * 230}W, ")
        time.sleep(.25)

if __name__ == '__main__':

    try:
        setup()
        main()
    except KeyboardInterrupt:
        pass
    finally:
        print("Exiting...")
        exit()