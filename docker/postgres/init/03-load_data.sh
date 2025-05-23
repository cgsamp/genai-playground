#!/bin/bash

set -euo pipefail

APP_DATABASE=${APP_DATABASE:-playground}

SCRIPT_DIR="$(dirname "$0")"
SUBSCRIPTS_DIR="${SCRIPT_DIR}/subscripts"

echo "Loading initial data."

load_data_script() {
    local script_name="$1"
    echo "Loading $script_name..."
    psql -U "$POSTGRES_USER" -d "$APP_DATABASE" -f "${SUBSCRIPTS_DIR}/${script_name}.sql"
    echo "$script_name loaded."
}

load_data_script model
load_data_script model_parameter
load_data_script model_configuration
load_data_script items_test_data

echo "Done!"
