import { config } from 'dotenv'
import moment from 'moment'
import path from 'path'
import Asistant from './Adapter/Asistant'
import Mongodb from './Infrastructure/database/Mongodb'
import { logtele } from './Infrastructure/Utils/files'
import { AutoImport } from './Infrastructure/Utils/import'
import { isProducation } from './Infrastructure/Utils/validate'

config()

moment.locale('id')
async function start() {
    Asistant().start()
}

;(async () => {
    // initial load
    await Mongodb.connect()

    let autoImportDir = [
        path.join(__dirname, './Adapter/*/Tasks/**/*(*.ts|*.js)'),
        path.join(__dirname, './Adapter/*/Command/**/*(*.ts|*.js)')
        // './Events/Test.ts'
    ]

    await AutoImport(autoImportDir)
    await start()

    process.on('uncaughtException', function (err) {
        logtele(JSON.stringify(err, undefined, 2))

        if (isProducation()) {
            console.log(err)
            return process.exit(1)
        }
        throw err
    })
})()
