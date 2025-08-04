import { Test, TestingModule } from '@nestjs/testing'
import { AuthClientService } from './auth-client.service'
import { ClientProxy } from '@nestjs/microservices'

describe('AuthClientService', () => {
    let service: AuthClientService
    let mockAuthClient: Partial<ClientProxy>

    beforeEach(async () => {
        mockAuthClient = {
            send: jest.fn(),
            connect: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthClientService,
                {
                    provide: 'AUTH',
                    useValue: mockAuthClient,
                },
            ],
        }).compile()

        service = module.get<AuthClientService>(AuthClientService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
