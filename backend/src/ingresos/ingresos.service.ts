import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model} from "mongoose";
import { Ingreso } from "./schemas/ingreso.schema";
import { CreateIngresoDto } from "./dto/create-ingreso.dto";
import { UpdateIngresoDto } from "./dto/update-ingreso.dto";

@Injectable()
export class IngresosService {
  constructor(
    @InjectModel(Ingreso.name) private ingresoModel: Model<Ingreso>,
  ) {}

    async create(usuarioId: string, createIngresoDto: CreateIngresoDto): Promise<Ingreso> {
    const nuevoIngreso = new this.ingresoModel({
      ...createIngresoDto,
      usuarioId: usuarioId, // Guardar como string
    });
    return nuevoIngreso.save();
  }

    async findAll(usuarioId: string): Promise<Ingreso[]> {
        return this.ingresoModel.find({ usuarioId: usuarioId }).exec();
    }

    async findOne(id: string, usuarioId: string): Promise<Ingreso> {
        const ingreso = await this.ingresoModel.findOne({
            _id: id,
            usuarioId: usuarioId
        }).exec();
        if (!ingreso) {
            throw new NotFoundException("Ingreso no encontrado");
        }
        return ingreso;
    }

    async update(id: string, usuarioId: string, updateIngresoDto: UpdateIngresoDto): Promise<Ingreso> {
        const ingreso = await this.ingresoModel.findOneAndUpdate(
            { _id: id, usuarioId: usuarioId },
            updateIngresoDto, { new: true })
            .exec();
        if (!ingreso) {
            throw new NotFoundException("Ingreso no encontrado");
        }
        return ingreso;
    }

    async remove(id: string, usuarioId: string): Promise<Ingreso> {
        const ingreso = await this.ingresoModel.findOneAndDelete({
            _id: id,
            usuarioId: usuarioId
        }).exec();
        if (!ingreso) {
            throw new NotFoundException("Ingreso no encontrado");
        }
        return ingreso;
    }
}
