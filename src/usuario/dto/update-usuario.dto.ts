import { IsString, MinLength, IsEmail, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUsuarioDto {

    @IsNumber()
    idUsuario: number;

    @IsString()
    @MinLength(3)
    nombre: string;
    
    @IsEmail()
    email: string;

    @MinLength(6)
    @IsOptional()
    password: string;
}
