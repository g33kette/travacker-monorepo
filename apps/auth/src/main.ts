import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthModule,
        {
            transport: Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: (process.env.auth_port ?? 3001) as number,
            },
        },
    )

    await app.listen()
    console.log('Auth Microservice is listening on port 3001')
}
void bootstrap()
