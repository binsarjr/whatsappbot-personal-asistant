import { proto } from '@adiwajshing/baileys'
import got from 'got/dist/source'

export const TEMPLATE_BUTTONS: proto.IHydratedTemplateButton[] = [
    {
        index: 1,
        urlButton: {
            displayText: 'Telegram',
            url: 'https://t.me/wabot_amikom'
        }
    },
    {
        index: 2,
        urlButton: {
            displayText: 'Trakteer',
            url: 'https://trakteer.id/binsarjr'
        }
    }
]

export const FORWARDED_MANY_TIMES: proto.IContextInfo = {
    forwardingScore: 9999,
    isForwarded: true
}

export const LOGO_CONTEXTINFO = async (): Promise<proto.IContextInfo> => {
    return {
        externalAdReply: {
            title: 'Amikom BOT',
            body: 'Author: Binsar Dwi Jasuma',
            thumbnail: await got
                .get(
                    'https://raw.githubusercontent.com/binsarjr/config-files/main/sources/Asset%2064x.png'
                )
                .buffer(),
            mediaType: 3,
            sourceUrl: 'https://t.me/wabot_amikom'
        }
    }
}
