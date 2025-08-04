import { Controller, Get } from '@nestjs/common'
import { HelloService } from '../services/hello.service'

@Controller()
export class HelloController {
    constructor(private readonly apiGatewayService: HelloService) {}

    @Get()
    getHello(): string {
        return this.apiGatewayService.getHello()
    }
}
