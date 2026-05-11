import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresoService } from '../services/ingresos.service';
import { GastoService } from '../services/gasto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios = [2023, 2024, 2025, 2026];
  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();

  gastos: any[] = [];
  ingresos: any[] = [];

  constructor(
    private gastoService: GastoService,
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef
   
  )  {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.gastoService.getGastos().subscribe({
      next: (data) => {
        this.gastos = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error al cargar gastos:', e)
    });
  }

  cambiarFiltro(){
    this.mesSeleccionado = Number(this.mesSeleccionado);
    this.anioSeleccionado = Number(this.anioSeleccionado);
    this.cdr.detectChanges();
  }

  private filtrarPorMes(lista: any[]): any[] {
    return lista.filter(item => {
      if (!item.fecha) return false;
      const partes = item.fecha.split('/');
      if (partes.length !== 3) return false;
      return parseInt(partes[1], 10) === this.mesSeleccionado + 1 && parseInt(partes[2], 10) === this.anioSeleccionado;
    });
  }

  get totalGastosMes(): number {
    return this.filtrarPorMes(this.gastos).reduce((total, gasto) => total + gasto.cantidad, 0);
  }

  get totalIngresosMes(): number {
    return this.filtrarPorMes(this.ingresos).reduce((total, ingreso) => total + ingreso.cantidad, 0);
  }

  get ahorroMes(): number {
    return this.totalIngresosMes - this.totalGastosMes;
  }

  get gastosDesglosados(): {categoria: string; total: number}[] {
    const map = new Map<string, number>();
    this.filtrarPorMes(this.gastos).forEach(gasto => {
      map.set(gasto.categoria, (map.get(gasto.categoria) || 0) + gasto.cantidad);
    });
    return Array.from(map.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
  }
}