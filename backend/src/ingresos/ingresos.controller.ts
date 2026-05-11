import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { IngresosService } from "./ingresos.service";
import { CreateIngresoDto } from "./dto/create-ingreso.dto";
import { UpdateIngresoDto } from "./dto/update-ingreso.dto";

@Controller("ingresos")
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

    @Post()
    create(@Body() createIngresoDto: CreateIngresoDto){
        const usuarioId = createIngresoDto.usuarioId || '';
        return this.ingresosService.create(usuarioId, createIngresoDto);
    }

    @Get()
    findAll(@Query("usuarioId") usuarioId: string) {
        return this.ingresosService.findAll(usuarioId);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @Query("usuarioId") usuarioId: string) {
        return this.ingresosService.findOne(id, usuarioId);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateIngresoDto: UpdateIngresoDto) {
        const usuarioId = updateIngresoDto.usuarioId || '';
        return this.ingresosService.update(id, usuarioId, updateIngresoDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string, @Query("usuarioId") usuarioId: string) {
        return this.ingresosService.remove(id, usuarioId);
    }
}

