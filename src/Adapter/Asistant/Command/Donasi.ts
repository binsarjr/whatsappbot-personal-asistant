import { isJidGroup } from '@adiwajshing/baileys'
import Asistant, { reactionsMessage } from '..'

Asistant().command.register({
    pattern: /^\.\s{0,}(donasi|donate)$/is,
    whoCanUse: ['all'],
    events: ['chat-update', 'list-response-message'],
    handler: async function (ctx) {
        reactionsMessage(ctx.chat.key, '🥺')
        let trakteer = 'https://trakteer.id/binsarjr'
        let jid = ctx.chat.key.remoteJid ?? ''
        let mentionsJid: string[] = [jid]

        if (isJidGroup(jid)) {
            let metadata = await Asistant().socket!.groupMetadata(jid)
            for (let participant of metadata.participants) {
                let isAdmin = participant.isAdmin || participant.isSuperAdmin
                if (!isAdmin) mentionsJid.push(participant.id)
            }
        }
        await ctx.replyIt({
            text: `Hai, terimakasih telah menggunakan bot ini, untuk mendukung bot ini kamu dapat membantu dengan berdonasi dengan cara:

${trakteer}

Doakan agar project bot ini bisa terus berkembang
Doakan agar author bot ini dapat ide-ide yang kreatif lagi
Donasi akan digunakan untuk pengembangan dan pengoperasian bot ini.

Terimakasih. -BinsarJr`,
            mentions: mentionsJid
        })
    }
})
