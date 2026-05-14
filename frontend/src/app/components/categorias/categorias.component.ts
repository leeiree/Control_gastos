import { Component, DoCheck, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements DoCheck {
  categorias: any[] = [];

  // Modal de agregar
  mostrarModalAgregar = false;
  errorMensaje = '';
  nuevaCategoria = {
    nombre: '',
    icono: '📁',
    limite: 0
  };

  // Modal de edición
  mostrarModalEditar = false;
  categoriaEditando: any = null;
  errorMensajeEditar = '';

  // Modal de eliminación
  mostrarModalEliminar = false;
  categoriaAEliminar: any = null;

  // Lista de emojis
  emojisDisponibles = [
    '🍔', '🍕', '🥗', '🍎', '🥩', '🚗', '🚌', '✈️', '🚲', '⛽',
    '🎬', '🎮', '🎵', '⚽', '🍿', '🏠', '🛋️', '🔧', '💡', '🧹',
    '💊', '🏥', '🧘', '💪', '🩺', '📚', '✏️', '🎓', '💻', '📖'
  ];

  private ultimaUrl = '';

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngDoCheck(): void {
    const urlActual = window.location.pathname;
    if (urlActual !== this.ultimaUrl) {
      this.ultimaUrl = urlActual;
      if (urlActual === '/categorias') {
        this.cargarCategorias();
      }
    }
  }

  cargarCategorias() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      console.error('No hay usuarioId en localStorage');
      return;
    }
    
    this.categoriaService.getCategorias(usuarioId).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  // ========== AGREGAR CATEGORÍA ==========
  abrirModalAgregar() {
    this.mostrarModalAgregar = true;
    this.errorMensaje = '';
    this.nuevaCategoria = { nombre: '', icono: '📁', limite: 0 };
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false;
  }

  seleccionarEmoji(emoji: string) {
    this.nuevaCategoria.icono = emoji;
  }

  agregarCategoria() {
    if (!this.nuevaCategoria.nombre.trim()) {
      this.errorMensaje = '❌ El nombre de la categoría es obligatorio';
      return;
    }
    if (this.nuevaCategoria.limite <= 0) {
      this.errorMensaje = '❌ El límite debe ser mayor que 0';
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId') || '';
    
    this.categoriaService.createCategoria({
      nombre: this.nuevaCategoria.nombre,
      icono: this.nuevaCategoria.icono,
      limite: this.nuevaCategoria.limite,
      usuarioId: usuarioId
    }).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cerrarModalAgregar();
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        this.errorMensaje = '❌ Error al crear la categoría';
      }
    });
  }

  // ========== EDITAR CATEGORÍA ==========
  abrirModalEditar(categoria: any) {
    this.categoriaEditando = { ...categoria };
    this.mostrarModalEditar = true;
    this.errorMensajeEditar = '';
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.categoriaEditando = null;
  }

  seleccionarEmojiEditar(emoji: string) {
    this.categoriaEditando.icono = emoji;
  }

  guardarEdicion() {
    if (!this.categoriaEditando) {
      console.error('No hay categoría para editar');
      return;
    }
    
    if (!this.categoriaEditando.nombre?.trim()) {
      this.errorMensajeEditar = '❌ El nombre de la categoría es obligatorio';
      return;
    }
    if (this.categoriaEditando.limite <= 0) {
      this.errorMensajeEditar = '❌ El límite debe ser mayor que 0';
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId') || '';
    
    this.categoriaService.updateCategoria(this.categoriaEditando._id, {
      nombre: this.categoriaEditando.nombre,
      icono: this.categoriaEditando.icono,
      limite: this.categoriaEditando.limite,
      usuarioId: usuarioId
    }).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cerrarModalEditar();
      },
      error: (error) => {
        console.error('Error al actualizar categoría:', error);
        this.errorMensajeEditar = '❌ Error al actualizar la categoría';
      }
    });
  }

  // ========== ELIMINAR CATEGORÍA ==========
  confirmarEliminar(categoria: any) {
    this.categoriaAEliminar = categoria;
    this.mostrarModalEliminar = true;
  }

  eliminarCategoria() {
    if (this.categoriaAEliminar) {
    this.categoriaService.deleteCategoria(this.categoriaAEliminar._id).subscribe({
      next: () => {
        this.cargarCategorias();
        this.cerrarModalEliminar();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
      }
    });
    }
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.categoriaAEliminar = null;
  }
}