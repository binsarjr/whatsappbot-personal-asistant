import { isJidGroup, isJidUser } from '@adiwajshing/baileys'
import { readFile } from 'fs/promises'
import GraphemeSplitter from 'grapheme-splitter'
import { join } from 'path'
import Asistant, { reactionsMessage } from '..'

Asistant().command.register({
    pattern: /^\p{Emoji}$/u,
    whoCanUse: ['me'],
    events: ['chat-update'],
    handler: async (context) => {
        const emoji = context.message
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

        reactionsMessage(key, emoji)
        if (isJidUser(key.remoteJid || '')) {
            key.participant = Asistant().socket?.user.id
            reactionsMessage(key, emoji)
        }
    }
})

Asistant().command.register({
    pattern: /.*/,
    fromMe: false,
    events: ['chat-update'],
    handler: async (context) => {
        const text = context.message.toLowerCase()

        const fileReactions = async (filepath: string) => {
            let texts = await readFile(filepath, 'utf8')
            let regexs = texts.split(/\n/).map((text) => `\\b${text}\\b`)
            return new RegExp(regexs.join('|'), 'ig')
        }

        const splitter = new GraphemeSplitter()
        const patterns: {
            pattern: RegExp
            reactions: string[]
        }[] = [
            {
                pattern: await fileReactions(
                    join(
                        __dirname,
                        './../../../../Resources/Reactions/thanks.txt'
                    )
                ),
                reactions: splitter.splitGraphemes('😁👍')
            },
            {
                pattern: await fileReactions(
                    join(
                        __dirname,
                        './../../../../Resources/Reactions/thumbsup.txt'
                    )
                ),
                reactions: splitter.splitGraphemes('👌🍺')
            },
            {
                pattern: await fileReactions(
                    join(
                        __dirname,
                        './../../../../Resources/Reactions/powerup.txt'
                    )
                ),
                reactions: splitter.splitGraphemes('🔥🥳')
            },
            {
                pattern: await fileReactions(
                    join(
                        __dirname,
                        './../../../../Resources/Reactions/badword.txt'
                    )
                ),
                reactions: splitter.splitGraphemes('👺😡😤😠')
            },
            {
                pattern: await fileReactions(
                    join(
                        __dirname,
                        './../../../../Resources/Reactions/sick.txt'
                    )
                ),
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
