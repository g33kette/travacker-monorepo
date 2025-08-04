import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { basicValidationPipe } from '@app/utils'
import {
    AuthClientService,
    AuthenticateUserRequestDto,
    AuthenticateUserResponseDto,
} from '@app/services'

@Controller()
export class AuthController {
    constructor(private readonly authClientService: AuthClientService) {}

    @Post('/login')
    @UsePipes(basicValidationPipe())
    login(
        @Body() loginData: AuthenticateUserRequestDto,
    ): Promise<AuthenticateUserResponseDto | null> {
        return this.authClientService.createToken(loginData)
    }
}
