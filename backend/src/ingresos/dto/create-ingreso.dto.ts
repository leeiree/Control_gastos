import {IsString, IsNumber, Min, IsOptional} from 'class-validator';

export class CreateIngresoDto{
    @IsString()
    concepto: string;

    @IsNumber()
    @Min(0)
    cantidad: number;

    @IsString()
    categoria: string;

    @IsString()
    fecha: string;

    @IsOptional()
    usuarioId?:string;
}