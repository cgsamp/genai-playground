#!/bin/bash
set -eo pipefail
IFS=$'\n\t'

set -a
source ../.env
set +a

set -x

./mvnw clean package -DskipTests
./mvnw $1 $2 $3 $4
