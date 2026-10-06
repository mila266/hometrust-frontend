import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Documento {
  id: number;
  idProfesional: number;
  tipo: string;
  url: string;
  estado: string;
}

/** Documentos del profesional (Subir Documentos, verificacion). */
@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(idProfesional: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.api}/profesionales/${idProfesional}/documentos`);
  }

  subir(idProfesional: number, tipo: string, url: string): Observable<Documento> {
    return this.http.post<Documento>(`${this.api}/profesionales/${idProfesional}/documentos`, { tipo, url });
  }
}
