import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios = [2023, 2024, 2025, 2026];  // ← "anios" sin ñ
  mesSeleccionado = new Date().getMonth();
  anioSeleccionado = new Date().getFullYear();  // ← "anio" sin ñ

  totalGastos = 1250;
  gastosEsteMes = 450;
  ahorroMes = 800;
}
