import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class AuthService {
    constructor(@Inject('AUTH') private readonly authClient: ClientProxy) {}

    async authenticateUser(
        loginData: AuthRequestAuthenticateUserDto,
    ): Promise<AuthResponseAuthenticateUserDto | null> {
        return await lastValueFrom(
            this.authClient.send({ cmd: 'auth_create_token' }, loginData),
        )
    }
}
