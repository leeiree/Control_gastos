import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = 'http://localhost:3000/gastos';

  constructor(private http: HttpClient) { }

  private getUsuarioId(): string {
    return localStorage.getItem('usuarioId') || '';
  }

  getGastos(): Observable<any[]> {
    const usuarioId = this.getUsuarioId();
    console.log('🔍 Solicitando gastos para usuario:', usuarioId);
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  createGasto(gasto: any): Observable<any> {
    const usuarioId = this.getUsuarioId();
    return this.http.post(this.apiUrl, { ...gasto, usuarioId });
  }

  updateGasto(id: string, gasto: any): Observable<any> {
    const usuarioId = this.getUsuarioId();
    return this.http.patch(`${this.apiUrl}/${id}`, { ...gasto, usuarioId });
  }

  deleteGasto(id: string): Observable<any> {
    const usuarioId = this.getUsuarioId();
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }
}