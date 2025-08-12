import {
    Body,
    Controller,
    Get,
    Post,
    UnauthorizedException,
    UsePipes,
} from '@nestjs/common'
import { basicValidationPipe } from '@app/utils'
import {
    AuthClientService,
    AuthenticateUserRequestDto,
    AuthenticateUserResponseDto,
} from '@app/auth-client'

@Controller()
export class AuthController {
    constructor(private readonly authClientService: AuthClientService) {}

    @Get('/auth')
    hello(): Promise<string> {
        return this.authClientService.hello()
    }
    @Post('/auth/login')
    @UsePipes(basicValidationPipe())
    async login(
        @Body() loginData: AuthenticateUserRequestDto,
    ): Promise<AuthenticateUserResponseDto | null> {
        const response = await this.authClientService.createToken(loginData)
        if (!response) {
            throw new UnauthorizedException('Invalid credentials provided.')
        }
        return response
    }
}
