import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { GastosComponent } from './components/gastos/gastos.component';
import { IngresosComponent } from './components/ingresos/ingresos.component';
import { CategoriasComponent } from './components/categorias/categorias.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'gastos', component: GastosComponent },
  { path: 'ingresos', component: IngresosComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  { path: '**', redirectTo: '/login' }
];