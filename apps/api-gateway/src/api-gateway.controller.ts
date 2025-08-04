import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'
import { ApiGatewayService } from './api-gateway.service'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { basicValidationPipe } from '@app/utils'

@Controller()
export class ApiGatewayController {
    constructor(private readonly apiGatewayService: ApiGatewayService) {}

    @Get()
    getHello(): string {
        return this.apiGatewayService.getHello()
    }

    @Post()
    @UsePipes(basicValidationPipe())
    setHello(@Body() _data: AuthRequestAuthenticateUserDto): string {
        return this.apiGatewayService.getHello()
    }

    @Post('/login')
    @UsePipes(basicValidationPipe())
    async login(
        @Body() loginData: AuthRequestAuthenticateUserDto,
    ): Promise<AuthResponseAuthenticateUserDto | null> {
        return this.apiGatewayService.authenticateUser(loginData)
    }
}
