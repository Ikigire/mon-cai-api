import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    idUsuario?: number;

    @Column()
    nombre: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;
}
