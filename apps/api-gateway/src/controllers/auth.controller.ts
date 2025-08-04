import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { basicValidationPipe } from '@app/utils'
import { AuthService } from '../services/auth.service'

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    @UsePipes(basicValidationPipe())
    async login(
        @Body() loginData: AuthRequestAuthenticateUserDto,
    ): Promise<AuthResponseAuthenticateUserDto | null> {
        return this.authService.authenticateUser(loginData)
    }
}
