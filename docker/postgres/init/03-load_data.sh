#!/bin/bash

set -e

APP_DATABASE=${APP_DATABASE:-bookstore}

SCRIPT_DIR="$(dirname "$0")"
SUBSCRIPTS_DIR="${SCRIPT_DIR}/subscripts"

echo "Loading data if table empty..."
load_table_data() {
  local table_name="$1"
  local count=$(psql -U "$POSTGRES_USER" -d "$APP_DATABASE" -t -c "SELECT COUNT(*) FROM $table_name;")
  count=$(echo "$count" | tr -d ' ')

  if [ "$count" -gt "0" ]; then
    echo "$table_name already loaded."
  else
    echo "Loading $table_name..."
    psql -U "$POSTGRES_USER" -d "$APP_DATABASE" -f "${SUBSCRIPTS_DIR}/${table_name}.sql"
    echo "$table_name loaded."
  fi
}

load_table_data model
load_table_data model_parameter
load_table_data model_configuration
load_table_data book_rank_source
load_table_data ranked_books

echo "Done!"
