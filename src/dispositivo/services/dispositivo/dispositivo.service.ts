import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDispositivoDto } from '../../dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from '../../dto/update-dispositivo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispositivo } from 'src/dispositivo/entities/dispositivo.entity';
import { DataSource, Repository } from 'typeorm';
import { Dispositivo_Sensor } from 'src/dispositivo/entities/dip_sensor.entity';
import { DisSensorService } from '../dis-sensor/dis-sensor.service';
import { DisUsuarioService } from '../dis-usuario/dis-usuario.service';
import { SensorService } from '../sensor/sensor/sensor.service';
import { DispositivoResponse } from 'src/dispositivo/models/dispositivo-response.model';
import { Sensor } from 'src/dispositivo/entities/sensor.entity';
import { Dispositivo_Usuario } from 'src/dispositivo/entities/disp_usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';

@Injectable()
export class DispositivoService {
  constructor(
    @InjectRepository(Dispositivo) private dispositivoRepository: Repository<Dispositivo>,
    private dataSource: DataSource,
    private readonly disp_sensorService: DisSensorService,
    private readonly disp_usuarioService: DisUsuarioService,
    private readonly sensorService: SensorService,
    private readonly usuarioService: UsuarioService
  ) { }

  /**
   * Permite registrar un nuevo Dispositivo en la base de datos, este nuevo dipositivo no contendrá la información de la ubicación ni el ícono
   * @param createDispositivoDto Objeto que representa el nuevo dispositivo a ser insertado
   * @returns Promise<Dispositivo> promesa con la información del nuevo dispositivo registrado
   */
  async create(createDispositivoDto: CreateDispositivoDto) {
    const { sensores, ...disp } = createDispositivoDto;
    const dispositivo: Dispositivo = {...disp};

    const queryRunner = this.dataSource.createQueryRunner();

    // Iniciando la transacción de la operación
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Almacena la información del dispositivo en la BD
      await queryRunner.manager.insert<Dispositivo>(Dispositivo, dispositivo);

      // Registra la relación entre los sensores y el dispositivo, los sensores deben estár previamente registrados
      for (const sensor of sensores) {
        const relacion: Dispositivo_Sensor = {tipo: sensor.tipo, idDispositivo: dispositivo.idDispositivo};
        await queryRunner.manager.insert<Dispositivo_Sensor>(Dispositivo_Sensor, relacion)
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      const { sqlMessage } = error;

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new ConflictException(sqlMessage ?? `No fue possible creal el Dispositivo ${disp.idDispositivo}`);
    } finally {
      await queryRunner.release();
    }
    
    return createDispositivoDto;
  }

  /**
   * Obtiene la lista de todos los dispositivos registrados en la base de datos
   * @returns Promise<DispositivoResponse[]> Promesa con la lista de los dispositivos registrado, dicha respuesta incluye la información de los sensores vinculados al dispositivo
   */
  async findAll(): Promise<DispositivoResponse[]> {
    const dispositivoList: DispositivoResponse[] = [];
    const dispositivos = await this.dispositivoRepository.find();
    
    for (const dispositivo of dispositivos) {
      // Completando la información del dispositivo y los sensores
      dispositivoList.push(await this.buildDispositivoResponse(dispositivo))
    }
    
    return dispositivoList;
  }

  /**
   * Obtiene la lista de dispositivos asociada con un usuario
   * @param idUsuario ID del usuario a partir del cual se realizará la búsqueda
   * @returns Promise<DispositivoResponse> Promesa con la lista de dispositivos vinculados a un Usuario
   */
  async findDispositivosByIdUsusario(idUsuario: number) {
    let dispositivoList: DispositivoResponse[] = [];
    // Obteniendo la información de los dispositivos relacionados con el usuario
    const relaciones = await this.disp_usuarioService.findDispositivosByUsuario(idUsuario);
    
    try {
      const dispositivos: Dispositivo[] = [];
      
      for (const relacion of relaciones) {
        // Intentando obtener la información del dispositio desde la base de datos, en caso de fallar continua con el siguiente registro
        try {
          dispositivos.push( await this.findOne(relacion.idDispositivo) );
        } catch (error) {}
      }
      
      // Completando la información de los dispositivos
      dispositivoList = await Promise.all( dispositivos.map( dispositivo => this.buildDispositivoResponse(dispositivo) ) );

    } catch (error) {
      throw new ConflictException(error);
    }

    return dispositivoList;
  }

