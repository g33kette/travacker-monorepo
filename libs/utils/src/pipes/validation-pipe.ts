import { ValidationError, ValidationPipe } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe'

export type ValidationErrorData = {
    type: 'ValidationError'
    message: string
    errors: { field: string; message: string }[]
}

export const basicValidationPipe = (override: ValidationPipeOptions = {}) =>
    new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        ...override,
    })
export const microserviceValidationPipe = (
    override: ValidationPipeOptions = {},
) =>
    new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const errorData: ValidationErrorData = {
                type: 'ValidationError',
                message: 'Data validation has failed.',
                errors: errors.map((err: ValidationError) => ({
                    field: err.property,
                    message:
                        Object.values(err.constraints ?? []).join(', ') ?? '',
                })),
            }
            return new RpcException(errorData)
        },
        ...override,
    })
