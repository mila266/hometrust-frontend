import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private base = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar(idCliente: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/${idCliente}/favoritos`);
  }

  agregar(idCliente: number, idProfesional: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${idCliente}/favoritos/${idProfesional}`, {});
  }

  quitar(idCliente: number, idProfesional: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${idCliente}/favoritos/${idProfesional}`);
  }
}
