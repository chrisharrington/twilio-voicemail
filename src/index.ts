import * as express from 'express';
import * as twilio from 'twilio';
import * as bodyParser from 'body-parser';
import * as Sendgrid from '@sendgrid/mail';

import * as Config from './config.json';
import * as Secret from './secret.json';

const app = express();

const VoiceResponse = twilio.twiml.VoiceResponse;

enum RecordingStatus {
    Completed = 'completed'
}

app.use(bodyParser());

app.get('/', (request: express.Request, response: express.Response) => {
    try {
        const voiceResponse = new VoiceResponse();
        //voiceResponse.say(`You've reached Chris Harrington. Please leave your name and number and I'll get back to you as soon as I can. Record your message after the tone and hang up when you're done. Thanks.`);
        voiceResponse.say('Go.');
        voiceResponse.record({
            playBeep: true,
            recordingStatusCallback: `${Config.url}:${Config.port}`
        });

        response.writeHead(200, { 'Content-Type': 'text/xml' });
        response.end(voiceResponse.toString());
    } catch (e) {
        console.error(e);
        response.status(500).send(e);
    }
});

app.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const body = req.body;
        console.log(body);
        if (!body.RecordingUrl) {
            res.sendStatus(200);
            return;
        }

        Sendgrid.setApiKey(Secret.sendGridApiKey);
        await Sendgrid.send({
            to: Config.email,
            from: Config.email,
            subject: 'New Voicemail',
            html: `<a href="${body.RecordingUrl}">${body.RecordingUrl}</a>`
        });

        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.status(500).send(e.toString());
    }
});  

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}...`));