import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { AuthClientService } from '@app/auth-client/auth-client.service'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH',
                transport: Transport.TCP,
                options: {
                    host: process.env.AUTH_SERVICE_HOST ?? '0.0.0.0',
                    port: (process.env.AUTH_SERVICE_PORT ?? 3001) as number,
                },
            },
        ]),
    ],
    providers: [AuthClientService],
    exports: [AuthClientService],
})
export class AuthClientModule {}
