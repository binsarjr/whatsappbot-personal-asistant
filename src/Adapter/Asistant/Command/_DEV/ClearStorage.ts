import Asistant from '../..'

Asistant().command.register({
    pattern: /^\.\s{0,}clear$/is,
    whoCanUse: ['dev'],
    events: ['chat-update'],
    handler: async function (ctx) {
        await Asistant().clear()
        ctx.replyIt({
            text: 'Storage cleared'
        })
    }
})
