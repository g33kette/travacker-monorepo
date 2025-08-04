import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import {
    AuthenticateUserRequestDto,
    AuthenticateUserResponseDto,
} from '@app/services/dtos'

@Injectable()
export class AuthClientService {
    constructor(@Inject('AUTH') private readonly authClient: ClientProxy) {}

    async createToken(
        loginData: AuthenticateUserRequestDto,
    ): Promise<AuthenticateUserResponseDto | null> {
        return await lastValueFrom(
            this.authClient.send({ cmd: 'auth_create_token' }, loginData),
        )
    }
}
