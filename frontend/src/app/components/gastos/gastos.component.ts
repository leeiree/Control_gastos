import { Component, DoCheck, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';
import { ActualizacionService } from '../../services/actualizacion.service';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements DoCheck, OnInit {
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
    private cdr: ChangeDetectorRef,
    private actualizacionService: ActualizacionService
  ) { }

  ngOnInit(): void {
    console.log('🟢 ngOnInit - Inicializando componente');
    this.cargarGastos();
    this.cargarCategorias();
  }

  ngDoCheck(): void {
    const urlActual = window.location.pathname;
    if (urlActual !== this.ultimaUrl) {
      console.log('🔄 ngDoCheck - URL cambiada de', this.ultimaUrl, 'a', urlActual);
      this.ultimaUrl = urlActual;
      if (urlActual === '/gastos') {
        console.log('📌 Estamos en /gastos, recargando datos');
        this.cargarGastos();
        this.cargarCategorias();
      }
    }
  }

  // ========== FUNCIÓN PARA RECARGAR CUANDO CAMBIA EL FILTRO ==========
  cambiarFiltro() {
    // Forzar que mesSeleccionado sea número
    this.mesSeleccionado = Number(this.mesSeleccionado);
    this.anioSeleccionado = Number(this.anioSeleccionado);

    console.log('🎯 cambiarFiltro - Mes:', this.mesSeleccionado + 1, 'Año:', this.anioSeleccionado);
    console.log('🎯 cambiarFiltro - Total gastos antes del filtro:', this.gastos.length);
    this.cdr.detectChanges();
    console.log('🎯 cambiarFiltro - Vista actualizada');
  }

  cargarGastos() {
    const usuarioId = localStorage.getItem('usuarioId');
    console.log('📦 cargarGastos - usuarioId:', usuarioId);
    if (!usuarioId) {
      console.error('❌ No hay usuarioId');
      return;
    }

    this.gastoService.getGastos().subscribe({
      next: (data) => {
        console.log('✅ Gastos recibidos del backend:', data);
        console.log('✅ Número de gastos:', data.length);
        this.gastos = data;
        console.log('📊 this.gastos actualizado:', this.gastos);
        this.cdr.detectChanges();
        console.log('🔄 Vista actualizada después de cargar gastos');
      },
      error: (error) => {
        console.error('❌ Error al cargar gastos:', error);
      }
    });
  }

  cargarCategorias() {
    const usuarioId = localStorage.getItem('usuarioId');
    console.log('📁 cargarCategorias - usuarioId:', usuarioId);
    if (!usuarioId) return;

    this.categoriaService.getCategorias(usuarioId).subscribe({
      next: (data) => {
        console.log('✅ Categorías recibidas:', data);
        this.categoriasDisponibles = data.map(c => c.nombre);
        console.log('📋 Categorías disponibles:', this.categoriasDisponibles);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar categorías:', error);
      }
    });
  }

  // ========== GASTOS FILTRADOS ==========
  get gastosFiltrados() {
    console.log('🔍 gastosFiltrados - Calculando...');
    console.log('🔍 Mes seleccionado:', this.mesSeleccionado + 1);
    console.log('🔍 Año seleccionado:', this.anioSeleccionado);
    console.log('🔍 Total gastos sin filtrar:', this.gastos?.length || 0);

    if (!this.gastos || this.gastos.length === 0) {
      console.log('⚠️ No hay gastos para filtrar');
      return [];
    }

    const filtrados = this.gastos.filter(gasto => {
      if (!gasto.fecha) {
        console.log('❌ Gasto sin fecha:', gasto);
        return false;
      }
      const partes = gasto.fecha.split('/');
      if (partes.length !== 3) {
        console.log('❌ Fecha mal formateada:', gasto.fecha);
        return false;
      }
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      const coincide = mes === this.mesSeleccionado + 1 && anio === this.anioSeleccionado;
      if (coincide) {
        console.log('✅ Coincide:', gasto.concepto, gasto.fecha, 'Mes:', mes, 'Año:', anio);
      }
      return coincide;
    });

    console.log('📊 Resultado filtrado:', filtrados.length, 'gastos');
    return filtrados;
  }

  // ========== AGREGAR GASTO ==========
  abrirModalAgregar() {
    console.log('➕ Abriendo modal agregar');
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
    console.log('❌ Cerrando modal agregar');
    this.mostrarModalAgregar = false;
  }

  agregarGasto() {
    console.log('💾 agregarGasto - Datos:', this.nuevoGasto);

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
      next: (response) => {
        console.log('✅ Gasto creado:', response);
        this.cargarGastos();
        this.actualizacionService.notificarActualizacion();
        this.cerrarModalAgregar();
      },
      error: (error) => {
        console.error('❌ Error al crear gasto:', error);
        this.errorMensaje = '❌ Error al crear el gasto';
      }
    });
  }

  // ========== EDITAR GASTO ==========
  abrirModalEditar(gasto: any) {
    console.log('✏️ Abriendo modal editar para:', gasto);
    this.gastoEditando = { ...gasto };
    this.mostrarModalEditar = true;
    this.errorMensajeEditar = '';
  }

  cerrarModalEditar() {
    console.log('❌ Cerrando modal editar');
    this.mostrarModalEditar = false;
    this.gastoEditando = null;
  }

  guardarEdicion() {
    console.log('💾 guardarEdicion - Gasto editando:', this.gastoEditando);

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
      next: (response) => {
        console.log('✅ Gasto actualizado:', response);
        this.cargarGastos();
        this.actualizacionService.notificarActualizacion();
        this.cerrarModalEditar();
      },
      error: (error) => {
        console.error('❌ Error al actualizar:', error);
        this.errorMensajeEditar = '❌ Error al actualizar';
      }
    });
  }

  // ========== ELIMINAR GASTO ==========
  confirmarEliminar(gasto: any) {
    console.log('🗑️ Confirmar eliminar:', gasto);
    this.gastoAEliminar = gasto;
    this.mostrarModalEliminar = true;
  }

  eliminarGasto() {
    console.log('🗑️ Eliminando gasto:', this.gastoAEliminar);
    if (this.gastoAEliminar) {
      this.gastoService.deleteGasto(this.gastoAEliminar._id).subscribe({
        next: (response) => {
          console.log('✅ Gasto eliminado:', response);
          this.cargarGastos();
          this.actualizacionService.notificarActualizacion();
          this.cerrarModalEliminar();
        },
        error: (error) => {
          console.error('❌ Error al eliminar:', error);
        }
      });
    }
  }

  cerrarModalEliminar() {
    console.log('❌ Cerrando modal eliminar');
    this.mostrarModalEliminar = false;
    this.gastoAEliminar = null;
  }

  // ========== VALIDAR FECHA ==========
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

  // ========== TOTALES ==========
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