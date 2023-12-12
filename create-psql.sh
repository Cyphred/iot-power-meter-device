#!/bin/bash

# PostgreSQL database name and user
DB_NAME="iotpc_db"
DB_USER="iotpc"
DB_PASSWORD="iotpc"

# PostgreSQL superuser name
SUPERUSER="postgres"

# PostgreSQL command-line executable
PSQL="sudo -u $SUPERUSER psql"

# Create the database
$PSQL -c "CREATE DATABASE $DB_NAME;"

# Create the user with superuser access
$PSQL -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' SUPERUSER;"

echo "Database and user created successfully."
