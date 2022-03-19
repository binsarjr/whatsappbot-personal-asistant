import { scheduleJob } from 'node-schedule'
import Asistant from '..'
import { isProducation } from '../../../Infrastructure/Utils/validate'

if (isProducation()) {
    scheduleJob(
        'clearAllMessage',
        {
            rule: '* */1 * * *',
            tz: 'Asia/Jakarta'
        },
        async () => {
            await Asistant().clear()
        }
    )
}
