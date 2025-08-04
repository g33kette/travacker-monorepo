import { NestFactory } from '@nestjs/core'
import { AuthServiceModule } from './auth-service.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthServiceModule,
        {
            transport: Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: (process.env.auht_service_port ?? 3001) as number,
            },
        },
    )

    await app.listen()
    console.log('Auth Microservice is listening on port 3001')
}
void bootstrap()
