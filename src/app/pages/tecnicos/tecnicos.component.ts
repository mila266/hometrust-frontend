import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional.service';
import { Profesional, EstadoVerificacion } from '../../core/models';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Tecnicos</h1>
    <p style="color:var(--gris-500);margin-top:0">
      Registro y verificacion de tecnicos (subsistema Perfiles, maquina de estados).
    </p>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <div class="grid grid-2">
      <div class="card">
        <h3>Registrar tecnico</h3>
        <div class="campo">
          <label>Nombre</label>
          <input [(ngModel)]="nombre" placeholder="Carlos Ramirez">
        </div>
        <div class="campo">
          <label>Ubicacion</label>
          <input [(ngModel)]="ubicacion" placeholder="San Miguel, Lima">
        </div>
        <button (click)="registrar()" [disabled]="!nombre || !ubicacion">Registrar</button>
      </div>

      <div class="card">
        <h3>Tecnicos activos (panel del cliente)</h3>
        <button class="secundario" (click)="cargarActivos()">Actualizar</button>
        <table style="margin-top:.8rem">
          <thead><tr><th>ID</th><th>Nombre</th><th>Ubicacion</th></tr></thead>
          <tbody>
            @for (p of activos; track p.id) {
              <tr><td>{{ p.id }}</td><td>{{ p.nombre }}</td><td>{{ p.ubicacion }}</td></tr>
            } @empty {
              <tr><td colspan="3" style="color:var(--gris-500)">Sin tecnicos activos.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:1rem">
      <h3>Seguimiento de verificacion</h3>
      <p style="color:var(--gris-500);font-size:.85rem;margin-top:0">
        Avanza la maquina de estados de cada tecnico que registres en esta sesion.
      </p>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          @for (p of seguimiento; track p.id) {
            <tr>
              <td>{{ p.id }}</td>
              <td>{{ p.nombre }}</td>
              <td><span class="badge" [class]="claseEstado(p.estado)">{{ p.estado }}</span></td>
              <td style="display:flex;gap:.35rem;flex-wrap:wrap">
                <button (click)="accion(p, 'enviarDocumentos')" [disabled]="p.estado !== 'REGISTRADO' && p.estado !== 'DOCUMENTACION_INCOMPLETA'">Enviar docs</button>
                <button (click)="accion(p, 'revisar')" [disabled]="p.estado !== 'DOCUMENTOS_ENVIADOS'">Revisar</button>
                <button class="exito" (click)="accion(p, 'aprobar')" [disabled]="p.estado !== 'EN_REVISION'">Aprobar</button>
                <button class="peligro" (click)="accion(p, 'rechazar')" [disabled]="p.estado !== 'EN_REVISION'">Rechazar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" style="color:var(--gris-500)">Registra un tecnico para empezar.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class TecnicosComponent implements OnInit {
  nombre = '';
  ubicacion = '';
  activos: Profesional[] = [];
  seguimiento: Profesional[] = [];
  mensaje = '';
  error = '';

  constructor(private svc: ProfesionalService) {}

  ngOnInit(): void { this.cargarActivos(); }

  registrar(): void {
    this.limpiar();
    this.svc.registrar(this.nombre, this.ubicacion).subscribe({
      next: (p) => {
        this.seguimiento = [p, ...this.seguimiento];
        this.mensaje = `Tecnico "${p.nombre}" registrado con ID ${p.id}.`;
        this.nombre = ''; this.ubicacion = '';
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  accion(p: Profesional, metodo: 'enviarDocumentos' | 'revisar' | 'aprobar' | 'rechazar'): void {
    this.limpiar();
    this.svc[metodo](p.id).subscribe({
      next: (actualizado) => {
        this.reemplazar(actualizado);
        if (actualizado.estado === 'ACTIVO') this.cargarActivos();
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  cargarActivos(): void {
    this.svc.listarActivos().subscribe({
      next: (lista) => this.activos = lista,
      error: (e) => this.error = this.textoError(e)
    });
  }

  claseEstado(estado: EstadoVerificacion): string {
    if (estado === 'ACTIVO') return 'verde';
    if (estado === 'EN_REVISION' || estado === 'DOCUMENTOS_ENVIADOS') return 'azul';
    if (estado === 'RECHAZADO' || estado === 'SUSPENDIDO') return 'rojo';
    return 'ambar';
  }

  private reemplazar(p: Profesional): void {
    this.seguimiento = this.seguimiento.map(x => x.id === p.id ? p : x);
  }
  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
