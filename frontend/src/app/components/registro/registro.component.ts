import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  mostrarModalExito: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // ← Inyectar
  ) { }

  onSubmit() {
    if (this.isLoading) return;

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.cdr.detectChanges();  // ← Forzar actualización
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso. Respuesta del backend:', response);
        // En lugar de mostrarModalExito, usa confirm
        if (confirm('Usuario registrado correctamente. ¿Ir al login?')) {
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error completo:', error);

        const mensajeError = error.error?.message || error.message;
        console.log('Mensaje extraído:', mensajeError);

        if (mensajeError) {
          this.errorMessage = mensajeError;
        } else {
          this.errorMessage = 'Error al registrar usuario';
        }

        this.isLoading = false;
        this.cdr.detectChanges();  // ← Forzar actualización
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}