import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { DispositivoService } from '../../services/dispositivo/dispositivo.service';
import { CreateDispositivoDto } from '../../dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from '../../dto/update-dispositivo.dto';

@Controller('dispositivo')
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) { }

  @Post()
  create(@Body() createDispositivoDto: CreateDispositivoDto) {
    return this.dispositivoService.create(createDispositivoDto);
  }

  @Get()
  findAll() {
    return this.dispositivoService.findAll();
  }

  @Get('byusuario/:id')
  findByUsuario(@Param('id') id: number) {
    return this.dispositivoService.findDispositivosByIdUsusario(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dispositivo = await this.dispositivoService.findOne(id);
    return this.dispositivoService.buildDispositivoResponse(dispositivo);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispositivoDto: UpdateDispositivoDto) {
    if (id !== updateDispositivoDto.idDispositivo) {
      throw new BadRequestException(`Los IDs no coinciden`);
    }

    return this.dispositivoService.update(id, updateDispositivoDto);
  }

  @Delete('removeRelation/:idDispositivo/:idUsuario')
  removeRelacion(@Param('idDispositivo') id: string, @Param('idUsuario') idUsuario: number) {
    return this.dispositivoService.removeDispositivoFromUsusario(id, +idUsuario);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositivoService.remove(id);
  }
}