  /**
   * Extrae la información del dispositivo con cierta MAC desde la base de datos
   * @param idDispositivo Dirección MAC del dispositivo a buscar
   * @returns Promise<Dispositivo> promesa con la información del dispositivo
   * @throws NotFoundException en caso de no encontrar la MAC del dispositivo registrada
   */
  async findOne(idDispositivo: string): Promise<Dispositivo> {
    const dispositivo = await this.dispositivoRepository.findOneBy({idDispositivo});

    if (!dispositivo) {
      throw new NotFoundException(`No se encontró Dispositivo con el ID ${idDispositivo}`);
    }

    return dispositivo;
  }

  /**
   * Actualiza un dispositivo, pudiendo modificar la información de los sensores y vinculando el dispositivo con algún usuario
   * @param idDispositivo MAC del dispotivo a actualizar
   * @param updateDispositivoDto Objeto con la información del dispotivo, sensores y usuario a vincular
   * @returns Promesa que contiene el Objeto con el resultado 
   * @throws Conflict Exception, en caso del algun error durante la actualización, NotFound Exception, en caso de que no se encuentre el dispositivo
   */
  async update(idDispositivo: string, updateDispositivoDto: UpdateDispositivoDto) {
    const {sensores,...device} = await this.buildDispositivoResponse(await this.findOne(idDispositivo));

    const { idUsuario, sensores:newSensorList, ...dispositivo } = updateDispositivoDto;
    
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      // Creando la relación entre el dispositivo y algún usuario si este fue incluido en el cuerpo de la petición
      if (idUsuario && idUsuario > 0) {
        // Validando si el usuario existe, esto lanzará una excepción en caso de no existir el usuario
        await this.usuarioService.findOne(idUsuario);

        // Revisando si ya exite alguna relación entre el usuario y el dispositivo
        const relacion = await this.disp_usuarioService.findDispositivosByUsuario(idUsuario);

        // Si la relación no existe entonces se crea
        if (!relacion.map(rel => rel.idUsuario).includes(idUsuario)) {
          await queryRunner.manager.insert<Dispositivo_Usuario>(Dispositivo_Usuario, {idUsuario, idDispositivo});
        }
        
      }

      // Revisando si hay cambio en la lista de sensores del dispositivo
      if (newSensorList) {
        // extrayendo la lista de sensores nuevos
        const sensoresToAdd = newSensorList.filter(sensor => !sensores.map(s => s.tipo).includes(sensor.tipo));

        // Añadiendo los sensores nuevos
        for (const sensor of sensoresToAdd) {
          const { tipo } = sensor;
          await queryRunner.manager.insert<Dispositivo_Sensor>(Dispositivo_Sensor, {tipo, idDispositivo});
        }

        // Revisando si hay algún sensor a remover
        const sensoresToRemove = sensores.filter(sensor => !newSensorList.map(s => s.tipo).includes(sensor.tipo))
        
        // Eliminando los sensores que ya no fueron incluidos en la lista de sensores
        for (const sensor of sensoresToRemove) {
          const { tipo } = sensor;
          await queryRunner.manager.delete<Dispositivo_Sensor>(Dispositivo_Sensor, {idDispositivo, tipo});
        }
      }

      // finalmente se actualiza la información del dipositivo
      await queryRunner.manager.update<Dispositivo>(Dispositivo, {idDispositivo}, dispositivo);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      const { sqlMessage, message } = error;
      throw new ConflictException(sqlMessage ?? message ?? `No fue possible actualizar la información del dispositivo`)
    } finally {
      await queryRunner.commitTransaction();
      await queryRunner.release();
    }

