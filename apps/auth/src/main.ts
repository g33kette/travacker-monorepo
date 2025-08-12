import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Logger } from '@nestjs/common'

async function bootstrap() {
    const port: number = process.env.AUTH_SERVICE_PORT
        ? parseInt(process.env.AUTH_SERVICE_PORT)
        : 3001
    const host: string = process.env.AUTH_SERVICE_HOST || '0.0.0.0'
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthModule,
        {
            transport: Transport.TCP,
            options: { host, port },
        },
    )

    await app.listen()
    Logger.log(
        `🚀 Auth Microservice is listening on: ${host}:${port}`,
        'Bootstrap',
    )
}
void bootstrap()
