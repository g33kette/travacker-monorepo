import { UserModelDto } from '@app/auth-client/models'

export class AuthenticateUserResponseDto {
    readonly user: UserModelDto
    readonly accessToken: string
    readonly refreshToken: string
    readonly expiresIn: number
}
