import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() toggleTheme = new EventEmitter<void>();
  modoOscuro = false;

  cambiarTema() {
    this.modoOscuro = !this.modoOscuro;
    this.toggleTheme.emit();
  }

  logout() {
    console.log('Cerrar sesión');
  }
}