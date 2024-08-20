import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('administrador')
export class Administrador2 {
    @PrimaryGeneratedColumn()
    idAdministrador: number;

    @Column()
    nombre: string;

    @Column()
    email: string;

    @Column()
    password: string;
}