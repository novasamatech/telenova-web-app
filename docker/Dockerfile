FROM node:18-alpine

WORKDIR /app
COPY . .
COPY docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN yarn install
RUN yarn build

CMD ["entrypoint.sh"]
