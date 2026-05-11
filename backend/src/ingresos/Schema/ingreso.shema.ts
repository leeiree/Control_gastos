import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Ingreso extends Document {
    @Prop({ required: true})
    concepto: string;

    @Prop({ required: true})
    cantidad: number;

    @Prop({ required: true})
    categoria: string;

    @Prop({ required: true})
    fecha: string;

    @Prop({ required: true, type: String})
    usuarioId: string;
}

export const IngresoShema = SchemaFactory.createForClass(Ingreso);