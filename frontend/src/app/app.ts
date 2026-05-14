import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLoggedIn = false;
  isDarkMode = false;

  constructor(private router: Router) {
    // Verificar si hay usuario al iniciar
    const user = localStorage.getItem('user');
    this.isLoggedIn = !!user;

    // Escuchar cambios de navegación para actualizar el estado
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const user = localStorage.getItem('user');
        this.isLoggedIn = !!user;
      }
    });
  }

  onLoginSuccess() {
    this.isLoggedIn = true;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}