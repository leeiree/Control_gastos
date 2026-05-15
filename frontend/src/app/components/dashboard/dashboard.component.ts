import { Component, OnInit, OnDestroy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IngresoService } from '../../services/ingresos.service';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, DoCheck {
  user: any = null;

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
  gastosDesglosados: { categoria: string; total: number }[] = [];

  limitesMap: Map<string, number> = new Map();

  // Gráfico de pastel
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'top' } }
  };

  public pieChartData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      borderWidth: 0
    }]
  };
  public pieChartType: ChartType = 'pie';

  // Gráfico de barras
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: '€' } },
      x: { title: { display: true, text: 'Meses' } }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Ingresos', data: [], backgroundColor: '#36A2EB', borderRadius: 8 },
      { label: 'Gastos', data: [], backgroundColor: '#FF6384', borderRadius: 8 }
    ]
  };
  public barChartType: ChartType = 'bar';

  private ultimaUrl = '';
  private routerSubscription: Subscription = new Subscription();

  constructor(
    private gastoService: GastoService,
    private ingresosService: IngresoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Cargar límites directamente desde MongoDB
    this.cargarLimites();

    this.cargarDatos();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/dashboard') {
          this.cargarLimites();
          this.cargarDatos();
          this.forzarRedrawGraficos();
        }
      });
  }

  ngDoCheck(): void {
    const urlActual = this.router.url;
    if (urlActual !== this.ultimaUrl) {
      this.ultimaUrl = urlActual;
      if (urlActual === '/dashboard') {
        this.cargarLimites();
        this.cargarDatos();
        this.forzarRedrawGraficos();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  cargarLimites() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      console.error('No hay usuarioId');
      return;
    }
    
    this.categoriaService.getCategorias(usuarioId).subscribe({
      next: (categorias) => {
        this.limitesMap.clear();
        categorias.forEach((cat: any) => {
          this.limitesMap.set(cat.nombre, cat.limite || 100);
        });
        console.log('📊 Límites cargados desde MongoDB:', [...this.limitesMap.entries()]);
        this.calcularTotales();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando límites:', error);
      }
    });
  }

  forzarRedrawGraficos() {
    setTimeout(() => {
      this.barChartData = { ...this.barChartData };
      this.pieChartData = { ...this.pieChartData };
      this.cdr.detectChanges();
    }, 100);
  }

  cargarDatos() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;
    forkJoin({
      gastos: this.gastoService.getGastos(),
      ingresos: this.ingresosService.getIngresos()
    }).subscribe({
      next: ({ gastos, ingresos }) => {
        this.gastos = gastos || [];
        this.ingresos = ingresos || [];
        this.calcularTotales();
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error:', e)
    });
  }

  cambiarFiltro() {
    this.mesSeleccionado = Number(this.mesSeleccionado);
    this.anioSeleccionado = Number(this.anioSeleccionado);
    this.calcularTotales();
    this.actualizarGraficoBarras();
    this.cdr.detectChanges();
  }

  private calcularTotales() {
    const mesActual = this.mesSeleccionado + 1;
    const anioActual = this.anioSeleccionado;

    const gastosFiltrados = this.gastos.filter(gasto => {
      if (!gasto?.fecha) return false;
      const partes = gasto.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === mesActual && anio === anioActual;
    });

    const ingresosFiltrados = this.ingresos.filter(ingreso => {
      if (!ingreso?.fecha) return false;
      const partes = ingreso.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === mesActual && anio === anioActual;
    });

    this.totalGastosMes = gastosFiltrados.reduce((sum, g) => sum + Number(g.cantidad), 0);
    this.totalIngresosMes = ingresosFiltrados.reduce((sum, i) => sum + Number(i.cantidad), 0);
    this.ahorroMes = this.totalIngresosMes - this.totalGastosMes;
    this.gastosDesglosados = this.obtenerGastosDesglosados();

    this.actualizarGraficoBarras();
    this.actualizarGraficoTarta(gastosFiltrados);
  }

  obtenerGastosDesglosados(): { categoria: string; total: number }[] {
    const map = new Map<string, number>();
    const mesActual = this.mesSeleccionado + 1;
    const anioActual = this.anioSeleccionado;

    const gastosFiltrados = this.gastos.filter(gasto => {
      if (!gasto?.fecha) return false;
      const partes = gasto.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === mesActual && anio === anioActual;
    });

    gastosFiltrados.forEach(gasto => {
      const categoria = gasto.categoria || 'Otros';
      map.set(categoria, (map.get(categoria) || 0) + (gasto.cantidad || 0));
    });

    return Array.from(map.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  }

  actualizarGraficoTarta(gastos: any[]) {
    const map = new Map<string, number>();
    gastos.forEach(g => {
      const categoria = g.categoria || 'Sin categoría';
      map.set(categoria, (map.get(categoria) || 0) + (g.cantidad || 0));
    });
    
    const items = Array.from(map.entries()).map(([c, t]) => ({ categoria: c, total: t }));
    
    const coloresPorCategoria: { [key: string]: string } = {
      'Comida': '#FF6384',
      'Transporte': '#36A2EB',
      'Ocio': '#FFCE56',
      'Vivienda': '#4BC0C0',
      'Salud': '#9966FF',
      'Educación': '#FF9F40',
      'Otros': '#C9CBCF',
      'Sin categoría': '#AAAAAA'
    };

    const colores = items.map(item => coloresPorCategoria[item.categoria] || '#C9CBCF');

    this.pieChartData = {
      labels: items.map(i => i.categoria),
      datasets: [{ data: items.map(i => i.total), backgroundColor: colores, borderWidth: 0 }]
    };
    
    if (items.length === 0) {
      this.pieChartData = {
        labels: ['Sin datos'],
        datasets: [{ data: [1], backgroundColor: ['#CCCCCC'], borderWidth: 0 }]
      };
    }
  }

  actualizarGraficoBarras() {
    const mesesUltimos = this.obtenerUltimosMeses(6);
    const labels = mesesUltimos.map(m => m.nombre);

    const ingresosData = mesesUltimos.map(mesObj =>
      this.ingresos.filter(i => {
        if (!i?.fecha) return false;
        const partes = i.fecha.split('/');
        if (partes.length !== 3) return false;
        const mes = parseInt(partes[1], 10);
        const anio = parseInt(partes[2], 10);
        return mes === mesObj.mes && anio === mesObj.anio;
      }).reduce((sum, i) => sum + (i.cantidad || 0), 0)
    );

    const gastosData = mesesUltimos.map(mesObj =>
      this.gastos.filter(g => {
        if (!g?.fecha) return false;
        const partes = g.fecha.split('/');
        if (partes.length !== 3) return false;
        const mes = parseInt(partes[1], 10);
        const anio = parseInt(partes[2], 10);
        return mes === mesObj.mes && anio === mesObj.anio;
      }).reduce((sum, g) => sum + (g.cantidad || 0), 0)
    );

    this.barChartData = {
      labels: labels,
      datasets: [
        { label: 'Ingresos', data: ingresosData, backgroundColor: '#4CAF50', borderRadius: 8, barPercentage: 0.6 },
        { label: 'Gastos', data: gastosData, backgroundColor: '#F44336', borderRadius: 8, barPercentage: 0.6 }
      ]
    };
  }

  obtenerUltimosMeses(cantidad: number): { nombre: string; mes: number; anio: number }[] {
    const resultado: { nombre: string; mes: number; anio: number }[] = [];
    const fecha = new Date(this.anioSeleccionado, this.mesSeleccionado);

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

  getColor(categoria: string): string {
    const colores: { [key: string]: string } = {
      'Comida': '#FF6384',
      'Transporte': '#36A2EB',
      'Ocio': '#FFCE56',
      'Vivienda': '#4BC0C0',
      'Salud': '#9966FF',
      'Educación': '#FF9F40',
      'Otros': '#C9CBCF'
    };
    return colores[categoria] || '#C9CBCF';
  }

  getIcono(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'Comida': '🍔',
      'Transporte': '🚗',
      'Ocio': '🎬',
      'Vivienda': '🏠',
      'Salud': '💊',
      'Educación': '📚',
      'Otros': '📦'
    };
    return iconos[categoria] || '📁';
  }

  getLimiteCategoria(categoria: string): number {
    return this.limitesMap.get(categoria) || 100;
  }

  getColorProgreso(gastado: number, limite: number): string {
    const porcentaje = (gastado / limite) * 100;
    if (porcentaje >= 100) return '#dc3545';
    if (porcentaje >= 80) return '#ffc107';
    return '#28a745';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioId');
    this.router.navigate(['/login']);
  }
}