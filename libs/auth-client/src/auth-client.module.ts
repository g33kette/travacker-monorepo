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
                    host: '127.0.0.1',
                    port: 3001,
                },
            },
        ]),
    ],
    providers: [AuthClientService],
    exports: [AuthClientService],
})
export class AuthClientModule {}
