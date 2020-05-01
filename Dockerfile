FROM node:8
WORKDIR /usr/src/app
COPY . .
RUN apt-get update
RUN apt-get install yarn git -y
RUN git clone https://github.com/chrisharrington/twilio-voicemail.git
RUN cd twilio-voicemail
CMD yarn run:prod