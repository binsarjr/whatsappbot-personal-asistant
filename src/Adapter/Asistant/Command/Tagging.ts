import Asistant from '..'
import { getMessage, getMessageCaption } from '../../../Infrastructure/Message'

Asistant().command.register({
    pattern: /^\.\s{0,}tagmember\s{0,}(.*)/is,
    whoCanUse: ['group'],
    events: ['chat-update'],
    handler: async function (ctx) {
        const { chat } = ctx
        let body = getMessageCaption(chat) || ''

        let id = chat.key.remoteJid ?? ''
        let mentionsJid: string[] = [id]
        let metadata = await Asistant().socket!.groupMetadata(id)
        for (let participant of metadata.participants) {
            let isAdmin = participant.isAdmin || participant.isSuperAdmin
            if (!isAdmin) mentionsJid.push(participant.id)
        }

        let quoted =
            Asistant().store.messages[chat.key.remoteJid || ''].get(
                getMessage(chat)?.extendedTextMessage?.contextInfo?.stanzaId!
            ) || chat

        await ctx.reply(
            {
                text:
                    body.replace(/^\.\s{0,}tagmember\s{0,}/is, '') ||
                    'Halo semuanya',
                mentions: mentionsJid
            },
            { quoted }
        )
    }
})

Asistant().command.register({
    pattern: /^\.\s{0,}tagadmin\s{0,}(.*)/is,
    whoCanUse: ['group'],
    events: ['chat-update'],
    handler: async function (ctx) {
        const { chat } = ctx
        let body = getMessageCaption(chat) || ''

        let id = chat.key.remoteJid ?? ''
        let mentionsJid: string[] = [id]
        let metadata = await Asistant().socket!.groupMetadata(id)
        for (let participant of metadata.participants) {
            let isAdmin = participant.isAdmin || participant.isSuperAdmin
            if (isAdmin) mentionsJid.push(participant.id)
        }
        let quoted =
            Asistant().store.messages[chat.key.remoteJid || ''].get(
                getMessage(chat)?.extendedTextMessage?.contextInfo?.stanzaId!
            ) || chat
        await ctx.replyIt(
            {
                text:
                    body.replace(/^\.\s{0,}tagadmin\s{0,}/is, '') ||
                    'Halo semuanya',
                mentions: mentionsJid
            },
            { quoted }
        )
    }
})

Asistant().command.register({
    pattern: /^\.\s{0,}tagall\s{0,}(.*)/is,
    whoCanUse: ['group'],
    events: ['chat-update'],
    handler: async function (ctx) {
        const { chat } = ctx
        let body = getMessageCaption(chat) || ''

        let id = chat.key.remoteJid ?? ''
        let mentionsJid: string[] = [id]
        let metadata = await Asistant().socket!.groupMetadata(id)
        for (let participant of metadata.participants) {
            mentionsJid.push(participant.id)
        }
        let quoted =
            Asistant().store.messages[chat.key.remoteJid || ''].get(
                getMessage(chat)?.extendedTextMessage?.contextInfo?.stanzaId!
            ) || chat
        await ctx.replyIt(
            {
                text:
                    body.replace(/^\.\s{0,}tagall\s{0,}/is, '') ||
                    'Halo semuanya',
                mentions: mentionsJid
            },
            { quoted }
        )
    }
})
