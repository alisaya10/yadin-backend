FROM mhart/alpine-node:latest

RUN mkdir /app
RUN mkdir -p /data/db
RUN chown -R `id -un` /data/db
WORKDIR /app

COPY package*.json ./


COPY . .

CMD ["npm","start"]

