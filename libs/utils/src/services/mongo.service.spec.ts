import { Test, TestingModule } from '@nestjs/testing'
import {
    MongoService,
    MongoServiceConfig,
} from '@app/utils/services/mongo.service'

const mockConfig: MongoServiceConfig = {
    connectionString: 'mongodb://mock-connection-string',
    dbName: 'mock-db-name',
}

describe('MongoService', () => {
    let service: MongoService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: MongoService,
                    useFactory: () => new MongoService(mockConfig),
                },
            ],
        }).compile()

        service = module.get<MongoService>(MongoService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
