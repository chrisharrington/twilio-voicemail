FROM node:lts
WORKDIR /usr/src/app
COPY . .

CMD rm -rf twilio-voicemail && \
    git clone https://github.com/chrisharrington/twilio-voicemail.git && \
    cd twilio-voicemail && \
    npm run:prod