import { Test, TestingModule } from '@nestjs/testing'
import { AuthServiceController } from './auth-service.controller'
import { AuthServiceService } from './auth-service.service'
import {
    AuthRequestAuthenticateUserDto,
    AuthDataUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos' // Import your DTOs

describe('AuthServiceController', () => {
    let authServiceController: AuthServiceController
    // let authServiceService: AuthServiceService

    // Mock implementation for AuthServiceService
    const mockAuthServiceService = {
        getHello: jest.fn(() => 'Hello from Auth Service!'),
        validateUser: jest.fn(
            (email: string, _password: string): AuthDataUserDto | null => ({
                id: 1,
                email,
            }),
        ),
        generateTokens: jest.fn((_user: AuthDataUserDto) => ({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 900,
        })),
    }

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AuthServiceController],
            providers: [
                {
                    provide: AuthServiceService,
                    useValue: mockAuthServiceService,
                },
            ],
        }).compile()

        authServiceController = app.get<AuthServiceController>(
            AuthServiceController,
        )
        // authServiceService = app.get<AuthServiceService>(AuthServiceService)
    })

    afterEach(() => {
        jest.clearAllMocks() // Clear mocks after each test to prevent pollution
    })

    it('should be defined', () => {
        expect(authServiceController).toBeDefined()
    })

    describe('getHello', () => {
        it('should return "Hello from Auth Service!"', () => {
            expect(authServiceController.getHello()).toBe(
                'Hello from Auth Service!',
            )
            expect(mockAuthServiceService.getHello).toHaveBeenCalled() // Verify service method was called
        })
    })

    describe('authenticateUser', () => {
        it('should return JWT tokens and user data for successful authentication', () => {
            const mockLoginDto: AuthRequestAuthenticateUserDto = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = authServiceController.authenticateUser(mockLoginDto)

            // Verify user validation was called
            expect(mockAuthServiceService.validateUser).toHaveBeenCalledWith(
                mockLoginDto.email,
                mockLoginDto.password,
            )

            // Verify token generation was called with correct user data
            expect(mockAuthServiceService.generateTokens).toHaveBeenCalledWith({
                id: 1,
                email: mockLoginDto.email,
            })

            // Verify the response structure
            const expectedResponse: AuthResponseAuthenticateUserDto = {
                user: {
                    id: 1,
                    email: mockLoginDto.email,
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            }

            expect(result).toEqual(expectedResponse)
        })

        it('should return null if user validation fails', () => {
            const mockLoginDto: AuthRequestAuthenticateUserDto = {
                email: 'invalid@example.com',
                password: 'wrongpassword',
            }

            // Mock validateUser to return null (invalid credentials)
            mockAuthServiceService.validateUser.mockReturnValueOnce(null)

            const result = authServiceController.authenticateUser(mockLoginDto)

            expect(mockAuthServiceService.validateUser).toHaveBeenCalledWith(
                mockLoginDto.email,
                mockLoginDto.password,
            )
            expect(mockAuthServiceService.generateTokens).not.toHaveBeenCalled()
            expect(result).toBeNull()
        })

        it('should handle different user ID types', () => {
            const mockLoginDto: AuthRequestAuthenticateUserDto = {
                email: 'string-id@example.com',
                password: 'password123',
            }

            // Mock validateUser to return string ID
            mockAuthServiceService.validateUser.mockReturnValueOnce({
                id: 'user-123',
                email: mockLoginDto.email,
            })

            const result = authServiceController.authenticateUser(mockLoginDto)

            expect(mockAuthServiceService.generateTokens).toHaveBeenCalledWith({
                id: 'user-123',
                email: mockLoginDto.email,
            })

            expect(result).toEqual({
                user: {
                    id: 'user-123',
                    email: mockLoginDto.email,
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            })
        })
    })
})
