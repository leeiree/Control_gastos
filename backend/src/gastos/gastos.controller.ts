import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Body() createGastoDto: CreateGastoDto) {
    const usuarioId = createGastoDto.usuarioId || '';
    return this.gastosService.create(usuarioId, createGastoDto);
  }

  @Get()
  findAll(@Query('usuarioId') usuarioId: string) {
    return this.gastosService.findAll(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.gastosService.findOne(id, usuarioId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoDto: UpdateGastoDto) {
    const usuarioId = updateGastoDto.usuarioId || '';
    return this.gastosService.update(id, usuarioId, updateGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.gastosService.remove(id, usuarioId);
  }
}