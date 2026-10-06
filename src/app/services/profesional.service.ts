import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Profesional } from '../core/models';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private base = `${environment.apiUrl}/profesionales`;

  constructor(private http: HttpClient) {}

  registrar(nombre: string, ubicacion: string): Observable<Profesional> {
    return this.http.post<Profesional>(this.base, { nombre, ubicacion });
  }

  listarActivos(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(`${this.base}/activos`);
  }

  /** Todos los tecnicos en cualquier estado (panel de administracion). */
  listarTodos(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.base);
  }

  obtener(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.base}/${id}`);
  }

  enviarDocumentos(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/enviar-documentos`, {});
  }
  revisar(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/revisar`, {});
  }
  aprobar(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/aprobar`, {});
  }
  rechazar(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/rechazar`, {});
  }
  docIncompleta(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/doc-incompleta`, {});
  }
  suspender(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/suspender`, {});
  }
  reactivar(id: number): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.base}/${id}/reactivar`, {});
  }
}
