import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reputacion } from '../core/models';

/** Consume el subsistema Reputacion (/api/reputacion). */
@Injectable({ providedIn: 'root' })
export class ReputacionService {
  private base = `${environment.apiUrl}/reputacion`;

  constructor(private http: HttpClient) {}

  calificar(idSolicitud: number, idProfesional: number, puntaje: number, comentario: string): Observable<Reputacion> {
    return this.http.post<Reputacion>(`${this.base}/calificar`, { idSolicitud, idProfesional, puntaje, comentario });
  }

  consultar(idProfesional: number): Observable<Reputacion> {
    return this.http.get<Reputacion>(`${this.base}/${idProfesional}`);
  }
}
