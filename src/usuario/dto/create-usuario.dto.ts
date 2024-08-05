import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUsuarioDto {
    
    @IsString()
    @MinLength(3)
    nombre: string;
    
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    @IsBoolean()
    isAdmin: boolean = false;
}
