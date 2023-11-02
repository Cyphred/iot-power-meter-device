# IoT Power Meter Device

This repository is for the code that will run on the Orange Pi One-based power meter.

[The backend and web application can be found here.](https://github.com/Cyphred/iot-power-meter)

## Installation

1. Set up the Orange Pi One with Armbian. [Download Link to image](https://www.armbian.com/orange-pi-one/).
2. Clone this repository to the desired directory.

```
$ git clone https://github.com/Cyphred/iot-power-meter.git
```

3. Create a python virtual environment using `virtualenv`.

```
$ python3 -m venv env
```

4. Activate the virtual environment.

```
$ source env/bin/activate
```

5. Install the dependencies using `pip`.

```
$ pip install -r requirements.txt
```

The main script should be ready to run now. You can choose to run it manually or create a script to launch it on device startup (recommended).
