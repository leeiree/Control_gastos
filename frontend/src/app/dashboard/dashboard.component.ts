import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { IngresoService } from '../services/ingresos.service';
import { GastoService } from '../services/gasto.service';
import { ActualizacionService } from '../services/actualizacion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  private subscription: Subscription = new Subscription();

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  anios = [2023, 2024, 2025, 2026];

  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();

  gastos: any[] = [];
  ingresos: any[] = [];

  totalIngresosMes: number = 0;
  totalGastosMes: number = 0;
  ahorroMes: number = 0;

  constructor(
    private gastoService: GastoService,
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private actualizacionService: ActualizacionService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    this.user = userStr ? JSON.parse(userStr) : null;
    console.log('Usuario en dashboard:', this.user);

    this.cargarDatos();

    this.subscription = this.actualizacionService.actualizar$.subscribe(() => 
      {
        console.log('Dashboard: Recibida notificación de actualización');
        this.cargarDatos();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarDatos() {
    forkJoin({
      gastos: this.gastoService.getGastos(),
      ingresos: this.ingresoService.getIngresos()
    }).subscribe({
      next: ({ gastos, ingresos }) => {
        this.gastos = gastos || [];
        this.ingresos = ingresos || [];

        console.groupCollapsed('====DATOS DEL BACKEND ====')
        console.log('Gastos:', this.gastos);
        console.log('Ingresos dashboard:', this.ingresos);

        this.calcularTotales();
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Error al cargar datos del dashboard:', e);
      }
    });
  }

  cambiarFiltro() {
    this.mesSeleccionado = Number(this.mesSeleccionado);
    this.anioSeleccionado = Number(this.anioSeleccionado);
    this.calcularTotales();
    this.cdr.detectChanges();
  }

  private calcularTotales() {
    console.log('==== FILTRANDO DATOS ====');
    console.log('Mes seleccionado:', this.mesSeleccionado + 1);
    console.log('Año seleccionado:', this.anioSeleccionado);
    
    const gastosFiltrados = this.gastos.filter(gasto => {
      if (!gasto.fecha) return false;
      const partes = gasto.fecha.trim().split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
    });

    const ingresosFiltrados = this.ingresos.filter(ingreso => {
      if (!ingreso.fecha) return false;
      const partes = ingreso.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
    });

    this.totalGastosMes = gastosFiltrados.reduce((sum, g) => sum + Number(g.cantidad), 0);
    this.totalIngresosMes = ingresosFiltrados.reduce((sum, i) => sum + Number(i.cantidad), 0);
    this.ahorroMes = this.totalIngresosMes - this.totalGastosMes;
  
    console.log('Totales calculados:', {
      mes: this.mesSeleccionado + 1,
      anio: this.anioSeleccionado,
      totalIngresos: this.totalIngresosMes,
      totalGasto: this.totalGastosMes,
      ahorro: this.ahorroMes
    });
  }

  get gastosDesglosados(): { categoria: String, total: number}[]{
  const map = new Map<string, number>();

  const gastosFiltrados = this.gastos.filter(gasto => {
    if (!gasto.fecha) return false;
    const partes = gasto.fecha.split('/');
    if (partes.length !== 3) return false;
    const mes = parseInt(partes[1], 10);
    const anio = parseInt(partes[2], 10);
    return mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
  });

  gastosFiltrados.forEach(gasto => {
    const cantidad = Number(gasto.cantidad);
    map.set(gasto.categoria, (map.get(gasto.categoria) || 0) + cantidad);
  });

  return Array.from(map.entries())
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioId');
    this.router.navigate(['/login']);
  }
}