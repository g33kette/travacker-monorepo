import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthServiceController } from './auth-service.controller'
import { AuthServiceService } from './auth-service.service'

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-default-secret-key',
            signOptions: { expiresIn: '15m' }, // Access token expires in 15 minutes
        }),
    ],
    controllers: [AuthServiceController],
    providers: [AuthServiceService],
})
export class AuthServiceModule {}
