import { NestFactory } from '@nestjs/core'
import { ApiGatewayModule } from './api-gateway.module'
import { Logger } from '@nestjs/common'

async function bootstrap() {
    const port: number = process.env.API_GATEWAY_PORT
        ? parseInt(process.env.API_GATEWAY_PORT)
        : 3000

    const app = await NestFactory.create(ApiGatewayModule)

    await app.listen(port)
    Logger.log(`🚀 API Gateway is listening on HTTP: ${port}`, 'Bootstrap')
}

void bootstrap()
