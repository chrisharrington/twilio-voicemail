FROM node:lts
WORKDIR /usr/src/app
COPY . .

RUN apt-get update && \
    apt-get install yarn git -y

CMD rm -rf twilio-voicemail && \
    git clone https://github.com/chrisharrington/twilio-voicemail.git && \
    cd twilio-voicemail && \
    yarn run:prod