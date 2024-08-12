import { Controller, Post, Get, Delete, Body, Param, BadRequestException, Put } from '@nestjs/common';
import { CreateSensorDto } from 'src/dispositivo/dto/create-sensor.dto';
import { SensorService } from 'src/dispositivo/services/sensor/sensor/sensor.service';

@Controller('sensor')
export class SensorController {
    constructor(private readonly dispositivoService: SensorService) {}

  @Post()
  create(@Body() createDispositivoDto: CreateSensorDto) {
    return this.dispositivoService.create(createDispositivoDto);
  }

  @Get()
  findAll() {
    return this.dispositivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispositivoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSensorDto: CreateSensorDto) {
    if (id !== updateSensorDto.tipo) {
        throw new BadRequestException(`Lod tipos no coinciden entre`)
    }
    return this.dispositivoService.update(id, updateSensorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispositivoService.remove(id);
  }
}
