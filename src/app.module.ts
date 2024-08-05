import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';
import { DispositivoModule } from './dispositivo/dispositivo.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario/entities/usuario.entity';
import { Administrador } from './usuario/entities/administrador.entity';
import { Dispositivo } from './dispositivo/entities/dispositivo.entity';
import { Sensor } from './dispositivo/entities/sensor.entity';
import { Dispositivo_Sensor } from './dispositivo/entities/dip_sensor.entity';
import { Dispositivo_Usuario } from './dispositivo/entities/disp_usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DBNAME,
      entities: [Usuario, Administrador, Dispositivo, Sensor, Dispositivo_Sensor, Dispositivo_Usuario],
      synchronize: true,
    }),
    UsuarioModule,
    DispositivoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
