import { proto } from '@adiwajshing/baileys'
import pino from 'pino'
import Queue from '../../Infrastructure/Queue'
import WABOT from '../../Infrastructure/WABOT'

let Asistant: WABOT | null = null
const bot = (): WABOT => {
    if (Asistant) return Asistant
    Asistant = new WABOT({
        name: process.env.BOTNAME!,
        config: {
            browser: ['Asisten', 'Desktop', '1.5'],
            printQRInTerminal: true,
            // @ts-ignore
            logger: pino({
                level: 'debug',
                levelVal: 100,
                enabled: false
            })
        }
    })
    return Asistant
}

export const reactionsMessage = async (
    key: proto.IMessageKey,
    emoji: string
) => {
    key.participant = (key.participant || '').replace(/:.*@/, '@')
    const participant = key.participant || key.remoteJid || ''
    await Queue.with('reactions').add(async () =>
        bot().socket?.relayMessage(
            key.remoteJid || '',
            {
                reactionMessage: {
                    key: key,
                    senderTimestampMs: Math.round(new Date().getTime() / 1000),
                    text: emoji
                }
            },
            {
                messageId: key.id || '',
                participant
            }
        )
    )
}

export const reactionSuccess = (chat: proto.IWebMessageInfo) =>
    reactionsMessage(chat.key, '✅')
export const reactionFailed = (chat: proto.IWebMessageInfo) =>
    reactionsMessage(chat.key, '❌')
export const reactionWaiting = (chat: proto.IWebMessageInfo) =>
    reactionsMessage(chat.key, '⏳')
export default bot
