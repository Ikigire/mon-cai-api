import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DispositivoService } from '../../services/dispositivo/dispositivo.service';
import { CreateDispositivoDto } from '../../dto/create-dispositivo.dto';
import { UpdateDispositivoDto } from '../../dto/update-dispositivo.dto';

@Controller('dispositivo')
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) {}

  @Post()
  create(@Body() createDispositivoDto: CreateDispositivoDto) {
    return this.dispositivoService.create(createDispositivoDto);
  }

  @Get()
  findAll() {
    return this.dispositivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispositivoDto: UpdateDispositivoDto) {
    return this.dispositivoService.update(+id, updateDispositivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositivoService.remove(+id);
  }
}
