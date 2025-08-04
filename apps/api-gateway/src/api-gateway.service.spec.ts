import { Test, TestingModule } from '@nestjs/testing'
import { ApiGatewayService } from './api-gateway.service'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { of, throwError } from 'rxjs'

describe('ApiGatewayService', () => {
    let service: ApiGatewayService

    // Mock ClientProxy
    const mockAuthServiceClient = {
        send: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApiGatewayService,
                {
                    provide: 'AUTH_SERVICE',
                    useValue: mockAuthServiceClient,
                },
            ],
        }).compile()

        service = module.get<ApiGatewayService>(ApiGatewayService)
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

    describe('authenticateUser', () => {
        const mockLoginData: AuthRequestAuthenticateUserDto = {
            email: 'test@example.com',
            password: 'password123',
        }

        const mockAuthResponse: AuthResponseAuthenticateUserDto = {
            user: {
                id: 1,
                email: 'test@example.com',
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 900,
        }

        it('should call auth service with correct parameters', async () => {
            mockAuthServiceClient.send.mockReturnValue(of(mockAuthResponse))

            const result = await service.authenticateUser(mockLoginData)

            expect(mockAuthServiceClient.send).toHaveBeenCalledWith(
                { cmd: 'authenticate_user' },
                mockLoginData,
            )
            expect(result).toEqual(mockAuthResponse)
        })

        it('should return authentication response from auth service', async () => {
            mockAuthServiceClient.send.mockReturnValue(of(mockAuthResponse))

            const result = await service.authenticateUser(mockLoginData)

            expect(result).toEqual({
                user: {
                    id: 1,
                    email: 'test@example.com',
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            })
        })

        it('should handle different user ID types', async () => {
            const responseWithStringId: AuthResponseAuthenticateUserDto = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            }

            mockAuthServiceClient.send.mockReturnValue(of(responseWithStringId))

            const result = await service.authenticateUser(mockLoginData)

            expect(result).toEqual(responseWithStringId)
        })

        it('should handle authentication errors from auth service', async () => {
            const error = new Error('Authentication failed')

            mockAuthServiceClient.send.mockImplementation(() =>
                throwError(() => error),
            )

            await expect(
                service.authenticateUser(mockLoginData),
            ).rejects.toThrow('Authentication failed')
        })

        it('should handle null response from auth service', async () => {
            mockAuthServiceClient.send.mockReturnValue(of(null))

            const result = await service.authenticateUser(mockLoginData)

            expect(result).toBeNull()
        })

        it('should pass through various login data formats', async () => {
            const differentLoginData: AuthRequestAuthenticateUserDto = {
                email: 'different@test.com',
                password: 'differentPassword456',
            }

            mockAuthServiceClient.send.mockReturnValue(of(mockAuthResponse))

            await service.authenticateUser(differentLoginData)

            expect(mockAuthServiceClient.send).toHaveBeenCalledWith(
                { cmd: 'authenticate_user' },
                differentLoginData,
            )
        })
    })
})
