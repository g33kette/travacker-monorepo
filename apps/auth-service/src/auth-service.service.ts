import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthDataUserDto } from '@app/dtos'

@Injectable()
export class AuthServiceService {
    constructor(private readonly jwtService: JwtService) {}

    getHello(): string {
        return 'Hello World!'
    }

    validateUser(email: string, password: string): AuthDataUserDto {
        console.log('validateUser', email, password)
        return { id: 1, email }
    }

    generateTokens(user: AuthDataUserDto) {
        const payload = { username: user.email, sub: user.id }
        const accessToken = this.jwtService.sign(payload)
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d', // Refresh token expires in 7 days
        })
        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        }
    }
}
