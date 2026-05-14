import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  cambiarTema() {
    this.modoOscuro = !this.modoOscuro;
    this.toggleTheme.emit();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioId');

    this.router.navigate(['/login']);
  }
}