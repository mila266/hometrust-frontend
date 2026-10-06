import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Solicitud } from '../core/models';

/** Consume el subsistema Matching / Solicitud (/api/solicitudes). */
@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private base = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  crear(idCliente: number, descripcion: string, ubicacion: string, tipo: string): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.base, { idCliente, descripcion, ubicacion, tipo });
  }

  /** Via "Profesional de confianza": envio directo a un favorito (queda ACEPTADA). */
  solicitarDirecto(idCliente: number, descripcion: string, ubicacion: string,
                   idProfesional: number, tarifaAcordada: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/directa`,
      { idCliente, descripcion, ubicacion, idProfesional, tarifaAcordada });
  }

  pendientes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/pendientes`);
  }

  porCliente(idCliente: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/cliente/${idCliente}`);
  }

  porProfesional(idProfesional: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/profesional/${idProfesional}`);
  }

  publicar(id: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/${id}/publicar`, {});
  }
  aceptar(id: number, idProfesional: number, tarifaAcordada: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/${id}/aceptar`, { idProfesional, tarifaAcordada });
  }
  iniciar(id: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/${id}/iniciar`, {});
  }
  finalizar(id: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/${id}/finalizar`, {});
  }
  cancelar(id: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(`${this.base}/${id}/cancelar`, {});
  }
}
