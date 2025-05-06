#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

set -a
source ../.env
set +a

set -x

./mvnw clean compile $1
