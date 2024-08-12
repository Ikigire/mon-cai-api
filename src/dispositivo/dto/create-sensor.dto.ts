import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateSensorDto {
    
    @IsString()
    @MinLength(1)
    tipo: string;

    @IsString()
    umdd: string;
}