import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('ubi_dispositivo')
export class Ubicacion_Dispositivo {
    @PrimaryGeneratedColumn()
    idUbicacion: number;

    @Column()
    ubicacion: string;

    @Column()
    ubi_especifica: string;

    @Column()
    idDispositivo: string;
}