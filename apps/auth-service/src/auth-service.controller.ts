import { Controller, UsePipes } from '@nestjs/common'
import { AuthServiceService } from './auth-service.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { microserviceValidationPipe } from '@app/utils/pipes/validation-pipe'

@Controller()
export class AuthServiceController {
    constructor(private readonly authServiceService: AuthServiceService) {}

    @MessagePattern({ cmd: 'hello' })
    getHello(): string {
        return this.authServiceService.getHello()
    }

    @MessagePattern({ cmd: 'hello_post' })
    @UsePipes(microserviceValidationPipe())
    setHello(@Payload() _data: AuthRequestAuthenticateUserDto): string {
        return this.authServiceService.getHello()
    }

    @MessagePattern({ cmd: 'authenticate_user' })
    @UsePipes(microserviceValidationPipe())
    authenticateUser(
        @Payload() data: AuthRequestAuthenticateUserDto,
    ): AuthResponseAuthenticateUserDto | null {
        const user = this.authServiceService.validateUser(
            data.email,
            data.password,
        )
        if (!user) {
            return null // Or throw a RpcException for error handling
        }

        // Generate JWT and refresh tokens
        const tokens = this.authServiceService.generateTokens(user)

        return {
            user: { id: user.id, email: user.email },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
        }
    }
}
