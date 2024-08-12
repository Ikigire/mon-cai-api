import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispositivo_Usuario } from 'src/dispositivo/entities/disp_usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DisUsuarioService {
    constructor(
        @InjectRepository(Dispositivo_Usuario) private disp_usuarioRespository: Repository<Dispositivo_Usuario>
    ) { }

    /**
     * Crea relaciones entre un dispositivo y un usuario
     * @param disp_usuario Objeto que representa la relación ente el Dispositivo y el Usuario
     * @returns Promise<Dispositivo_Usuario> promesa con la información de la relación creada
     */
    async addDIspositivoToUsuario( disp_usuario: Dispositivo_Usuario): Promise<Dispositivo_Usuario> {
        try {
            const result = await this.disp_usuarioRespository.insert(disp_usuario);
            disp_usuario.id = result.identifiers[0].id;
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No fue posible crear la relación entre el Usuario ${disp_usuario.idUsuario} y el Dispositivo ${disp_usuario.idDispositivo}`);
        }

        return disp_usuario;
    }

    /**
     * Obtiene la lista de dispositivos relacionados con un usuario
     * @param idUsuario ID del usuario para realizar la búsqueda
     * @returns Promesa con la lista de relaciones entre un usuario y los Dispositivos
     */
    findDispositivosByUsuario(idUsuario: number): Promise<Dispositivo_Usuario[]> {
        return this.disp_usuarioRespository.findBy({idUsuario});
    }

    /**
     * Extrae la lista de usuarios que han registrado un mismo dispositivo
     * @param idDispositivo MAC del dispositivo a buscar
     * @returns Promesa con la lista de usuarios que han registrado el mismo dispositivo
     */
    findUsuariosByDispositivo(idDispositivo: string): Promise<Dispositivo_Usuario[]> {
        return this.disp_usuarioRespository.findBy({idDispositivo});
    }

    /**
     * Elimina la relación entre un Dispositivo y un Usuario
     * @param disp_usuario Objeto con la información de la relación entre el dispositivo y el usuario
     * @returns Promesa con la relación eliminada
     * @throws NotFoundException en caso de que no se encuenrte la relación, ConclictException en caso de que no sea posible liminar la relación
     */
    async removeDispositivoFromUsuario(disp_usuario: Dispositivo_Usuario): Promise<Dispositivo_Usuario> {
        disp_usuario.id ?? delete disp_usuario.id;
        const relacion = await this.disp_usuarioRespository.findOneBy({...disp_usuario});

        if (!relacion) {
            throw new NotFoundException(`No se encontró relación entre el Dispositivo ${disp_usuario.idUsuario} y el Dispositivo ${disp_usuario.idDispositivo}`);
        }

        try {
            await this.disp_usuarioRespository.delete({...relacion});
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No fue posible eliminar la relación entre el Usuario ${disp_usuario.idUsuario} y el Dispositivo ${disp_usuario.idDispositivo}`)
        }

        return relacion;
    }
}
