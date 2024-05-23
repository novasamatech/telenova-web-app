#!/bin/bash
# replace-variables.sh

VARIABLES=$(node -e "console.log(Object.keys(require('./next.config.js').env).join(' '))")

for VAR in $VARIABLES; do
    if [ -z "$(eval echo \$$VAR)" ]; then
        echo "$VAR is not set. Please set it and rerun the script."
        exit 1
    fi
done

find /app/public /app/.next -type f -name "*.js" |
while read file; do
    for VAR in "${VARIABLES[@]}"; do
        sed -i "s|BAKED_$VAR|${!VAR}|g" "$file"
    done
done