    return (await this.buildDispositivoResponse(dispositivo))
  }

  /**
   * Elimina un dispositivo de la base de datos, eliminando consigo toda relación con sensores y usuario existente
   * @param idDispositivo MAC del dispositivo a eliminar de la base de datos
   * @returns Promise<DispositivoResponse> Promesa con la información del dispositivo eliminado
   * @throws ConflictException en caso de fallar en alguna parte del proceso
   */
  async remove(idDispositivo: string) {
    const dispositivo = await this.findOne(idDispositivo);

    let dispositivoResp: DispositivoResponse;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const disp_usuarioRelaciones = await this.disp_usuarioService.findUsuariosByDispositivo(dispositivo.idDispositivo);

      // Eliminando las relaciones entre los usuarios y el dispositivo
      for (const disp_usu of disp_usuarioRelaciones) {
        await queryRunner.manager.delete<Dispositivo_Usuario>(Dispositivo_Usuario, disp_usu);
      }

      // Eliminando las relaciones entre el dispositivo y los sensores
      dispositivoResp = await this.buildDispositivoResponse(dispositivo);
      for (const sensor of dispositivoResp.sensores) {
        queryRunner.manager.delete<Dispositivo_Sensor>(Dispositivo_Sensor, { idDispositivo: dispositivo.idDispositivo, tipo: sensor.tipo });
      }

      // Al final se elimina la información del dispositivo para evitar incongruencia en la base de datos
      await queryRunner.manager.delete<Dispositivo>(Dispositivo, dispositivo);
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new ConflictException(error);
    } finally {
      await queryRunner.commitTransaction();
      await queryRunner.release();
    }
    return dispositivoResp;
  }

  /**
   * Elimina la relación entre un usuario y el dipositivo
   * @param idDispositivo MAC del dispositivo
   * @param idUsuario ID del usuario al que se le removerá el dispositivo de la lista
   * @returns Promesa con la información del dispositivo eliminado
   */
  async removeDispositivoFromUsusario(idDispositivo: string, idUsuario: number) {
    const dispositivo = await this.findOne(idDispositivo);

    await this.usuarioService.findOne(idUsuario);

    // Revisando si ya exite alguna relación entre el usuario y el dispositivo
    const relacion = await this.disp_usuarioService.findDispositivosByUsuario(idUsuario);

    try {
      if (relacion.map(rel => rel.idUsuario).includes(idUsuario)) {
        console.log("Eliminando la relacióm");
        
        await this.disp_usuarioService.removeDispositivoFromUsuario({idUsuario, idDispositivo});
      }
    } catch (error) {
      const { sqlMessage } = error;
      throw new ConflictException(sqlMessage ?? `No fue posible eliminar la relación entre el Dispositivo ${idDispositivo} y el Usuario ${idUsuario}`);
    }
    // Si la relación no existe entonces se crea

    return await this.buildDispositivoResponse(dispositivo);
  }

  /**
   * Complementa la información del dispositivo agregando la lista de sensores vinculados al mismo
   * @param dispositivo Objeto con la información del dispositivo a complementar
   * @returns Promise<DispositivoResponse> promesa con la información del dispositivo y sus sensores
   */
  async buildDispositivoResponse(dispositivo: Dispositivo): Promise<DispositivoResponse> {
    const relaciones = await this.disp_sensorService.findDispositivoSensores(dispositivo.idDispositivo);

    const sensores: Sensor[] = await Promise.all( relaciones.map((relacion) => {
      return this.sensorService.findOne(relacion.tipo);
    }) )

    return {...dispositivo, sensores}
  }
}
