import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { ProfesionalService } from '../../services/profesional.service';
import { ReputacionService } from '../../services/reputacion.service';
import { OfertaService } from '../../services/oferta.service';
import { PerfilService } from '../../services/perfil.service';
import { Solicitud, Profesional, Reputacion, Oferta, Categoria, EstadoSolicitud } from '../../core/models';

type Fila = Solicitud & { _tarifa?: number; _tiempo?: number };

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-head">
      <div class="row" style="justify-content:space-between">
        <div>
          <h1>Panel del tecnico</h1>
          <div class="sub">Toma solicitudes normales, oferta en emergencias y atiende el servicio.</div>
        </div>
        <div>
          <label style="font-size:.72rem;color:var(--gris-500);font-weight:600">Tecnico</label>
          <select [(ngModel)]="idProfesional" (ngModelChange)="cargarTodo()" style="min-width:190px">
            @for (t of tecnicos; track t.id) { <option [ngValue]="t.id">{{ t.nombre }} (#{{ t.id }})</option> }
          </select>
        </div>
      </div>
    </div>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <div class="stats">
      <div class="stat azul"><div class="n">{{ reputacion?.calificacionPromedio ?? 0 }}</div><div class="l">Reputacion</div></div>
      <div class="stat"><div class="n">{{ reputacion?.totalServicios ?? 0 }}</div><div class="l">Servicios</div></div>
      <div class="stat verde"><div class="n">{{ activos() }}</div><div class="l">Trabajos activos</div></div>
      <div class="stat ambar"><div class="n">{{ disponibles.length }}</div><div class="l">Disponibles</div></div>
    </div>

    <div class="card" style="margin-top:1.2rem">
      <h3>Mi perfil</h3>
      <div class="campo">
        <label>Descripcion (vitrina)</label>
        <textarea [(ngModel)]="perfilDescripcion" rows="2" placeholder="Cuentale a los clientes tu experiencia"></textarea>
      </div>
      <div class="campo">
        <label>Categorias que atiendo</label>
        <div class="row">
          @for (c of categorias; track c.id) {
            <label class="badge" [class.azul]="catSel.has(c.id)" style="cursor:pointer;font-weight:600">
              <input type="checkbox" [checked]="catSel.has(c.id)" (change)="toggleCat(c.id)" style="width:auto;margin-right:.3rem">
              {{ c.oficio }}: {{ c.nombre }} (S/ {{ c.tarifaBaseReferencial }})
            </label>
          }
        </div>
      </div>
      <label class="row" style="font-size:.85rem;cursor:pointer">
        <input type="checkbox" [(ngModel)]="perfilDestacado" style="width:auto"> Perfil destacado
      </label>
      <button class="sm" style="margin-top:.6rem" (click)="guardarPerfil()">Guardar perfil</button>
    </div>

    <h2 style="margin-top:1.4rem">Solicitudes disponibles</h2>
    <div class="card">
      @for (s of disponiblesOrdenadas(); track s.id) {
        <div class="sol" [class.urgente]="s.tipo === 'EMERGENCIA'">
          <div class="info">
            <div class="t">
              #{{ s.id }} · {{ s.descripcion }}
              @if (s.tipo === 'EMERGENCIA') { <span class="badge rojo" style="margin-left:.4rem">EMERGENCIA</span> }
            </div>
            <div class="m">📍 {{ s.ubicacion }} · cliente #{{ s.idCliente }}</div>
          </div>
          <div class="row">
            @if (s.tipo === 'EMERGENCIA') {
              @if (ofertaDe(s.id); as o) {
                <span class="badge azul">Ya ofertaste: S/ {{ o.tarifaPropuesta }} · {{ o.tiempoEstimadoLlegada }} min</span>
              } @else {
                <input type="number" [(ngModel)]="asFila(s)._tarifa" placeholder="Tarifa S/" style="width:90px">
                <input type="number" [(ngModel)]="asFila(s)._tiempo" placeholder="min" style="width:66px">
                <button class="peligro sm" (click)="enviarOferta(s)" [disabled]="!asFila(s)._tarifa || !asFila(s)._tiempo">Enviar oferta</button>
              }
            } @else {
              <input type="number" [(ngModel)]="asFila(s)._tarifa" placeholder="Tarifa S/" style="width:96px">
              <button class="exito sm" (click)="aceptar(s)" [disabled]="!asFila(s)._tarifa">Aceptar</button>
            }
          </div>
        </div>
      } @empty {
        <div class="vacio">No hay solicitudes disponibles ahora.</div>
      }
    </div>

    @if (misOfertas.length) {
      <h2 style="margin-top:1.4rem">Mis ofertas</h2>
      <div class="card">
        @for (o of misOfertas; track o.id) {
          <div class="sol">
            <div class="info">
              <div class="t">Solicitud #{{ o.idSolicitud }}</div>
              <div class="m">S/ {{ o.tarifaPropuesta }} · llega en {{ o.tiempoEstimadoLlegada }} min</div>
            </div>
            <span class="badge" [class]="claseOferta(o.estado)">{{ etiquetaOferta(o.estado) }}</span>
          </div>
        }
      </div>
    }

    <h2 style="margin-top:1.4rem">Mis trabajos</h2>
    <div class="card">
      @for (s of trabajos; track s.id) {
        <div class="sol">
          <div class="info">
            <div class="t">#{{ s.id }} · {{ s.descripcion }}</div>
            <div class="m">📍 {{ s.ubicacion }} · S/ {{ s.tarifaAcordada }}</div>
          </div>
          <div class="row">
            <span class="badge" [class]="claseEstado(s.estado)">{{ etiquetaEstado(s.estado) }}</span>
            @switch (s.estado) {
              @case ('ACEPTADA') { <button class="sm" (click)="accion(s,'iniciar')">Iniciar</button> }
              @case ('EN_CURSO') { <button class="exito sm" (click)="accion(s,'finalizar')">Finalizar</button> }
              @default {}
            }
          </div>
        </div>
      } @empty {
        <div class="vacio">Aun no tienes trabajos asignados.</div>
      }
    </div>
  `
})
export class TecnicoComponent implements OnInit {
  tecnicos: Profesional[] = [];
  idProfesional = 1;

  disponibles: Fila[] = [];
  trabajos: Solicitud[] = [];
  misOfertas: Oferta[] = [];
  reputacion: Reputacion | null = null;

  categorias: Categoria[] = [];
  perfilDescripcion = '';
  perfilDestacado = false;
  catSel = new Set<number>();

  mensaje = '';
  error = '';

  constructor(
    private svc: SolicitudService,
    private profSvc: ProfesionalService,
    private rep: ReputacionService,
    private ofe: OfertaService,
    private perfilSvc: PerfilService
  ) {}

  ngOnInit(): void {
    this.perfilSvc.listarCategorias().subscribe({ next: (c) => this.categorias = c, error: () => this.categorias = [] });
    this.profSvc.listarActivos().subscribe({
      next: (l) => {
        this.tecnicos = l;
        if (l.length && !l.some(t => t.id === this.idProfesional)) this.idProfesional = l[0].id;
        this.cargarTodo();
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  toggleCat(id: number): void { this.catSel.has(id) ? this.catSel.delete(id) : this.catSel.add(id); }

  cargarPerfil(): void {
    this.perfilSvc.obtener(this.idProfesional).subscribe({
      next: (p) => {
        this.perfilDescripcion = p.descripcion;
        this.perfilDestacado = p.destacado;
        this.catSel = new Set(p.categorias.map(c => c.id));
      },
      error: () => {}
    });
  }

  guardarPerfil(): void {
    this.limpiar();
    this.perfilSvc.actualizar(this.idProfesional, this.perfilDescripcion, this.perfilDestacado, [...this.catSel]).subscribe({
      next: () => this.mensaje = 'Perfil actualizado.',
      error: (e) => this.error = this.textoError(e)
    });
  }

  asFila(s: Solicitud): Fila { return s as Fila; }
  activos(): number { return this.trabajos.filter(t => t.estado === 'ACEPTADA' || t.estado === 'EN_CURSO').length; }
  private ubicacion(): string { return this.tecnicos.find(t => t.id === this.idProfesional)?.ubicacion ?? ''; }

  disponiblesOrdenadas(): Fila[] {
    return [...this.disponibles].sort((a, b) =>
      (a.tipo === 'EMERGENCIA' ? 0 : 1) - (b.tipo === 'EMERGENCIA' ? 0 : 1));
  }

  // via normal: aceptar directo
  aceptar(s: Fila): void {
    this.limpiar();
    this.svc.aceptar(s.id, this.idProfesional, s._tarifa!).subscribe({
      next: () => { this.mensaje = `Aceptaste la solicitud #${s.id}. Se notifico al cliente.`; this.cargarTodo(); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  // via emergencia: enviar oferta (el cliente elegira)
  enviarOferta(s: Fila): void {
    this.limpiar();
    this.ofe.enviar(s.id, this.idProfesional, s._tarifa!, s._tiempo!, this.ubicacion()).subscribe({
      next: () => { this.mensaje = `Oferta enviada a la solicitud #${s.id}. El cliente decidira.`; this.cargarTodo(); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  accion(s: Solicitud, metodo: 'iniciar' | 'finalizar'): void {
    this.limpiar();
    this.svc[metodo](s.id).subscribe({
      next: () => {
        if (metodo === 'finalizar') this.mensaje = `Servicio #${s.id} finalizado. Se proceso el pago y se notifico al cliente.`;
        this.cargarTodo();
      },
      error: (e) => this.error = this.textoError(e)
    });
  }

  cargarTodo(): void {
    this.svc.pendientes().subscribe({ next: (l) => this.disponibles = l as Fila[], error: (e) => this.error = this.textoError(e) });
    this.svc.porProfesional(this.idProfesional).subscribe({ next: (l) => this.trabajos = l, error: (e) => this.error = this.textoError(e) });
    this.ofe.porProfesional(this.idProfesional).subscribe({ next: (l) => this.misOfertas = l, error: () => this.misOfertas = [] });
    this.rep.consultar(this.idProfesional).subscribe({ next: (r) => this.reputacion = r, error: () => this.reputacion = null });
    this.cargarPerfil();
  }

  /** Oferta activa (ENVIADA) que este tecnico ya envio a una solicitud. */
  ofertaDe(idSolicitud: number): Oferta | undefined {
    return this.misOfertas.find(o => o.idSolicitud === idSolicitud && o.estado === 'ENVIADA');
  }
  claseOferta(estado: string): string {
    if (estado === 'ACEPTADA') return 'verde';
    if (estado === 'RECHAZADA') return 'rojo';
    return 'azul';
  }
  etiquetaOferta(estado: string): string {
    if (estado === 'ACEPTADA') return 'Aceptada';
    if (estado === 'RECHAZADA') return 'No elegida';
    return 'Enviada';
  }

  claseEstado(estado: EstadoSolicitud): string {
    switch (estado) {
      case 'FINALIZADA': case 'CALIFICADA': return 'verde';
      case 'ACEPTADA': case 'EN_CURSO': return 'azul';
      case 'CANCELADA': return 'rojo';
      default: return 'ambar';
    }
  }
  etiquetaEstado(estado: EstadoSolicitud): string {
    const m: Record<EstadoSolicitud, string> = {
      CREADA: 'Creada', PUBLICADA: 'Publicada', ACEPTADA: 'Aceptada', EN_CURSO: 'En proceso',
      FINALIZADA: 'Finalizada', CALIFICADA: 'Calificada', CANCELADA: 'Cancelada'
    };
    return m[estado] ?? estado;
  }
  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
