import 'dotenv/config';
import { sendRecording } from './sendRecording';

(async () => {
    const recordingUri = 'https://api.twilio.com/2010-04-01/Accounts/AC0ab5c5ae76cdb1fa06c1583195aa5f2a/Recordings/RE3fed94f999f80a0b230df40822222615',
        clientSid = 'blah';

    await sendRecording(recordingUri, clientSid);
})();