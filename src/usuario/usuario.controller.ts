import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { MakeAdminDto } from './dto/make-admin.dto';
import { LoginDto } from './dto/login.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    
    return this.usuarioService.create(createUsuarioDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usuarioService.login(loginDto);
  }

  @Get()
  async findAll(@Query('fields') fields: string) {
    fields = fields ?? "idUsuario, email, nombre";
    let requestFields = fields.split(',');

    requestFields = requestFields.map(val => val.trim());
    
    const usuarios = await this.usuarioService.findAll();

    // return usuarios;
    return usuarios.map(usuario => {
      let userObj = {};
      for (const field of requestFields) {
        userObj[field] = usuario[field];
      }
      delete userObj['password'];

      return userObj;
    });
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usuarioService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (+id !== updateUsuarioDto.idUsuario) {
      throw new BadRequestException(`Los IDs de usuario no coinciden`);
    }

    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Patch(':id')
  patch(@Param('id') id: number, @Body() adminDto: MakeAdminDto) {
    if (+id !== adminDto.newAdmin) {
      throw new BadRequestException('Los IDs deben coincidir')
    }

    return this.usuarioService.makeAdmin(adminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usuarioService.remove(+id);
  }
}
