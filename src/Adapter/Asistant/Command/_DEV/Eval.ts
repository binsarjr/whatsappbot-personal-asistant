import Asistant from '../..'
import { glob2regex } from '../../../../Infrastructure/Utils/regex'

Asistant().command.register({
    pattern: glob2regex('.\\s{0,}eval*'),
    whoCanUse: ['me'],
    events: ['chat-update'],
    handler: async (context) => {
        let raw = context.message.replace(/\.\s{0,}eval\s{1,}/, '').trim()
        eval(raw)
    }
})
