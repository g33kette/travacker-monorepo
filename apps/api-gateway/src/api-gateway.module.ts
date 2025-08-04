import { Module } from '@nestjs/common'
import { HelloController } from './controllers/hello.controller'
import { HelloService } from './services/hello.service'
import { AuthController } from './controllers/auth.controller'
import { AuthClientModule } from '@app/services'

@Module({
    imports: [AuthClientModule],
    controllers: [HelloController, AuthController],
    providers: [HelloService],
})
export class ApiGatewayModule {}
