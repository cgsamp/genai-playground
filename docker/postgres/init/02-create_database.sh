#!/bin/bash

set -euo pipefail

APP_DATABASE=${APP_DATABASE:-playground}
POSTGRES_APP_USER=${POSTGRES_APP_USER:-genai}
POSTGRES_APP_PASSWORD=${POSTGRES_APP_PASSWORD:-genai}

SCRIPT_DIR="$(dirname "$0")"
SUBSCRIPTS_DIR="${SCRIPT_DIR}/subscripts"

echo "Checking for database '$APP_DATABASE'..."

db_exists=$(psql -U "$POSTGRES_USER" -d "postgres" -t -c "SELECT 1 FROM pg_database WHERE datname = '$APP_DATABASE';")
db_exists=$(echo "$db_exists" | tr -d ' ')

# Check if the variable has content
if [ -n "$db_exists" ]; then
  echo "Database '$APP_DATABASE' already exists."
else
  echo "Creating database '$APP_DATABASE'..."
  psql -U "$POSTGRES_USER" -d "postgres" -c "CREATE DATABASE \"$APP_DATABASE\";"

  # Check if user already exists before creating
  user_exists=$(psql -U "$POSTGRES_USER" -d "postgres" -t -c "SELECT 1 FROM pg_roles WHERE rolname = '$POSTGRES_APP_USER';")
  user_exists=$(echo "$user_exists" | tr -d ' ')

  if [ -n "$user_exists" ]; then
    echo "User '$POSTGRES_APP_USER' already exists."
  else
    echo "Creating user '$POSTGRES_APP_USER'..."
    psql -U "$POSTGRES_USER" -d "postgres" -c "CREATE USER \"$POSTGRES_APP_USER\" WITH PASSWORD '$POSTGRES_APP_PASSWORD';"
  fi

  echo "Creating schema..."
  psql -U "$POSTGRES_USER" -d "$APP_DATABASE" -f "${SUBSCRIPTS_DIR}/schema.sql"

  echo "Granting privileges to '$POSTGRES_APP_USER'..."
  psql -U "$POSTGRES_USER" -d "postgres" -c "GRANT ALL PRIVILEGES ON DATABASE \"$APP_DATABASE\" TO \"$POSTGRES_APP_USER\";"

  psql -U "$POSTGRES_USER" -d "$APP_DATABASE" -c "
    GRANT ALL PRIVILEGES ON SCHEMA public TO \"$POSTGRES_APP_USER\";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO \"$POSTGRES_APP_USER\";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO \"$POSTGRES_APP_USER\";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO \"$POSTGRES_APP_USER\";
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"$POSTGRES_APP_USER\";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"$POSTGRES_APP_USER\";
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO \"$POSTGRES_APP_USER\";
  "
  echo "Database initialization complete!"
fi
