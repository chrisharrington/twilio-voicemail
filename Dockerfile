FROM node:8
WORKDIR /usr/src/app
COPY . .

RUN apt-get update && \
    apt-get install yarn git -y

CMD git clone https://github.com/chrisharrington/twilio-voicemail.git && \
    cd twilio-voicemail && \
    yarn run:prod