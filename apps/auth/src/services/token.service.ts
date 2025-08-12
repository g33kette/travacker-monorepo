import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersRepository } from '../repositories/users.repository'
import User from '../models/user.model'

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersRepository: UsersRepository,
    ) {}

    async validateUser(email: string, _password: string): Promise<User | null> {
        return this.usersRepository.findByEmail(email)
    }

    generateTokens(user: User) {
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
