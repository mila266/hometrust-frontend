import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Oferta } from '../core/models';

@Injectable({ providedIn: 'root' })
export class OfertaService {
  private base = `${environment.apiUrl}/ofertas`;

  constructor(private http: HttpClient) {}

  enviar(idSolicitud: number, idProfesional: number, tarifaPropuesta: number,
         tiempoEstimadoLlegada: number, ubicacionActual: string): Observable<Oferta> {
    return this.http.post<Oferta>(this.base,
      { idSolicitud, idProfesional, tarifaPropuesta, tiempoEstimadoLlegada, ubicacionActual });
  }

  porSolicitud(idSolicitud: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.base}/solicitud/${idSolicitud}`);
  }

  porProfesional(idProfesional: number): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(`${this.base}/profesional/${idProfesional}`);
  }

  aceptar(idOferta: number): Observable<Oferta> {
    return this.http.post<Oferta>(`${this.base}/${idOferta}/aceptar`, {});
  }
}
