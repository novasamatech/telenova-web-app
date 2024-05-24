#!/bin/sh

set -e

sh scripts/replace-variable.sh

if echo "$DOCKER_TAGS" | grep -q "dev"; then
  echo "Running in development mode"
  exec yarn dev
else
  echo "Running in production mode"
  exec yarn start
fi
