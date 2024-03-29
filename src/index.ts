import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import * as path from 'path';
import * as twilio from 'twilio';
import * as bodyParser from 'body-parser';
import * as Sendgrid from '@sendgrid/mail';
import * as superagent from 'superagent';
import { WaveFile } from 'wavefile';
import * as Config from './config.json';
import * as Secret from './secret.json';

const app = express();

const VoiceResponse = twilio.twiml.VoiceResponse;

Sendgrid.setApiKey(Secret.sendGridApiKey);

app.use(bodyParser());
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
    response.sendFile(path.resolve(__dirname, './greeting.wav'));
});

app.post('/', async (request: express.Request, response: express.Response) => {
    try {
        const body = request.body;
        if (!body.RecordingUrl) {
            response.sendStatus(200);
            return;
        }

        console.log(JSON.stringify(request.body));

        const recording = await superagent.get(body.RecordingUrl);

        const wav = new WaveFile();
        wav.fromBase64(recording.body.toString('base64'));

        await Sendgrid.send({
            to: Config.email,
            from: 'voicemail@chrisharrington.me',
            subject: `New Voicemail from ${body.ClientSid || 'Unknown'}`,
            text: 'You have a new voicemail.',
            attachments: [
                {
                    content: recording.body.toString('base64'),
                    filename: 'voicemail.wav',
                    type: 'audio/wav',
                    disposition: 'attachment',
                    contentId: 'voicemail'
                }
            ]
        });

        response.sendStatus(200);
    } catch (e) {
        console.error(e);
        response.status(500).send(e.toString());
    }
});  

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}...`));
