import { Logger } from '@nestjs/common'
import * as mongoDB from 'mongodb'
import { Db, MongoClient } from 'mongodb'

export type MongoServiceConfig = {
    connectionString: string
    dbName: string
}

export class MongoService {
    private _db: Db
    private client: MongoClient

    constructor(private readonly config: MongoServiceConfig) {
        this.client = new mongoDB.MongoClient(config.connectionString)
    }

    async db(): Promise<Db> {
        if (!this._db) {
            await this.client.connect()
            Logger.log('🔵 Connected to MongoClient', 'Mongo')
            this._db = this.client.db(this.config.dbName)
            Logger.log(`🔵 Selected ${this.config.dbName} Database`, 'Mongo')
        }
        return this._db
    }

    async close() {
        await this.client.close()
    }
}
