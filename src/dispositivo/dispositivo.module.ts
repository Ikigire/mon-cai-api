import { Module } from '@nestjs/common';
import { DispositivoService } from './services/dispositivo/dispositivo.service';
import { DispositivoController } from './controller/dispositivo/dispositivo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispositivo } from './entities/dispositivo.entity';
import { Sensor } from './entities/sensor.entity';
import { Dispositivo_Sensor } from './entities/dip_sensor.entity';
import { Dispositivo_Usuario } from './entities/disp_usuario.entity';
import { SensorController } from './controller/sensor/sensor.controller';
import { SensorService } from './services/sensor/sensor/sensor.service';
import { DisSensorService } from './services/dis-sensor/dis-sensor.service';
import { DisUsuarioService } from './services/dis-usuario/dis-usuario.service';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  controllers: [DispositivoController, SensorController],
  providers: [DispositivoService, SensorService, DisSensorService, DisUsuarioService],
  imports: [
    TypeOrmModule.forFeature([Dispositivo, Sensor, Dispositivo_Sensor, Dispositivo_Usuario]),
    UsuarioModule
  ],
  exports: [TypeOrmModule]
})
export class DispositivoModule {}
