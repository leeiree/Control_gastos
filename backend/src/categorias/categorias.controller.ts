import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) { }

  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    // Usa el usuario que está logueado (por ahora lo pasamos desde el frontend)
    const usuarioId = createCategoriaDto.usuarioId || '69a70d9c49ad86e51dcf0e54';
    return this.categoriasService.create(usuarioId, createCategoriaDto);
  }

  @Get()
  findAll(@Query('usuarioId') usuarioId: string) {
    console.log('Buscando categorías para usuarioId:', usuarioId);
    return this.categoriasService.findAll(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.categoriasService.findOne(id, usuarioId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    const usuarioId = updateCategoriaDto.usuarioId || '69a70d9c49ad86e51dcf0e54';
    return this.categoriasService.update(id, usuarioId, updateCategoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.categoriasService.remove(id, usuarioId);
  }
}