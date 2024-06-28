FROM node:lts-buster-slim

WORKDIR /app
COPY . .
COPY .docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ARG PUBLIC_APP_VERSION
ENV PUBLIC_APP_VERSION=${PUBLIC_APP_VERSION}

RUN npm ci --no-audit
RUN npm run build

CMD ["entrypoint.sh"]
