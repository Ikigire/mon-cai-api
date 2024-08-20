import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Administrador } from './entities/administrador.entity';
import { Administrador2 } from './entities/administrador2.entity';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Usuario, Administrador, Administrador2])
  ],
  exports: [
    TypeOrmModule,
    UsuarioService
  ]
})
export class UsuarioModule {}
