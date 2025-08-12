import { ObjectId } from 'mongodb'

export class UserModelDto {
    readonly id: ObjectId
    readonly email: string
}
