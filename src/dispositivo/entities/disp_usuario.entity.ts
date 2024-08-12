import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dispositivo } from "./dispositivo.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";


@Entity()
export class Dispositivo_Usuario {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    @ManyToMany( type => Dispositivo, dispositivo => dispositivo.idDispositivo )
    idDispositivo: string;

    @Column()
    @ManyToMany( type => Usuario, usuario => usuario.idUsuario )
    idUsuario: number;
}