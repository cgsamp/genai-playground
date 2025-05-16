#!/bin/bash

set -e

POSTGRES_DB=bookstore
SCRIPT_DIR="$(dirname "$0")"
SUBSCRIPTS_DIR="${SCRIPT_DIR}/subscripts"


# Check if database exists
db_exists=$(psql -U "$POSTGRES_USER" -d "postgres" -t -c "
  SELECT 1 FROM pg_database WHERE datname = 'bookstore';
")
db_exists=$(echo "$db_exists" | tr -d ' ')

# Create database if it doesn't exist
if [ -z "$db_exists" ]; then
  echo "Creating database 'bookstore'..."
  psql -U "$POSTGRES_USER" -d "postgres" -c "CREATE DATABASE bookstore;"
else
  echo "Database 'bookstore' already exists."
fi

echo "Creating schema if not exists..."
psql -U "$POSTGRES_USER" -d "bookstore" -f "${SUBSCRIPTS_DIR}/schema.sql"


echo "Loading data if table empty..."
load_table_data() {
  local table_name="$1"
  local count=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM $table_name;")
  count=$(echo "$count" | tr -d ' ')

  if [ "$count" -gt "0" ]; then
    echo "$table_name already loaded."
  else
    echo "Loading $table_name..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "${SUBSCRIPTS_DIR}/${table_name}.sql"
    echo "$table_name loaded."
  fi
}

load_table_data model
load_table_data model_parameter
load_table_data model_configuration
load_table_data book_rank_source
load_table_data ranked_books

echo "Done!"
