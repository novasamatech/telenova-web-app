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
while read -r file; do
    for VAR in $VARIABLES; do
        VALUE=$(eval echo \$$VAR)
        ESCAPED_VALUE=$(printf '%s\n' "$VALUE" | sed -e 's/[\/&]/\\&/g')
        sed -i "s|BAKED_$VAR|$ESCAPED_VALUE|g" "$file"
    done
done
