import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Perfil, Categoria } from '../core/models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtener(idProfesional: number): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.api}/profesionales/${idProfesional}/perfil`);
  }

  actualizar(idProfesional: number, descripcion: string, destacado: boolean, categoriaIds: number[]): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.api}/profesionales/${idProfesional}/perfil`,
      { descripcion, destacado, categoriaIds });
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.api}/categorias`);
  }
}
