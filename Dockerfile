FROM oven/bun:latest
WORKDIR /usr/src/app
COPY . .

CMD bun install && \
    bun start