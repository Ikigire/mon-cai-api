import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSensorDto } from 'src/dispositivo/dto/create-sensor.dto';
import { Sensor } from 'src/dispositivo/entities/sensor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SensorService {
    constructor(
        @InjectRepository(Sensor) private sensorRepository: Repository<Sensor>
    ) { }

    async create(sensorData: CreateSensorDto) {
        try {
          await this.sensorRepository.insert(sensorData);  
        } catch (error){
            const { sqlMessage } = error
            throw new ConflictException(sqlMessage ?? 'No fue possible crear el Sensor');
        }
        return sensorData;
    }

    findAll() {
        return this.sensorRepository.find();
    }

    async findOne(tipo: string) {
        const sensor = await this.sensorRepository.findOneBy({tipo});
        
        if (!sensor){
            throw new NotFoundException(`Sensor de tipo ${tipo} no encontrado`);
        }

        return sensor;
    }

    async update(tipo: string, updateSensorDto: CreateSensorDto) {
        const sensor = await this.sensorRepository.findOneBy({tipo});

        if (!sensor){
            throw new NotFoundException(`No se encontró Sensor del tipo ${tipo}`);
        }

        try {
            await this.sensorRepository.update({tipo},  updateSensorDto);
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No se pudo actualizar el Sensor de tipo ${tipo}`);
        }

        return updateSensorDto;
    }

    async remove(tipo: string) {
        const sensor = await this.sensorRepository.findBy({ tipo });

        if (!sensor){
            throw new NotFoundException(`No existe Sensor de tipo ${tipo}`);
        }

        try {
            await this.sensorRepository.delete({tipo});
        } catch (error) {
            const { sqlMessage } = error;
            throw new ConflictException(sqlMessage ?? `No fue posible elimiar el Sensor de tipo ${tipo}`);
        }

        return sensor;
    }
}
