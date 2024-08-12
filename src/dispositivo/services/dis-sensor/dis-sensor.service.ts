import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispositivo_Sensor } from 'src/dispositivo/entities/dip_sensor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DisSensorService {
    constructor(
        @InjectRepository(Dispositivo_Sensor) private disp_sensorRespository: Repository<Dispositivo_Sensor>,
    ) { }

    /**
     * Método que crea la relación entre las tablas de Sensor y Dispositivo
     * @param dip_sensor Objeto que contiene el valor del tipo (Sensor) y idDispositivo (Dispositivo) para crear la relación
     * @returns Promise<Dispositivo_Sensor> que contiene los datos de la relación
     */
    async addSensorToDispositivo(disp_sensor: Dispositivo_Sensor): Promise<Dispositivo_Sensor> {
        try {
            const result = await this.disp_sensorRespository.insert(disp_sensor);
            disp_sensor.id = result.identifiers[0].id;
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No fue posible crear la relación entre el Dispositivo ${disp_sensor.idDispositivo} y el Sensor ${disp_sensor.tipo}`);
        }

        return disp_sensor;
    }

    /**
     * Extrae las relaciones registradas entre un dispositivo y los sensores
     * @param idDispositivo MAC del dispositivo a buscar relaciones con sensores
     * @returns Promise<Dispositivo_Sensor> promesa con la lista de relaciones entre el dispositivo y los sensores
     */
    async findDispositivoSensores(idDispositivo: string): Promise<Dispositivo_Sensor[]> {
        return await this.disp_sensorRespository.findBy({idDispositivo});
    }

    /**
     * Método para eliminar la relación entre un dispositivo y un sensor
     * @param disp_sensor Objeto que contiene la relación entre el dispositivo y el sensor
     * @returns Promise<Dispositivo_Sensor> objeto que representa la relación eliminada
     */
    async removeSensorFromDispositivo(disp_sensor: Dispositivo_Sensor): Promise<Dispositivo_Sensor> {
        disp_sensor.id ?? delete disp_sensor.id;
        const relacion = await this.disp_sensorRespository.findOneBy({...disp_sensor});

        if (!relacion){
            throw new NotFoundException(`No se encontró relación entre el Dispositivo ${disp_sensor.idDispositivo} con el Sensor ${disp_sensor.tipo}`);
        }

        try {
            await this.disp_sensorRespository.delete(relacion);
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No fue posible eliminar la relación entre el Dispositivo ${disp_sensor.idDispositivo} y el Sensor ${disp_sensor.tipo}`)
        }

        return relacion;
    }
}
