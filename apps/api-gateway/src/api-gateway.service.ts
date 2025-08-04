import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class ApiGatewayService {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    ) {}

    getHello(): string {
        return 'Hello World!'
    }

    async authenticateUser(
        loginData: AuthRequestAuthenticateUserDto,
    ): Promise<AuthResponseAuthenticateUserDto | null> {
        return await lastValueFrom(
            this.authServiceClient.send(
                { cmd: 'authenticate_user' },
                loginData,
            ),
        )
    }
}
