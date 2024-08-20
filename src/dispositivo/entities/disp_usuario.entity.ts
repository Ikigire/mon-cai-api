import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Dispositivo } from "./dispositivo.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";


@Entity('disp_usuario')
export class Dispositivo_Usuario {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    @OneToMany( type => Dispositivo, dispositivo => dispositivo.idDispositivo )
    idDispositivo: string;

    @Column()
    @OneToMany( type => Usuario, usuario => usuario.idUsuario )
    idUsuario: number;
}