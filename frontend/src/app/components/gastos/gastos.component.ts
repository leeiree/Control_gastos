import { Component, DoCheck, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-gastos',  // ← CORREGIDO
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',  // ← CORREGIDO
  styleUrls: ['./gastos.component.css']  // ← CORREGIDO
})
export class GastosComponent implements DoCheck, OnInit {  // ← CORREGIDO
  gastos: any[] = [];
  categoriasDisponibles: string[] = [];

  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios = [2023, 2024, 2025, 2026];
  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();

  mostrarModalAgregar = false;
  errorMensaje = '';
  nuevoGasto = {
    concepto: '',
    categoria: '',
    cantidad: 0,
    fecha: ''
  };

  mostrarModalEditar = false;
  gastoEditando: any = null;
  errorMensajeEditar = '';

  mostrarModalEliminar = false;
  gastoAEliminar: any = null;

  private ultimaUrl = '';

  constructor(
    private gastoService: GastoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarGastos();
    this.cargarCategorias();
  }

  ngDoCheck(): void {
    const urlActual = window.location.pathname;
    if (urlActual !== this.ultimaUrl) {
      this.ultimaUrl = urlActual;
      if (urlActual === '/gastos') {
        this.cargarGastos();
        this.cargarCategorias();
      }
    }
  }

  cambiarFiltro() {
    this.mesSeleccionado = Number(this.mesSeleccionado);
    this.anioSeleccionado = Number(this.anioSeleccionado);
    this.cdr.detectChanges();
  }

  cargarGastos() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;
    
    this.gastoService.getGastos().subscribe({
      next: (data) => {
        this.gastos = data;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error:', error)
    });
  }

  cargarCategorias() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) return;
    
    this.categoriaService.getCategorias(usuarioId).subscribe({
      next: (data) => {
        this.categoriasDisponibles = data.map(c => c.nombre);
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error:', error)
    });
  }

  get gastosFiltrados() {
    if (!this.gastos || this.gastos.length === 0) return [];
    
    return this.gastos.filter(gasto => {
      if (!gasto.fecha) return false;
      const partes = gasto.fecha.split('/');
      if (partes.length !== 3) return false;
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      return mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
    });
  }

  abrirModalAgregar() {
    this.mostrarModalAgregar = true;
    this.errorMensaje = '';
    this.nuevoGasto = {
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

  agregarGasto() {
    if (!this.nuevoGasto.concepto.trim()) {
      this.errorMensaje = '❌ El concepto es obligatorio';
      return;
    }
    if (this.nuevoGasto.cantidad <= 0) {
      this.errorMensaje = '❌ La cantidad debe ser mayor que 0';
      return;
    }
    if (!this.validarFecha(this.nuevoGasto.fecha)) {
      this.errorMensaje = '❌ Fecha inválida. Usa formato DD/MM/YYYY';
      return;
    }

    this.gastoService.createGasto(this.nuevoGasto).subscribe({
      next: () => {
        this.cargarGastos();
        this.cerrarModalAgregar();
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMensaje = '❌ Error al crear el gasto';
      }
    });
  }

  abrirModalEditar(gasto: any) {
    this.gastoEditando = { ...gasto };
    this.mostrarModalEditar = true;
    this.errorMensajeEditar = '';
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.gastoEditando = null;
  }

  guardarEdicion() {
    if (!this.gastoEditando) return;
    
    if (!this.gastoEditando.concepto?.trim()) {
      this.errorMensajeEditar = '❌ El concepto es obligatorio';
      return;
    }
    if (this.gastoEditando.cantidad <= 0) {
      this.errorMensajeEditar = '❌ La cantidad debe ser mayor que 0';
      return;
    }
    if (!this.validarFecha(this.gastoEditando.fecha)) {
      this.errorMensajeEditar = '❌ Fecha inválida';
      return;
    }

    this.gastoService.updateGasto(this.gastoEditando._id, this.gastoEditando).subscribe({
      next: () => {
        this.cargarGastos();
        this.cerrarModalEditar();
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMensajeEditar = '❌ Error al actualizar';
      }
    });
  }

  confirmarEliminar(gasto: any) {
    this.gastoAEliminar = gasto;
    this.mostrarModalEliminar = true;
  }

  eliminarGasto() {
    if (this.gastoAEliminar) {
      this.gastoService.deleteGasto(this.gastoAEliminar._id).subscribe({
        next: () => {
          this.cargarGastos();
          this.cerrarModalEliminar();
        },
        error: (error) => console.error('Error:', error)
      });
    }
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.gastoAEliminar = null;
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

  get totalGastos() {
    return this.gastos.reduce((sum, g) => sum + g.cantidad, 0);
  }

  get gastosEsteMes() {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    return this.gastos
      .filter(g => {
        if (!g.fecha) return false;
        const [dia, mes, anio] = g.fecha.split('/');
        return parseInt(mes) === mesActual && parseInt(anio) === anioActual;
      })
      .reduce((sum, g) => sum + g.cantidad, 0);
  }
}