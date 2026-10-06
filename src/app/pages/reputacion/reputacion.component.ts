import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReputacionService } from '../../services/reputacion.service';
import { Reputacion } from '../../core/models';

@Component({
  selector: 'app-reputacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Reputacion</h1>
    <p style="color:var(--gris-500);margin-top:0">
      Calificar un servicio finalizado y consultar la reputacion de un tecnico.
    </p>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <div class="grid grid-2">
      <div class="card">
        <h3>Calificar servicio</h3>
        <div class="campo">
          <label>ID de la solicitud (finalizada)</label>
          <input type="number" [(ngModel)]="idSolicitud" placeholder="1">
        </div>
        <div class="campo">
          <label>ID del tecnico</label>
          <input type="number" [(ngModel)]="idProfesional" placeholder="1">
        </div>
        <div class="campo">
          <label>Puntaje (1 a 5)</label>
          <select [(ngModel)]="puntaje">
            <option [ngValue]="5">5 - Excelente</option>
            <option [ngValue]="4">4 - Bueno</option>
            <option [ngValue]="3">3 - Regular</option>
            <option [ngValue]="2">2 - Malo</option>
            <option [ngValue]="1">1 - Muy malo</option>
          </select>
        </div>
        <div class="campo">
          <label>Comentario</label>
          <textarea [(ngModel)]="comentario" rows="2" placeholder="Puntual y ordenado"></textarea>
        </div>
        <button (click)="calificar()" [disabled]="!idSolicitud || !idProfesional">Calificar</button>
      </div>

      <div class="card">
        <h3>Consultar reputacion</h3>
        <div class="campo">
          <label>ID del tecnico</label>
          <input type="number" [(ngModel)]="idConsulta" placeholder="1">
        </div>
        <button class="secundario" (click)="consultar()" [disabled]="!idConsulta">Consultar</button>

        @if (resultado) {
          <div style="margin-top:1rem;text-align:center">
            <div style="font-size:2.4rem;font-weight:700;color:var(--azul)">
              {{ resultado.calificacionPromedio }}
            </div>
            <div style="color:var(--gris-500);font-size:.85rem">
              promedio sobre 5 ({{ resultado.totalServicios }} servicios)
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ReputacionComponent {
  idSolicitud: number | null = null;
  idProfesional: number | null = null;
  puntaje = 5;
  comentario = '';

  idConsulta: number | null = null;
  resultado: Reputacion | null = null;

  mensaje = '';
  error = '';

  constructor(private svc: ReputacionService) {}

  calificar(): void {
    this.limpiar();
    this.svc.calificar(this.idSolicitud!, this.idProfesional!, this.puntaje, this.comentario).subscribe({
      next: (r) => {
        this.resultado = r;
        this.idConsulta = r.idProfesional;
        this.mensaje = `Calificacion registrada. Nuevo promedio del tecnico: ${r.calificacionPromedio}.`;
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  consultar(): void {
    this.limpiar();
    this.svc.consultar(this.idConsulta!).subscribe({
      next: (r) => this.resultado = r,
      error: (e) => this.error = this.textoError(e)
    });
  }

  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
