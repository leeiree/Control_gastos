import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Gasto extends Document {
  @Prop({ required: true })
  concepto: string;

  @Prop({ required: true })
  cantidad: number;

  @Prop({ required: true })
  categoria: string;

  @Prop({ required: true })
  fecha: string;

  @Prop({ required: true, type: String })  // ← Asegurar que es String
  usuarioId: string;
}

export const GastoSchema = SchemaFactory.createForClass(Gasto);