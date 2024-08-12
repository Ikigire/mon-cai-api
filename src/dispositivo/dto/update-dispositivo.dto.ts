import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Sensor } from '../entities/sensor.entity';

export class UpdateDispositivoDto {
    @IsString()
    idDispositivo: string;

    @IsString()
    modelo: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    sensores?: Sensor[];

    @IsString()
    @IsOptional()
    alias?: string;
    
    @IsString()
    @IsOptional()
    ubicacion?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsNumber()
    @IsOptional()
    idUsuario?: number;
}
