import { PartialType } from "@nestjs/mapped-types";
import { Dispositivo } from "../entities/dispositivo.entity";
import { Sensor } from "../entities/sensor.entity";

export class DispositivoResponse extends PartialType(Dispositivo) {
    sensores: Sensor[];
}