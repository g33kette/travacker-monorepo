import { Test, TestingModule } from '@nestjs/testing'
import { ApiGatewayController } from './api-gateway.controller'
import { ApiGatewayService } from './api-gateway.service'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'

describe('ApiGatewayController', () => {
    let apiGatewayController: ApiGatewayController

    // Mock ApiGatewayService
    const mockApiGatewayService = {
        getHello: jest.fn(() => 'Hello World!'),
        authenticateUser: jest.fn(),
    }

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ApiGatewayController],
            providers: [
                {
                    provide: ApiGatewayService,
                    useValue: mockApiGatewayService,
                },
            ],
        }).compile()

        apiGatewayController =
            app.get<ApiGatewayController>(ApiGatewayController)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(apiGatewayController).toBeDefined()
    })

    describe('getHello (GET /)', () => {
        it('should return "Hello World!"', () => {
            const result = apiGatewayController.getHello()

            expect(mockApiGatewayService.getHello).toHaveBeenCalled()
            expect(result).toBe('Hello World!')
        })
    })

    describe('setHello (POST /)', () => {
        it('should return "Hello World!" and call service', () => {
            const mockData: AuthRequestAuthenticateUserDto = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = apiGatewayController.setHello(mockData)

            expect(mockApiGatewayService.getHello).toHaveBeenCalled()
            expect(result).toBe('Hello World!')
        })
    })

    describe('login (POST /login)', () => {
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

        it('should call authenticateUser service and return response', async () => {
            mockApiGatewayService.authenticateUser.mockResolvedValue(
                mockAuthResponse,
            )

            const result = await apiGatewayController.login(mockLoginData)

            expect(mockApiGatewayService.authenticateUser).toHaveBeenCalledWith(
                mockLoginData,
            )
            expect(result).toEqual(mockAuthResponse)
        })

        it('should handle different email formats', async () => {
            const differentLoginData: AuthRequestAuthenticateUserDto = {
                email: 'user.name+tag@example.co.uk',
                password: 'complexPassword123!',
            }

            mockApiGatewayService.authenticateUser.mockResolvedValue(
                mockAuthResponse,
            )

            const result = await apiGatewayController.login(differentLoginData)

            expect(mockApiGatewayService.authenticateUser).toHaveBeenCalledWith(
                differentLoginData,
            )
            expect(result).toEqual(mockAuthResponse)
        })

        it('should handle string user ID in response', async () => {
            const responseWithStringId: AuthResponseAuthenticateUserDto = {
                user: {
                    id: 'user-uuid-123',
                    email: 'test@example.com',
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresIn: 900,
            }

            mockApiGatewayService.authenticateUser.mockResolvedValue(
                responseWithStringId,
            )

            const result = await apiGatewayController.login(mockLoginData)

            expect(result).toEqual(responseWithStringId)
        })

        it('should propagate authentication errors', async () => {
            const error = new Error('Authentication failed')
            mockApiGatewayService.authenticateUser.mockRejectedValue(error)

            await expect(
                apiGatewayController.login(mockLoginData),
            ).rejects.toThrow('Authentication failed')
        })

        it('should handle null response from service', async () => {
            mockApiGatewayService.authenticateUser.mockResolvedValue(null)

            const result = await apiGatewayController.login(mockLoginData)

            expect(result).toBeNull()
        })

        it('should call service once per request', async () => {
            mockApiGatewayService.authenticateUser.mockResolvedValue(
                mockAuthResponse,
            )

            await apiGatewayController.login(mockLoginData)

            expect(
                mockApiGatewayService.authenticateUser,
            ).toHaveBeenCalledTimes(1)
        })
    })
})
