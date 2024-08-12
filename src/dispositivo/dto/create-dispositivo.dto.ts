import { IsArray, IsString, ArrayMinSize } from "class-validator";
import { Sensor } from "../entities/sensor.entity";


export class CreateDispositivoDto {
    @IsString()
    idDispositivo: string;

    @IsString()
    modelo: string;

    @IsArray()
    @ArrayMinSize(1)
    sensores: Sensor[]
}
