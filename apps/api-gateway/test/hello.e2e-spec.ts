import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ApiGatewayModule } from '../src/api-gateway.module'
import { Server } from 'http'

describe('HelloController (e2e)', () => {
    let app: INestApplication

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ApiGatewayModule],
        }).compile()

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
})
