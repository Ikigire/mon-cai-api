import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dispositivo } from "./dispositivo.entity";
import { Sensor } from "./sensor.entity";

@Entity()
export class Dispositivo_Sensor {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    @OneToMany(type => Dispositivo, dispositivo => dispositivo.idDispositivo)
    idDispositivo: string;

    @Column()
    @OneToMany(type => Sensor, sensor => sensor.tipo)
    tipo: string;
}