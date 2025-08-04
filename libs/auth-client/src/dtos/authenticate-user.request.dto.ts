import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AuthenticateUserRequestDto {
    @IsEmail({}, { message: 'Please enter a valid email address.' })
    @IsNotEmpty({ message: 'Email cannot be empty.' })
    readonly email: string

    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password cannot be empty.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    readonly password: string
}
