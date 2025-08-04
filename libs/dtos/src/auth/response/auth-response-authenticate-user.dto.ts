import { AuthDataUserDto } from '../data/auth-data-user.dto'

export class AuthResponseAuthenticateUserDto {
    readonly user: AuthDataUserDto
    readonly accessToken: string
    readonly refreshToken: string
    readonly expiresIn: number
}
