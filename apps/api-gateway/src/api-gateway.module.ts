import { Module } from '@nestjs/common'
import { HelloController } from './controllers/hello.controller'
import { HelloService } from './services/hello.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH',
                transport: Transport.TCP,
                options: {
                    host: '127.0.0.1',
                    port: (process.env.auth_port ?? 3001) as number,
                },
            },
        ]),
    ],
    controllers: [HelloController, AuthController],
    providers: [HelloService, AuthService],
})
export class ApiGatewayModule {}
