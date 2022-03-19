import fs from 'fs'
import got from 'got/dist/source'
import path from 'path'
import Queue from '../Queue'

export function mkdirIfNotExists(filepath: string) {
    if (!fs.existsSync(filepath)) {
        let dir = path.dirname(filepath)
        fs.mkdirSync(dir, { recursive: true })
    }
}

export const logtele = async (text: string) => {
    return Queue.with('logtele', { concurrency: 1 }).add(() =>
        got.get(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                searchParams: {
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: text
                }
            }
        )
    )
}
