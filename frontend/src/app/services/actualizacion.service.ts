import { Injectable } from "@angular/core";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ActualizacionService {
  private actualizarSource = new Subject<void>();
  public actualizar$ = this.actualizarSource.asObservable();

  notificarActualizacion(){
    this.actualizarSource.next();
 }
}