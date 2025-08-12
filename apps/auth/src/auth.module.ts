import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { TokenService } from './services/token.service'
import { MongoService } from '@app/utils/services/mongo.service'
import { UsersRepository } from './repositories/users.repository'

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-default-secret-key',
            signOptions: { expiresIn: '15m' }, // Access token expires in 15 minutes
        }),
    ],
    controllers: [AuthController],
    providers: [
        TokenService,
        UsersRepository,
        {
            provide: MongoService,
            useFactory: (): MongoService =>
                new MongoService({
                    connectionString:
                        process.env.MONGO_CONNECTION_STRING ||
                        'mongodb://root:password@mongodb:27017',
                    dbName: process.env.AUTH_DB_NAME || 'auth',
                }),
        },
    ],
})
export class AuthModule {}
