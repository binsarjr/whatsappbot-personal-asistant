import { Collection, CollectionOptions, MongoClient } from 'mongodb'
import Logger from '../Logger'

export class Mongodb {
    static instance: Mongodb
    static getInstance() {
        if (!Mongodb.instance) {
            Mongodb.instance = new Mongodb()
        }
        return Mongodb.instance
    }

    reInstance() {
        Mongodb.instance = new Mongodb()
    }

    client: MongoClient
    constructor() {
        this.client = new MongoClient('mongodb://127.0.0.1/bot_absen_amikom', {
            keepAlive: true,
            noDelay: true,
            maxPoolSize: 10,
            minPoolSize: 5
        })
    }

    async connect() {
        Logger().debug('connecting to mongodb', 'Database')
        await this.client.connect()
        Logger().info('mongodb connected', 'Database')
    }
    async close() {
        await this.client.close()
    }

    async insertOrUpdate<T extends any[], P = keyof {}>(
        tableName: string,
        data: T,
        ...onDuplicateKeyUpdate: P[]
    ) {
        await Promise.all(
            data.map(async (item: any) => {
                const collection = this.client.db().collection(tableName)
                let filter: any = {}
                onDuplicateKeyUpdate.forEach((key) => {
                    filter[key] = item[key]
                })

                await collection.updateOne(
                    filter,
                    { $set: item },
                    { upsert: true }
                )
            })
        )
    }

    /**
     * Returns a reference to a MongoDB Collection. If it does not exist it will be created implicitly.
     *
     * @param name - the collection name we wish to access.
     * @returns return the new Collection instance
     */
    collection<TSchema = Document>(
        name: string,
        options?: CollectionOptions
    ): Collection<TSchema> {
        return this.client.db().collection<TSchema>(name, options)
    }
}

export default Mongodb.getInstance()
