import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Sensor {
    @PrimaryColumn()
    tipo: string;

    @Column()
    umdd: string;
}