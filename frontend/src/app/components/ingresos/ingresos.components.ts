import { Component, DoCheck, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresoService } from '../../services/ingresos.service';
import { CategoriaService } from '../../services/categoria.service';
import { ActualizacionService } from '../../services/actualizacion.service';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})
export class IngresosComponent implements DoCheck, OnInit {
  ingresos: any[] = [];
  categoriasDisponibles: string[] = [
    'Salario',
    'Beca',
    'Regalo',
    'Venta',
    'Extra',
    'Otros'
  ];
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios = [2023, 2024, 2025, 2026];
  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();

  mostrarModalAgregar = false;
  errorMensaje = '';
  nuevoIngreso = {
    concepto: '',
    categoria: '',
    cantidad: 0,
    fecha: ''
  };

  mostrarModalEditar = false;
  ingresoEditando: any = null;
  errorMensajeEditar = '';

  mostrarModalEliminar = false;
  ingresoAEliminar: any = null;

  private ultimaUrl = '';

  constructor(
    private ingresoService: IngresoService,
    private categoriaService: CategoriaService,
    private actualizacionService: ActualizacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIngresos();
    this.cargarCategorias();
  }

  ngDoCheck(): void {
    const urlActual = window.location.pathname;
    if (urlActual !== this.ultimaUrl) {
      this.ultimaUrl = urlActual;
      if (urlActual === '/ingresos') {
        this.cargarIngresos();
        this.cargarCategorias();
      }
    }
  }

  cambiarFiltro() {
    this.cdr.detectChanges();
  }

  cargarIngresos() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;
    
    this.ingresoService.getIngresos().subscribe({
      next: (data) => {
        this.ingresos = data;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error:', error)
    });
  }

  cargarCategorias() {
  const usuarioId = localStorage.getItem('usuarioId');

  if (!usuarioId) {
    return;
  }

  this.categoriaService.getCategorias(usuarioId).subscribe({
    next: (data) => {
      const categoriasBackend = data.map(c => c.nombre);

      if (categoriasBackend.length > 0) {
        this.categoriasDisponibles = categoriasBackend;
      }

      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}

  get ingresosFiltrados() {
    if (!this.ingresos || this.ingresos.length === 0) return [];
    
    return this.ingresos.filter(ingreso => {
      if (!ingreso.fecha) return false;
      const partes = ingreso.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
    });
  }

  abrirModalAgregar() {
    this.mostrarModalAgregar = true;
    this.errorMensaje = '';
    this.nuevoIngreso = {
      concepto: '',
      categoria: this.categoriasDisponibles[0] || '',
      cantidad: 0,
      fecha: this.obtenerFechaActual()
    };
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
  }

  agregarIngreso() {
    if (!this.nuevoIngreso.concepto.trim()) {
      this.errorMensaje = '❌ El concepto es obligatorio';
      return;
    }
    if (this.nuevoIngreso.cantidad <= 0) {
      this.errorMensaje = '❌ La cantidad debe ser mayor que 0';
      return;
    }
    if (!this.validarFecha(this.nuevoIngreso.fecha)) {
      this.errorMensaje = '❌ Fecha inválida. Usa formato DD/MM/YYYY';
      return;
    }

    this.ingresoService.createIngreso(this.nuevoIngreso).subscribe({
      next: () => {
        this.cargarIngresos();
        this.actualizacionService.notificarActualizacion();
        this.cerrarModalAgregar();
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMensaje = '❌ Error al crear el ingreso';
      }
    });
  }

  abrirModalEditar(ingreso: any) {
    this.ingresoEditando = { ...ingreso };
    this.mostrarModalEditar = true;
    this.errorMensajeEditar = '';
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.ingresoEditando = null;
  }

  guardarEdicion() {
    if (!this.ingresoEditando) return;
    
    if (!this.ingresoEditando.concepto?.trim()) {
      this.errorMensajeEditar = '❌ El concepto es obligatorio';
      return;
    }
    if (this.ingresoEditando.cantidad <= 0) {
      this.errorMensajeEditar = '❌ La cantidad debe ser mayor que 0';
      return;
    }
    if (!this.validarFecha(this.ingresoEditando.fecha)) {
      this.errorMensajeEditar = '❌ Fecha inválida';
      return;
    }

    this.ingresoService.updateIngreso(this.ingresoEditando._id, this.ingresoEditando).subscribe({
      next: () => {
        this.cargarIngresos();
        this.actualizacionService.notificarActualizacion();
        this.cerrarModalEditar();
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMensajeEditar = '❌ Error al actualizar';
      }
    });
  }

  confirmarEliminar(ingreso: any) {
    this.ingresoAEliminar = ingreso;
    this.mostrarModalEliminar = true;
  }

  eliminarIngreso() {
    if (this.ingresoAEliminar) {
      this.ingresoService.deleteIngreso(this.ingresoAEliminar._id).subscribe({
        next: () => {
          this.cargarIngresos();
          this.actualizacionService.notificarActualizacion();
          this.cerrarModalEliminar();
        },
        error: (error) => console.error('Error:', error)
      });
    }
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.ingresoAEliminar = null;
  }

  validarFecha(fecha: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fecha.match(regex);
    if (!match) return false;
    
    const [_, dia, mes, anio] = match;
    const diaNum = parseInt(dia, 10);
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    
    if (mesNum < 1 || mesNum > 12) return false;
    if (diaNum < 1 || diaNum > 31) return false;
    
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mesNum === 2 && (anioNum % 400 === 0 || (anioNum % 4 === 0 && anioNum % 100 !== 0))) {
      if (diaNum > 29) return false;
    } else {
      if (diaNum > diasPorMes[mesNum - 1]) return false;
    }
    return true;
  }

  get totalIngresos() {
    return this.ingresos.reduce((sum, i) => sum + i.cantidad, 0);
  }

  get ingresosEsteMes() {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    return this.ingresos
      .filter(i => {
        if (!i.fecha) return false;
        const [dia, mes, anio] = i.fecha.split('/');
        return parseInt(mes) === mesActual && parseInt(anio) === anioActual;
      })
      .reduce((sum, i) => sum + i.cantidad, 0);
  }
}