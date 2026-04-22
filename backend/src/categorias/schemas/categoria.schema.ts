import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Categoria extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ default: '📁' })
  icono: string;

  @Prop({ default: '#6c757d' })
  color: string;

  @Prop({ default: 0 })
  limite: number;

  @Prop({ required: true, type: String })
  usuarioId: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);