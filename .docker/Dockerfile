FROM node:lts-buster-slim

WORKDIR /app
COPY . .
COPY .docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ARG PUBLIC_BOT_API_URL
ARG PUBLIC_BOT_ADDRESS
ARG PUBLIC_WEB_APP_ADDRESS
ARG PUBLIC_WEB_APP_URL
ARG PUBLIC_WIDGET_SECRET
ARG PUBLIC_SECURE_LOCAL_STORAGE_DISABLED_KEYS

RUN npm ci --no-audit
RUN npm run build

CMD ["entrypoint.sh"]
