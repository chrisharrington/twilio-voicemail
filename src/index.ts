import express from 'express';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import twilio from 'twilio';
import bodyParser from 'body-parser';
import Config from './config.json';
import { sendRecording } from './sendRecording';
import 'dotenv/config';

const app = express();

const VoiceResponse = twilio.twiml.VoiceResponse;

app.set('trust proxy', 1);
app.use(bodyParser() as any);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: false, legacyHeaders: false }))

app.get('/', (_: express.Request, response: express.Response) => {
    try {
        const vr = new VoiceResponse();
        vr.play({ loop: 1 }, 'https://voicemail.chrisharrington.me/greeting');
        vr.record({ playBeep: true, transcribe: true });
        vr.hangup();

        response.type('text/xml');
        response.end(vr.toString());
    } catch (e) {
        console.error(e);
        response.status(500).send(e);
    }
});

app.get('/greeting', async (_: express.Request, response: express.Response) => {
    response.sendFile(path.resolve(__dirname, '../assets/greeting.wav'));
});

app.post('/', async (request: express.Request, response: express.Response) => {
    try {
        const body = request.body;
        if (!body.RecordingUrl) {
            response.sendStatus(200);
            return;
        }

        await sendRecording(body.RecordingUrl, body.To);

        response.sendStatus(200);
    } catch (e) {
        console.error(e);
        response.status(500).send(e.toString());
    }
});

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}...`));
