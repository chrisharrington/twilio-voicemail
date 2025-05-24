import Secret from './secret.json';
import TelegramBot from 'node-telegram-bot-api';

export async function sendRecording(recordingUri: string, source: string) {
    console.log('Sending recording...', recordingUri, source);

    const recording = await fetch(`${recordingUri}.wav`);
    console.log('Retrieved recording.');

    const bot = new TelegramBot(Secret.telegramBotToken, { polling: true });
    await bot.sendMessage(Secret.telegramChatId, `New voicemail from ${source || 'Unknown'}: ${recordingUri}`);
    console.log('Sent notification message to Telegram.');

    await bot.sendAudio(Secret.telegramChatId, Buffer.from(await recording.bytes()), {}, {
        contentType: 'audio/wav',
        filename: 'voicemail.wav',
    });
    console.log('Sent voicemail to Telegram.');
}