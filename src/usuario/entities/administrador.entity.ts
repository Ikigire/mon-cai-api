import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Usuario } from "./usuario.entity";


@Entity()
export class Administrador {
    @PrimaryGeneratedColumn()
    idAdministrador?: number;

    @Column()
    @OneToOne(type => Usuario, usuario => usuario.idUsuario )
    idUsuario: number
}