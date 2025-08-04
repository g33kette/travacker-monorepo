import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { TokenService } from './services/token.service'

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-default-secret-key',
            signOptions: { expiresIn: '15m' }, // Access token expires in 15 minutes
        }),
    ],
    controllers: [AuthController],
    providers: [TokenService],
})
export class AuthModule {}
