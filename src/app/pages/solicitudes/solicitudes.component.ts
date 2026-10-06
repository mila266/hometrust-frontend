import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { Solicitud, EstadoSolicitud } from '../../core/models';

type Fila = Solicitud & { _idProf?: number; _tarifa?: number };

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Solicitudes</h1>
    <p style="color:var(--gris-500);margin-top:0">
      Ciclo de vida del servicio (subsistema Matching, maquina de estados + eventos).
    </p>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <div class="grid grid-2">
      <div class="card">
        <h3>Crear solicitud</h3>
        <div class="campo">
          <label>ID del cliente</label>
          <input type="number" [(ngModel)]="idCliente" placeholder="1">
        </div>
        <div class="campo">
          <label>Descripcion</label>
          <input [(ngModel)]="descripcion" placeholder="Fuga de agua en la cocina">
        </div>
        <div class="campo">
          <label>Ubicacion</label>
          <input [(ngModel)]="ubicacion" placeholder="San Miguel, Lima">
        </div>
        <div class="campo">
          <label>Tipo</label>
          <select [(ngModel)]="tipo">
            <option value="NORMAL">NORMAL</option>
            <option value="EMERGENCIA">EMERGENCIA</option>
          </select>
        </div>
        <button (click)="crear()" [disabled]="!idCliente || !descripcion || !ubicacion">Crear</button>
      </div>

      <div class="card">
        <h3>Solicitudes pendientes</h3>
        <button class="secundario" (click)="cargarPendientes()">Actualizar</button>
        <table style="margin-top:.8rem">
          <thead><tr><th>ID</th><th>Descripcion</th><th>Tipo</th><th>Estado</th></tr></thead>
          <tbody>
            @for (s of pendientes; track s.id) {
              <tr>
                <td>{{ s.id }}</td><td>{{ s.descripcion }}</td>
                <td><span class="badge" [class.ambar]="s.tipo === 'EMERGENCIA'">{{ s.tipo }}</span></td>
                <td><span class="badge azul">{{ s.estado }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="4" style="color:var(--gris-500)">Sin solicitudes pendientes.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h3>Seguimiento del servicio</h3>
      <table>
        <thead><tr><th>ID</th><th>Descripcion</th><th>Estado</th><th>Tarifa</th><th>Acciones</th></tr></thead>
        <tbody>
          @for (s of seguimiento; track s.id) {
            <tr>
              <td>{{ s.id }}</td>
              <td>{{ s.descripcion }}<br><small style="color:var(--gris-500)">{{ s.tipo }}</small></td>
              <td><span class="badge" [class]="claseEstado(s.estado)">{{ s.estado }}</span></td>
              <td>{{ s.tarifaAcordada > 0 ? ('S/ ' + s.tarifaAcordada) : '-' }}</td>
              <td>
                <div style="display:flex;gap:.35rem;flex-wrap:wrap;align-items:center">
                  <button (click)="simple(s, 'publicar')" [disabled]="s.estado !== 'CREADA'">Publicar</button>
                  @if (s.estado === 'CREADA' || s.estado === 'PUBLICADA') {
                    <input type="number" [(ngModel)]="s._idProf" placeholder="ID tec" style="width:72px">
                    <input type="number" [(ngModel)]="s._tarifa" placeholder="Tarifa" style="width:80px">
                    <button class="exito" (click)="aceptar(s)" [disabled]="!s._idProf || !s._tarifa">Aceptar</button>
                  }
                  <button (click)="simple(s, 'iniciar')" [disabled]="s.estado !== 'ACEPTADA'">Iniciar</button>
                  <button (click)="simple(s, 'finalizar')" [disabled]="s.estado !== 'EN_CURSO'">Finalizar</button>
                  <button class="peligro" (click)="simple(s, 'cancelar')"
                    [disabled]="s.estado === 'EN_CURSO' || s.estado === 'FINALIZADA' || s.estado === 'CALIFICADA' || s.estado === 'CANCELADA'">Cancelar</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" style="color:var(--gris-500)">Crea una solicitud para empezar.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class SolicitudesComponent implements OnInit {
  idCliente: number | null = 1;
  descripcion = '';
  ubicacion = '';
  tipo = 'NORMAL';
  pendientes: Solicitud[] = [];
  seguimiento: Fila[] = [];
  mensaje = '';
  error = '';

  constructor(private svc: SolicitudService) {}

  ngOnInit(): void { this.cargarPendientes(); }

  crear(): void {
    this.limpiar();
    this.svc.crear(this.idCliente!, this.descripcion, this.ubicacion, this.tipo).subscribe({
      next: (s) => {
        this.seguimiento = [s as Fila, ...this.seguimiento];
        this.mensaje = `Solicitud #${s.id} creada.`;
        this.descripcion = ''; this.ubicacion = '';
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  simple(s: Fila, metodo: 'publicar' | 'iniciar' | 'finalizar' | 'cancelar'): void {
    this.limpiar();
    this.svc[metodo](s.id).subscribe({
      next: (act) => { this.reemplazar(act); this.cargarPendientes(); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  aceptar(s: Fila): void {
    this.limpiar();
    this.svc.aceptar(s.id, s._idProf!, s._tarifa!).subscribe({
      next: (act) => {
        this.reemplazar(act);
        this.mensaje = `Solicitud #${act.id} aceptada. El backend emitio el evento (notificacion al cliente).`;
        this.cargarPendientes();
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  cargarPendientes(): void {
    this.svc.pendientes().subscribe({
      next: (l) => this.pendientes = l,
      error: (e) => this.error = this.textoError(e)
    });
  }

  claseEstado(estado: EstadoSolicitud): string {
    switch (estado) {
      case 'FINALIZADA':
      case 'CALIFICADA': return 'verde';
      case 'ACEPTADA':
      case 'EN_CURSO':
      case 'PUBLICADA': return 'azul';
      case 'CANCELADA': return 'rojo';
      default: return 'ambar';
    }
  }

  private reemplazar(s: Solicitud): void {
    this.seguimiento = this.seguimiento.map(x => x.id === s.id ? { ...x, ...s } : x);
  }
  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
