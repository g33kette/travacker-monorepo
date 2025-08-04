import { UserModelDto } from '@app/services/models'

export class AuthenticateUserResponseDto {
    readonly user: UserModelDto
    readonly accessToken: string
    readonly refreshToken: string
    readonly expiresIn: number
}
