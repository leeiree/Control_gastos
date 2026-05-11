import {Module} from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { Ingreso, IngresoSchema } from "./schemas/ingreso.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ingreso.name, schema: IngresoSchema }])
  ],
  controllers: [IngresosController], 
  providers: [IngresosService],
  exports: [IngresosService]
})
export class IngresosModule {}