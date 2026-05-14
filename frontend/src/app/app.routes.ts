import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { GastosComponent } from './components/gastos/gastos.component';
import { IngresosComponent } from './components/ingresos/ingresos.components';
import { CategoriasComponent } from './components/categorias/categorias.component';

import { LoginComponent } from './login/login.component';



export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'gastos', component: GastosComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'ingresos', component: IngresosComponent },
  { path: '**', redirectTo: '/dashboard' }
];