import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity()
export class Dispositivo {
    @PrimaryColumn()
    idDispositivo: string;

    @Column()
    modelo: string;

    @Column()
    ubicacion: string;

    @Column()
    icon: string;
}
