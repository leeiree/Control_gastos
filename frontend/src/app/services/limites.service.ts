import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LimitesService {
  private limitesSubject = new BehaviorSubject<Map<string, number>>(new Map());
  limites$ = this.limitesSubject.asObservable();

  actualizarLimites(categorias: any[]) {
    const mapa = new Map<string, number>();
    categorias.forEach(cat => {
      mapa.set(cat.nombre, cat.limite || 100);
    });
    this.limitesSubject.next(mapa);
  }

  getLimite(categoria: string): number {
    return this.limitesSubject.getValue().get(categoria) || 100;
  }
}