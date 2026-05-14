import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IngresoService } from '../services/ingresos.service';
import { GastoService } from '../services/gasto.service';
import { ActualizacionService } from '../services/actualizacion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
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

  //Gráfico de pastel
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  public pieChartData: any = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
  };
  public pieChartType: ChartType = 'pie';

  //Gráfico de barras
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {y: {beginAtZero: true, title: {display: true, text: '€'}}}
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Ingresos', data: [], backgroundColor: '#36A2EB' },
      { label: 'Gastos', data: [], backgroundColor: '#FF6384' }
    ]
  };
  public barChartType: ChartType = 'bar';

  constructor(
    private gastoService: GastoService,
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private actualizacionService: ActualizacionService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if(userStr && userStr !== 'undefined') {
      try{
        this.user = JSON.parse(userStr);
        console.log('Usuario en dashboard:', this.user);
      }catch(e){
        console.error('Error al parsear usuario:', e);
        localStorage.removeItem('user');
      }
    } else {
      console.warn('No hay usuario en el localStorage');
    }

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

    const gastosFiltrados = this.gastos.filter(gasto => {
      if (!gasto || !gasto.fecha) return false;
      const partes = gasto.fecha.split('/');
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

    this.actualizarGraficoTarta(gastosFiltrados);
    this.actualizarGraficoBarras();

    console.log('Totales calculados:', {
      mes: this.mesSeleccionado + 1,
      anio: this.anioSeleccionado,
      totalIngresos: this.totalIngresosMes,
      totalGasto: this.totalGastosMes,
      ahorro: this.ahorroMes
    });
  }

  actualizarGraficoTarta(gastos: any[]) {
    const map = new Map<string, number>();
    gastos.forEach(g => {
      map.set(g.categoria, (map.get(g.categoria) || 0) + (g.cantidad || 0));
    });
    const items = Array.from(map.entries()).map(([c, t]) => ({ categoria: c, total: t }));
    
    this.pieChartData.labels = items.map(i => i.categoria);
    this.pieChartData.datasets[0].data = items.map(i => i.total);
    
    if (items.length === 0) {
      this.pieChartData.labels = ['Sin datos'];
      this.pieChartData.datasets[0].data = [1];
    }
  }
  
  actualizarGraficoBarras() {
    const mesesUltimos = this.obtenerUltimosMeses(6);

    this.barChartData.labels = mesesUltimos.map(m => m.nombre);

    this.barChartData.datasets[0].data = mesesUltimos.map(mes =>
      this.ingresos.filter(i => {
        if (!i?.fecha) return false;
        const partes = i.fecha.split('/');
        return parseInt(partes[1]) === mes.mes && parseInt(partes[2]) === mes.anio;
      }).reduce((sum, i) => sum + (i.cantidad || 0), 0)
    );

    this.barChartData.datasets[1].data = mesesUltimos.map(mes =>
      this.gastos.filter(g => {
        if (!g?.fecha) return false;
        const partes = g.fecha.split('/');
        return parseInt(partes[1]) === mes.mes && parseInt(partes[2]) === mes.anio;
      }).reduce((sum, g) => sum + (g.cantidad || 0), 0)
    );
  }

  obtenerUltimosMeses(cantidad: number): { nombre: string, mes: number, anio: number }[] {
    const resultado = [];
    const fecha = new Date();

    for (let i = 0; i < cantidad; i++) {
      resultado.unshift({
        nombre: this.meses[fecha.getMonth()],
        mes: fecha.getMonth() + 1,
        anio: fecha.getFullYear()
      });
      fecha.setMonth(fecha.getMonth() - 1);
    }

    return resultado;
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