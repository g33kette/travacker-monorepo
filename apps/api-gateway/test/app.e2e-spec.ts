import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ApiGatewayModule } from '../src/api-gateway.module'
import { Server } from 'http'
import {
    AuthRequestAuthenticateUserDto,
    AuthResponseAuthenticateUserDto,
} from '@app/dtos'
import { of, throwError } from 'rxjs'

describe('ApiGatewayController (e2e)', () => {
    let app: INestApplication

    // Mock AUTH_SERVICE client
    const mockAuthServiceClient = {
        send: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ApiGatewayModule],
        })
            .overrideProvider('AUTH_SERVICE')
            .useValue(mockAuthServiceClient)
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

    describe('/ (GET)', () => {
        it('should return Hello World', () => {
            return request(app.getHttpServer() as Server)
                .get('/')
                .expect(200)
                .expect('Hello World!')
        })
    })

    describe('/ (POST)', () => {
        it('should return Hello World for valid data', () => {
            const validUserData: AuthRequestAuthenticateUserDto = {
                email: 'valid@example.com',
                password: 'validPassword123',
            }

            return request(app.getHttpServer() as Server)
                .post('/')
                .send(validUserData)
                .expect(201)
                .expect('Hello World!')
        })

        it('should return 400 for invalid email', () => {
            const invalidUserData = {
                email: 'not-an-email',
                password: 'validPassword123',
            }

            return request(app.getHttpServer() as Server)
                .post('/')
                .send(invalidUserData)
                .expect(400)
        })

        it('should return 400 for short password', () => {
            const invalidUserData = {
                email: 'valid@example.com',
                password: '123', // Too short
            }

            return request(app.getHttpServer() as Server)
                .post('/')
                .send(invalidUserData)
                .expect(400)
        })

        it('should return 400 for missing fields', () => {
            const incompleteData = {
                email: 'valid@example.com',
                // missing password
            }

            return request(app.getHttpServer() as Server)
                .post('/')
                .send(incompleteData)
                .expect(400)
        })
    })

    describe('/login (POST)', () => {
        const validLoginData: AuthRequestAuthenticateUserDto = {
            email: 'test@example.com',
            password: 'password123',
        }

        const mockAuthResponse: AuthResponseAuthenticateUserDto = {
            user: {
                id: 1,
                email: 'test@example.com',
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh',
            expiresIn: 900,
        }

        it('should return JWT tokens for valid credentials', async () => {
            mockAuthServiceClient.send.mockReturnValue(of(mockAuthResponse))

            const response = await request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(201)

            expect(response.body).toEqual(mockAuthResponse)
            expect(mockAuthServiceClient.send).toHaveBeenCalledWith(
                { cmd: 'authenticate_user' },
                validLoginData,
            )
        })

        it('should handle string user ID', async () => {
            const responseWithStringId: AuthResponseAuthenticateUserDto = {
                user: {
                    id: 'user-uuid-123',
                    email: 'test@example.com',
                },
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token',
                refreshToken:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh',
                expiresIn: 900,
            }

            mockAuthServiceClient.send.mockReturnValue(of(responseWithStringId))

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

        it('should handle auth service errors', async () => {
            const error = new Error(
                'Authentication service unavailable mock error',
            )
            mockAuthServiceClient.send.mockReturnValue(throwError(() => error))

            return request(app.getHttpServer() as Server)
                .post('/login')
                .send(validLoginData)
                .expect(500)
        })

        it('should handle null response from auth service', async () => {
            mockAuthServiceClient.send.mockReturnValue(of(null))

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

            mockAuthServiceClient.send.mockReturnValue(of(mockAuthResponse))

            await request(app.getHttpServer() as Server)
                .post('/login')
                .send(complexEmail)
                .expect(201)

            expect(mockAuthServiceClient.send).toHaveBeenCalledWith(
                { cmd: 'authenticate_user' },
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
