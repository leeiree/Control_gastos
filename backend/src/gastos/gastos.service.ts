import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gasto } from './schemas/gasto.schema';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

@Injectable()
export class GastosService {
  constructor(
    @InjectModel(Gasto.name) private gastoModel: Model<Gasto>,
  ) {}

  async create(usuarioId: string, createGastoDto: CreateGastoDto): Promise<Gasto> {
    const nuevoGasto = new this.gastoModel({
      ...createGastoDto,
      usuarioId: usuarioId, // Guardar como string
    });
    return nuevoGasto.save();
  }

  async findAll(usuarioId: string): Promise<Gasto[]> {
    // Buscar como string
    return this.gastoModel.find({ usuarioId: usuarioId }).exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Gasto> {
    const gasto = await this.gastoModel.findOne({
      _id: id,
      usuarioId: usuarioId,
    }).exec();
    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }
    return gasto;
  }

  async update(id: string, usuarioId: string, updateGastoDto: UpdateGastoDto): Promise<Gasto> {
    const gasto = await this.gastoModel.findOneAndUpdate(
      { _id: id, usuarioId: usuarioId },
      updateGastoDto,
      { new: true },
    ).exec();
    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }
    return gasto;
  }

  async remove(id: string, usuarioId: string): Promise<Gasto> {
    const gasto = await this.gastoModel.findOneAndDelete({
      _id: id,
      usuarioId: usuarioId,
    }).exec();
    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }
    return gasto;
  }
}