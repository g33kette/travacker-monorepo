import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import {
    Transport,
    ClientProxy,
    ClientProxyFactory,
} from '@nestjs/microservices'
import { AuthModule } from '../src/auth.module'
import { lastValueFrom } from 'rxjs'
import { ValidationErrorData } from '@app/utils'
import * as jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken'
import {
    AuthenticateUserRequestDto,
    AuthenticateUserResponseDto,
    UserModelDto,
} from '@app/services'

describe('AuthClientService (e2e)', () => {
    let app: INestApplication
    let client: ClientProxy // Declare a client proxy for sending messages

    const PORT = 3101 // Different port for testing, convention 31XX matching original port

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile()

        // Instead of app.create(), create a microservice instance
        app = moduleFixture.createNestApplication({ logger: false }) // Create the application instance

        // Configure the microservice for testing (MUST MATCH main.ts config but often a different port)
        // const microservice =
        app.connectMicroservice({
            transport: Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: PORT,
            },
        })
        await app.startAllMicroservices() // Start the microservice listener
        await app.listen(0) // Listen on a random port (0) for the main application, effectively not exposing HTTP
        // Or you can omit app.listen() if you only want to test microservice features.
        // Keeping it with port 0 allows other NestJS features to initialize properly.

        // Create a client to connect to the microservice for testing
        client = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: PORT,
            },
        })

        // Ensure the client is connected before tests run
        await client.connect()
    })

    afterEach(async () => {
        await client.close() // Close the client connection
        await app.close() // Close the microservice app
    })

    it('should be defined', () => {
        expect(app).toBeDefined()
        expect(client).toBeDefined()
    })

    describe('auth_create_token', () => {
        it('should return JWT tokens and user data for valid credentials', async () => {
            const loginData: AuthenticateUserRequestDto = {
                email: 'test@example.com',
                password: 'password123',
            }

            // Send the message and await the response
            const result = await lastValueFrom(
                client.send<AuthenticateUserResponseDto>(
                    { cmd: 'auth_create_token' },
                    loginData,
                ),
            )

            // Verify the response structure
            expect(result).toEqual({
                user: {
                    id: 1,
                    email: loginData.email,
                },
                accessToken: expect.any(String) as string,
                refreshToken: expect.any(String) as string,
                expiresIn: 900, // 15 minutes in seconds
            })

            // Verify tokens are not empty
            expect(result.accessToken).toBeTruthy()
            expect(result.refreshToken).toBeTruthy()
            expect(result.accessToken).not.toBe(result.refreshToken)
        })

        it('should generate valid JWT tokens that can be decoded', async () => {
            const loginData: AuthenticateUserRequestDto = {
                email: 'jwt-test@example.com',
                password: 'password123',
            }

            const result = await lastValueFrom(
                client.send<AuthenticateUserResponseDto>(
                    { cmd: 'auth_create_token' },
                    loginData,
                ),
            )

            const jwtSecret =
                process.env.JWT_SECRET || 'your-default-secret-key'

            // Decode access token without verification to check structure
            const decodedAccessToken = jwt.decode(
                result.accessToken,
            ) as JwtPayload
            expect(decodedAccessToken).toEqual({
                username: loginData.email,
                sub: 1,
                exp: expect.any(Number) as number,
                iat: expect.any(Number) as number,
            })

            // Verify access token signature
            const verifiedAccessToken = jwt.verify(
                result.accessToken,
                jwtSecret,
            ) as JwtPayload
            expect(verifiedAccessToken.username).toBe(loginData.email)
            expect(verifiedAccessToken.sub).toBe(1)

            // Decode refresh token
            const decodedRefreshToken = jwt.decode(
                result.refreshToken,
            ) as JwtPayload
            expect(decodedRefreshToken).toEqual({
                username: loginData.email,
                sub: 1,
                exp: expect.any(Number) as number,
                iat: expect.any(Number) as number,
            })

            // Verify refresh token signature
            const verifiedRefreshToken = jwt.verify(
                result.refreshToken,
                jwtSecret,
            ) as JwtPayload
            expect(verifiedRefreshToken.username).toBe(loginData.email)
            expect(verifiedRefreshToken.sub).toBe(1)

            // Verify token expiration times are different
            const accessTokenExp = decodedAccessToken.exp
            const refreshTokenExp = decodedRefreshToken.exp
            expect(accessTokenExp).toBeDefined()
            expect(refreshTokenExp).toBeDefined()
            expect(refreshTokenExp).toBeGreaterThan(accessTokenExp ?? 0)

            // Verify access token expires in approximately 15 minutes (900 seconds)
            expect(decodedAccessToken.iat).toBeDefined()
            const accessTokenDuration =
                (accessTokenExp ?? 0) - (decodedAccessToken.iat ?? 0)
            expect(accessTokenDuration).toBe(900)

            // Verify refresh token expires in approximately 7 days (604800 seconds)
            expect(decodedRefreshToken.iat).toBeDefined()
            const refreshTokenDuration =
                (refreshTokenExp ?? 0) - (decodedRefreshToken.iat ?? 0)
            expect(refreshTokenDuration).toBe(604800)
        })

        it('should handle validation errors in post_hello', async () => {
            const invalidUserData = {
                email: 'not-an-email',
                password: '123', // Too short
            }
            let success: boolean
            try {
                await lastValueFrom(
                    client.send<UserModelDto | null>(
                        { cmd: 'hello_post' },
                        invalidUserData,
                    ),
                )
                success = true
            } catch {
                success = false
            }
            expect(success).toBeFalsy()
        })

        it('should handle validation errors', async () => {
            // Test the ValidationPipe in action within the microservice
            const invalidLoginData = {
                email: 'not-an-email', // Invalid email format
                password: '123', // Too short password
                extraField: 'shouldBeStripped', // Non-whitelisted field
            }

            let error: null | ValidationErrorData = null
            let success: boolean = false
            try {
                await lastValueFrom(
                    client.send<UserModelDto | null>(
                        { cmd: 'auth_create_token' },
                        invalidLoginData,
                    ),
                )
                success = true
            } catch (e: unknown) {
                error = e as ValidationErrorData
            }

            // Check for the error structure thrown by ValidationPipe in microservices (RpcException)
            expect(success).toBeFalsy()
            expect(error).not.toBeNull()
            expect(error?.errors).toEqual(
                expect.arrayContaining([
                    {
                        field: 'extraField',
                        message: 'property extraField should not exist',
                    },
                    {
                        field: 'email',
                        message: 'Please enter a valid email address.',
                    },
                    {
                        field: 'password',
                        message: 'Password must be at least 6 characters long.',
                    },
                ]),
            )
            expect(error?.message).toBe('Data validation has failed.')
        })
    })
})
