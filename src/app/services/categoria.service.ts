import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Categoria } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private base = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> { return this.http.get<Categoria[]>(this.base); }

  crear(nombre: string, oficio: string, tarifaBaseReferencial: number): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, { nombre, oficio, tarifaBaseReferencial });
  }

  actualizar(id: number, nombre: string, oficio: string, tarifaBaseReferencial: number): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, { nombre, oficio, tarifaBaseReferencial });
  }

  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
