import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {
  private apiUrl = 'http://localhost:3000/ingresos';

  constructor(private http: HttpClient) { }

  private getUsuarioId(): string {
    return localStorage.getItem('usuarioId') || '';
  }

  getIngresos(): Observable<any[]> {
    const usuarioId = this.getUsuarioId();
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  createIngreso(ingreso: any): Observable<any> {
    const usuarioId = this.getUsuarioId();
    return this.http.post(this.apiUrl, { ...ingreso, usuarioId });
  }

  updateIngreso(id: string, ingreso: any): Observable<any> {
    const usuarioId = this.getUsuarioId();
    return this.http.patch(`${this.apiUrl}/${id}`, { ...ingreso, usuarioId });
  }

  deleteIngreso(id: string): Observable<any> {
    const usuarioId = this.getUsuarioId();
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }
}