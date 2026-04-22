import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';  // ← IMPORTAR Router
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router  // ← INYECTAR Router
  ) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        
        const usuarioId = response._id || response.id || response.user?.id;
        if (usuarioId) {
          localStorage.setItem('usuarioId', usuarioId);
        }
        
        this.authService.setUser(response.user);
        this.loginSuccess.emit();
        
        // ← REDIRIGIR AL DASHBOARD
        this.router.navigate(['/dashboard']);
        
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = 'Email o contraseña incorrectos';
      }
    });
  }
}