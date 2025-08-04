import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { AuthServiceService } from './auth-service.service'
import { AuthDataUserDto } from '@app/dtos'

describe('AuthServiceService', () => {
    let service: AuthServiceService

    // Mock JWT service
    const mockJwtService = {
        sign: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthServiceService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile()

        service = module.get<AuthServiceService>(AuthServiceService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('getHello', () => {
        it('should return "Hello World!"', () => {
            expect(service.getHello()).toBe('Hello World!')
        })
    })

    describe('validateUser', () => {
        it('should return user data for any email and password', () => {
            const email = 'test@example.com'
            const password = 'password123'

            const result = service.validateUser(email, password)

            expect(result).toEqual({
                id: 1,
                email: email,
            })
        })

        it('should log the validation attempt', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
            const email = 'test@example.com'
            const password = 'password123'

            service.validateUser(email, password)

            expect(consoleSpy).toHaveBeenCalledWith(
                'validateUser',
                email,
                password,
            )
            consoleSpy.mockRestore()
        })
    })

    describe('generateTokens', () => {
        const mockUser: AuthDataUserDto = {
            id: 'user123',
            email: 'test@example.com',
        }

        beforeEach(() => {
            // Reset and setup JWT service mocks
            mockJwtService.sign
                .mockReturnValueOnce('mock-access-token') // First call for access token
                .mockReturnValueOnce('mock-refresh-token') // Second call for refresh token
        })

        it('should generate access and refresh tokens', () => {
            const result = service.generateTokens(mockUser)

            expect(result).toEqual({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900, // 15 minutes in seconds
            })
        })

        it('should call JWT service with correct payload for access token', () => {
            service.generateTokens(mockUser)

            const expectedPayload = {
                username: mockUser.email,
                sub: mockUser.id,
            }

            expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload)
        })

        it('should call JWT service with correct payload and expiration for refresh token', () => {
            service.generateTokens(mockUser)

            const expectedPayload = {
                username: mockUser.email,
                sub: mockUser.id,
            }

            expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload, {
                expiresIn: '7d',
            })
        })

        it('should call JWT service twice (once for each token)', () => {
            service.generateTokens(mockUser)

            expect(mockJwtService.sign).toHaveBeenCalledTimes(2)
        })

        it('should work with numeric user ID', () => {
            const userWithNumericId: AuthDataUserDto = {
                id: 123,
                email: 'numeric@example.com',
            }

            const result = service.generateTokens(userWithNumericId)

            expect(result).toEqual({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            })

            const expectedPayload = {
                username: userWithNumericId.email,
                sub: userWithNumericId.id,
            }

            expect(mockJwtService.sign).toHaveBeenCalledWith(expectedPayload)
        })
    })
})
