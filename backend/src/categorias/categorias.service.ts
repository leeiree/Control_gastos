import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria } from './schemas/categoria.schema';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectModel(Categoria.name) private categoriaModel: Model<Categoria>,
  ) { }

  async create(usuarioId: string, createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = new this.categoriaModel({
      ...createCategoriaDto,
      usuarioId: usuarioId, // Guardar como string
    });
    return nuevaCategoria.save();
  }

  async findAll(usuarioId: string): Promise<Categoria[]> {
    // Buscar como string (no como ObjectId)
    return this.categoriaModel.find({ usuarioId: usuarioId }).exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Categoria> {
    const categoria = await this.categoriaModel.findOne({
      _id: id,
      usuarioId: usuarioId,
    }).exec();
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  async update(id: string, usuarioId: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.categoriaModel.findOneAndUpdate(
      { _id: id, usuarioId: usuarioId },
      updateCategoriaDto,
      { new: true },
    ).exec();
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }

  async remove(id: string, usuarioId: string): Promise<Categoria> {
    const categoria = await this.categoriaModel.findOneAndDelete({
      _id: id,
      usuarioId: usuarioId,
    }).exec();
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return categoria;
  }
}