import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ApiGatewayModule } from '../src/api-gateway.module'
import { Server } from 'http'
import { of, throwError } from 'rxjs'
import {
    AuthClientService,
    AuthenticateUserRequestDto,
    AuthenticateUserResponseDto,
} from '@app/services'

describe('AuthController (e2e)', () => {
    let app: INestApplication

    const mockAuthClientService = {
        createToken: jest.fn(),
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ApiGatewayModule],
        })
            .overrideProvider(AuthClientService)
            .useValue(mockAuthClientService)
            .compile()

        app = moduleFixture.createNestApplication({
            logger: false,
        })
        await app.init()
    })

    afterEach(async () => {
        jest.clearAllMocks()
        await app.close()
    })

    describe('/login (POST)', () => {
        const validLoginData: AuthenticateUserRequestDto = {
            email: 'test@example.com',
            password: 'password123',
        }

        const mockAuthResponse: AuthenticateUserResponseDto = {
            user: {
                id: 1,
                email: 'test@example.com',
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh',
            expiresIn: 900,
        }

        it('should return JWT tokens for valid credentials', async () => {
            mockAuthClientService.createToken.mockReturnValue(
                of(mockAuthResponse),
            )

            const response = await request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(201)

            expect(response.body).toEqual(mockAuthResponse)
            expect(mockAuthClientService.createToken).toHaveBeenCalledWith(
                validLoginData,
            )
        })

        it('should handle string user ID', async () => {
            const responseWithStringId: AuthenticateUserResponseDto = {
                user: {
                    id: 'user-uuid-123',
                    email: 'test@example.com',
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
                refreshToken:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh',
                expiresIn: 900,
            }

            mockAuthClientService.createToken.mockReturnValue(
                of(responseWithStringId),
            )

            const response = await request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(201)

            expect(response.body).toEqual(responseWithStringId)
        })

        it('should return 400 for invalid email format', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'validPassword123',
            }

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(invalidData)
                .expect(400)
        })

        it('should return 400 for short password', () => {
            const invalidData = {
                email: 'valid@example.com',
                password: '123',
            }

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(invalidData)
                .expect(400)
        })

        it('should return 400 for missing email', () => {
            const invalidData = {
                password: 'validPassword123',
            }

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(invalidData)
                .expect(400)
        })

        it('should return 400 for missing password', () => {
            const invalidData = {
                email: 'valid@example.com',
            }

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(invalidData)
                .expect(400)
        })

        it('should handle auth-client service errors', async () => {
            const error = new Error(
                'Authentication service unavailable mock error',
            )
            mockAuthClientService.createToken.mockReturnValue(
                throwError(() => error),
            )

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(500)
        })

        it('should handle null response from auth-client service', async () => {
            mockAuthClientService.createToken.mockReturnValue(of(null))

            const response = await request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(201)

            // NestJS converts null responses to empty objects
            expect(response.body).toEqual({})
        })

        it('should accept various email formats', async () => {
            const complexEmail = {
                email: 'user.name+tag@subdomain.example.co.uk',
                password: 'validPassword123',
            }

            mockAuthClientService.createToken.mockReturnValue(
                of(mockAuthResponse),
            )

            await request(app.getHttpServer() as Server)
                .post('/login')
                .send(complexEmail)
                .expect(201)

            expect(mockAuthClientService.createToken).toHaveBeenCalledWith(
                complexEmail,
            )
        })

        it('should not accept extra fields', () => {
            const dataWithExtraFields = {
                email: 'valid@example.com',
                password: 'validPassword123',
                extraField: 'should-be-rejected',
            }

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(dataWithExtraFields)
                .expect(400)
        })
    })
})
