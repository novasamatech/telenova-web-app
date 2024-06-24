FROM node:lts-buster-slim

WORKDIR /app
COPY . .
COPY .docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN npm ci --no-audit
RUN npm run build

CMD ["entrypoint.sh"]
