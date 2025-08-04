import { Controller, UsePipes } from '@nestjs/common'
import { TokenService } from './services/token.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { microserviceValidationPipe } from '@app/utils/pipes/validation-pipe'

@Controller()
export class AuthController {
    constructor(private readonly tokenService: TokenService) {}

    @MessagePattern({ cmd: 'auth_create_token' })
    @UsePipes(microserviceValidationPipe())
    createToken(
        @Payload() data: AuthRequestAuthenticateUserDto,
    ): AuthResponseAuthenticateUserDto | null {
        const user = this.tokenService.validateUser(data.email, data.password)
        if (!user) {
            return null // Or throw a RpcException for error handling
        }

        // Generate JWT and refresh tokens
        const tokens = this.tokenService.generateTokens(user)

        return {
            user: { id: user.id, email: user.email },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
        }
    }
}
