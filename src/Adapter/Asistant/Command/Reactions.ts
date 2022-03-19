import { isJidGroup, isJidUser } from '@adiwajshing/baileys'
import GraphemeSplitter from 'grapheme-splitter'
import Asistant, { reactionsMessage } from '..'
import { glob2regex } from '../../../Infrastructure/Utils/regex'

Asistant().command.register({
    pattern: glob2regex('.\\s{0,}react*'),
    whoCanUse: ['me'],
    events: ['chat-update'],
    handler: async (context) => {
        let react = context.message.replace(/\.\s{0,}react\s+/, '').trim()
        const key = context.chat.key
        if (isJidGroup(key.remoteJid || '')) {
            key.participant = (
                context.chat.message?.extendedTextMessage?.contextInfo
                    ?.participant ||
                key.participant ||
                key.remoteJid ||
                ''
            ).replace(/:.*@/, '@')
        }

        key.id =
            context.chat.message?.extendedTextMessage?.contextInfo?.stanzaId
        if (context.chat.message?.extendedTextMessage?.contextInfo?.stanzaId)
            key.fromMe = false

        reactionsMessage(key, react)
        if (isJidUser(key.remoteJid || '')) {
            key.participant = Asistant().socket?.user.id
            reactionsMessage(key, react)
        }
    }
})

Asistant().command.register({
    pattern: /.*/,
    fromMe: false,
    whoCanUse: ['group'],
    events: ['chat-update'],
    handler: async (context) => {
        const text = context.message.toLowerCase()

        const splitter = new GraphemeSplitter()
        const patterns: {
            pattern: RegExp
            reactions: string[]
        }[] = [
            {
                pattern:
                    /\bma?ka?si?h\b|\bte?ri?ma?\s{0,}ka?si?h\b|\bma?nta?p\b/i,
                reactions: splitter.splitGraphemes('😁👍')
            },
            {
                pattern: /\boke?\b|\bsip\b/i,
                reactions: splitter.splitGraphemes('👌🍺')
            },
            {
                pattern: /\bse?ma?nga?t\b/i,
                reactions: splitter.splitGraphemes('🔥🥳')
            },
            {
                pattern:
                    /\bko?nto?l\b|\bsarkem\b|\bbajingan\b|\bgo?blo?k\b|\bto?lol\b|\btod\b/i,
                reactions: splitter.splitGraphemes('👺😡😤😠')
            },
            {
                pattern: /\bmumet\b|\bpusing\b|\bca?pek\b/i,
                reactions: splitter.splitGraphemes('🤧🤒')
            }
        ]

        patterns.forEach(({ pattern, reactions }) => {
            if (pattern.test(text)) {
                const random = Math.floor(Math.random() * reactions.length)
                reactionsMessage(context.chat.key, reactions[random])
            }
        })
    }
})
