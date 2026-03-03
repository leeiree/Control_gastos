import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
  this.authService.login(this.email, this.password).subscribe({
    next: (user) => {
      console.log('Login exitoso:', user); // ← Verás esto en la consola
      this.authService.setUser(user);
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Error completo:', error); // ← Verás el error real
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  });
}
}