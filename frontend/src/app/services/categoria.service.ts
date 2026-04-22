import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:3000/categorias';

  constructor(private http: HttpClient) { }

  getCategorias(usuarioId: string): Observable<any[]> {
    console.log('Llamando a API con usuarioId:', usuarioId);
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      tap(data => console.log('Respuesta del HTTP:', data))
    );
  }

  createCategoria(categoria: any): Observable<any> {
    return this.http.post(this.apiUrl, categoria);
  }

  updateCategoria(id: string, categoria: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, categoria);
  }

  deleteCategoria(id: string, usuarioId: string): Observable<any> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }
}