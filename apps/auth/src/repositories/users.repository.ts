import { Injectable } from '@nestjs/common'
import { MongoService } from '@app/utils/services/mongo.service'
import { Collection } from 'mongodb'
import User from '../models/user.model'

@Injectable()
export class UsersRepository {
    private _collection: Collection<User>
    constructor(private readonly mongoService: MongoService) {}

    async collection(): Promise<Collection<User>> {
        if (!this._collection) {
            const db = await this.mongoService.db()
            this._collection = db.collection<User>('users')
        }
        return this._collection
    }

    async findByEmail(email: string): Promise<User | null> {
        const collection = await this.collection()
        return await collection.findOne({ email })
    }
}
