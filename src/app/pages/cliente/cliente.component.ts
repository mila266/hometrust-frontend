import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SolicitudService } from '../../services/solicitud.service';
import { ProfesionalService } from '../../services/profesional.service';
import { ReputacionService } from '../../services/reputacion.service';
import { OfertaService } from '../../services/oferta.service';
import { PerfilService } from '../../services/perfil.service';
import { FavoritosService } from '../../services/favoritos.service';
import { Solicitud, TecnicoDirectorio, Oferta, EstadoSolicitud } from '../../core/models';

type Fila = Solicitud & { _puntaje?: number; _comentario?: string };

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-head">
      <div class="row" style="justify-content:space-between">
        <div>
          <h1>Hola 👋</h1>
          <div class="sub">Pide un servicio tecnico de confianza para tu hogar.</div>
        </div>
        <div>
          <label style="font-size:.72rem;color:var(--gris-500);font-weight:600">Cuenta</label>
          <select [(ngModel)]="idCliente" (ngModelChange)="cambioCliente()" style="min-width:170px">
            @for (c of clientes; track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
          </select>
        </div>
      </div>
    </div>

    <div class="subnav">
      <button [class.on]="vista==='pedir'" (click)="vista='pedir'">Pedir servicio</button>
      <button [class.on]="vista==='directorio'" (click)="irDirectorio()">Directorio</button>
      <button [class.on]="vista==='favoritos'" (click)="irFavoritos()">Favoritos</button>
      <button [class.on]="vista==='solicitudes'" (click)="irSolicitudes()">Mis solicitudes</button>
    </div>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <!-- ============ PEDIR: TRES VIAS ============ -->
    @if (vista === 'pedir') {
      <div class="hero" style="grid-template-columns:1fr 1fr 1fr">
        <div class="accion normal" [class.sel]="modo==='normal'" (click)="modo='normal'">
          <div class="ico">🛠️</div><h3>Servicio normal</h3>
          <p>Publica tu solicitud en el panel; un tecnico verificado la toma.</p>
        </div>
        <div class="accion" [class.sel]="modo==='confianza'" (click)="modo='confianza'"
             style="background:linear-gradient(135deg,#ecfdf5,#fff);border-color:#ecfdf5">
          <div class="ico">⭐</div><h3>Profesional de confianza</h3>
          <p>Envialo directo a un tecnico que ya conoces. Se omite el panel.</p>
        </div>
        <div class="accion emergencia" [class.sel]="modo==='emergencia'" (click)="modo='emergencia'">
          <div class="ico">🚨</div><h3>Emergencia</h3>
          <p>Se difunde a los disponibles. Recibes ofertas y eliges la mejor.</p>
        </div>
      </div>

      <div class="card" style="margin-top:1rem">
        <h3>
          @switch (modo) {
            @case ('confianza') { Enviar a un tecnico de confianza }
            @case ('emergencia') { Describe tu emergencia }
            @default { Describe el servicio }
          }
        </h3>
        @if (modo === 'confianza') {
          <div class="grid grid-2">
            <div class="campo">
              <label>Tecnico</label>
              <select [(ngModel)]="confTecnico">
                <option [ngValue]="null" disabled>Elige un tecnico</option>
                @for (t of directorio; track t.id) {
                  <option [ngValue]="t.id">{{ t.nombre }} · {{ t.oficio }} · ★ {{ t.reputacionPromedio }}{{ t.favorito ? ' · favorito' : '' }}</option>
                }
              </select>
            </div>
            <div class="campo">
              <label>Tarifa acordada (S/)</label>
              <input type="number" [(ngModel)]="confTarifa" placeholder="80">
            </div>
          </div>
        }
        <div class="grid grid-2">
          <div class="campo"><label>Que necesitas</label><input [(ngModel)]="descripcion" placeholder="Ej. fuga de agua en la cocina"></div>
          <div class="campo"><label>Direccion</label><input [(ngModel)]="ubicacion" placeholder="Ej. San Miguel, Lima"></div>
        </div>
        <button [class.peligro]="modo==='emergencia'" [class.exito]="modo==='confianza'"
                (click)="pedir()" [disabled]="!puedePedir()">
          @switch (modo) {
            @case ('confianza') { Enviar a mi tecnico }
            @case ('emergencia') { Pedir ayuda ahora }
            @default { Publicar solicitud }
          }
        </button>
      </div>
    }

    <!-- ============ DIRECTORIO / FAVORITOS ============ -->
    @if (vista === 'directorio' || vista === 'favoritos') {
      <h2>{{ vista === 'favoritos' ? 'Tus tecnicos favoritos' : 'Tecnicos disponibles' }}</h2>

      @if (vista === 'directorio') {
        <div class="card" style="margin-bottom:1rem">
          <div class="grid grid-3">
            <div class="campo" style="margin:0">
              <label>Oficio</label>
              <select [(ngModel)]="filtroOficio">
                <option value="">Todos</option>
                @for (o of oficios(); track o) { <option [value]="o">{{ o }}</option> }
              </select>
            </div>
            <div class="campo" style="margin:0">
              <label>Reputacion minima</label>
              <select [(ngModel)]="filtroRepMin">
                <option [ngValue]="0">Cualquiera</option>
                <option [ngValue]="3">3+</option><option [ngValue]="4">4+</option><option [ngValue]="4.5">4.5+</option>
              </select>
            </div>
            <div class="campo" style="margin:0">
              <label>Ordenar por</label>
              <select [(ngModel)]="orden">
                <option value="reputacion">Mejor reputacion</option>
                <option value="tarifa">Menor tarifa</option>
              </select>
            </div>
          </div>
        </div>
      }

      <div class="tec-grid">
        @for (t of listaMostrada(); track t.id) {
          <div class="tec">
            <button class="fav" [class.on]="t.favorito" (click)="toggleFav(t)">{{ t.favorito ? '♥' : '♡' }}</button>
            <div class="top">
              <div class="avatar">{{ inicial(t.nombre) }}</div>
              <div>
                <div class="nom">{{ t.nombre }} @if (t.destacado) { <span class="badge ambar" style="font-size:.6rem">★ Destacado</span> }</div>
                <div class="ubi">📍 {{ t.ubicacion }}</div>
              </div>
            </div>
            <div class="rep">
              <span class="stars">{{ estrellas(t.reputacionPromedio) }}</span>
              <strong>{{ t.reputacionPromedio }}</strong>
              <span style="color:var(--gris-500)">({{ t.totalServicios }})</span>
            </div>
            <div class="row" style="gap:.3rem;margin-top:.5rem;flex-wrap:wrap">
              @for (c of t.categorias; track c.id) {
                <span class="badge azul" style="font-size:.66rem">{{ c.oficio }}: {{ c.nombre }} · S/ {{ c.tarifaBaseReferencial }}</span>
              } @empty {
                <span class="badge gris" style="font-size:.66rem">sin categorias</span>
              }
            </div>
            @if (t.descripcion) { <p style="font-size:.78rem;color:var(--gris-500);margin-top:.5rem">{{ t.descripcion }}</p> }
            <div class="row" style="justify-content:space-between;margin-top:.6rem">
              <span class="badge gris">desde S/ {{ t.tarifaDesde }}</span>
              <button class="sm exito" (click)="pedirA(t)">Pedir directo</button>
            </div>
          </div>
        } @empty {
          <div class="vacio">{{ vista === 'favoritos' ? 'Aun no tienes favoritos. Marca el corazon en el directorio.' : 'No hay tecnicos que cumplan el filtro.' }}</div>
        }
      </div>
    }

    <!-- ============ MIS SOLICITUDES ============ -->
    @if (vista === 'solicitudes') {
      <div class="row" style="justify-content:space-between">
        <h2 style="margin:0">Mis solicitudes</h2>
        <button class="secundario sm" (click)="cargarSolicitudes()">Actualizar</button>
      </div>
      <div class="card" style="margin-top:.8rem">
        @for (s of solicitudes; track s.id) {
          <div class="sol" [class.urgente]="s.tipo === 'EMERGENCIA' && s.estado !== 'CALIFICADA' && s.estado !== 'CANCELADA'">
            <div class="info">
              <div class="t">
                #{{ s.id }} · {{ s.descripcion }}
                @if (s.tipo === 'EMERGENCIA') { <span class="badge rojo" style="margin-left:.4rem">EMERGENCIA</span> }
              </div>
              <div class="m">
                📍 {{ s.ubicacion }}
                @if (s.idProfesional) { · Tecnico #{{ s.idProfesional }} · S/ {{ s.tarifaAcordada }} }
                @else { · sin asignar }
              </div>
            </div>
            <div class="row">
              <span class="badge" [class]="claseEstado(s.estado)">{{ etiquetaEstado(s.estado) }}</span>
              @if (s.tipo === 'EMERGENCIA' && s.estado === 'PUBLICADA') {
                <button class="sm" (click)="verOfertas(s.id)">Ver ofertas</button>
              }
              @switch (s.estado) {
                @case ('CREADA') { <button class="sm" (click)="accion(s,'publicar')">Publicar</button>
                                   <button class="peligro sm" (click)="accion(s,'cancelar')">Cancelar</button> }
                @case ('PUBLICADA') { <button class="peligro sm" (click)="accion(s,'cancelar')">Cancelar</button> }
                @case ('FINALIZADA') {
                  <select [(ngModel)]="asFila(s)._puntaje" class="sm" style="width:58px">
                    <option [ngValue]="5">5</option><option [ngValue]="4">4</option>
                    <option [ngValue]="3">3</option><option [ngValue]="2">2</option><option [ngValue]="1">1</option>
                  </select>
                  <input [(ngModel)]="asFila(s)._comentario" placeholder="comentario" style="width:130px">
                  <button class="exito sm" (click)="calificar(s)">Calificar</button>
                }
                @default {}
              }
            </div>
          </div>
          @if (ofertas[s.id]) {
            <div style="padding:.3rem 0 1rem 1rem">
              @for (o of ofertas[s.id]; track o.id) {
                <div class="row" style="justify-content:space-between;border-left:2px solid var(--gris-200);padding:.5rem .8rem;margin-top:.4rem">
                  <div style="font-size:.85rem">
                    Tecnico #{{ o.idProfesional }} · <strong>S/ {{ o.tarifaPropuesta }}</strong> · llega en {{ o.tiempoEstimadoLlegada }} min
                    @if (o.estado !== 'ENVIADA') { <span class="badge gris" style="margin-left:.3rem">{{ o.estado }}</span> }
                  </div>
                  @if (o.estado === 'ENVIADA') { <button class="exito sm" (click)="elegirOferta(o)">Elegir</button> }
                </div>
              } @empty {
                <div class="vacio" style="text-align:left">Aun no llegan ofertas. Actualiza en unos segundos.</div>
              }
            </div>
          }
        } @empty {
          <div class="vacio">Aun no tienes solicitudes. Pide un servicio para empezar.</div>
        }
      </div>
    }
  `
})
export class ClienteComponent implements OnInit {
  clientes = [{ id: 1, nombre: 'Familia Quispe' }, { id: 2, nombre: 'Sr. Herrera' }];
  idCliente = 1;

  vista: 'pedir' | 'directorio' | 'favoritos' | 'solicitudes' = 'pedir';
  modo: 'normal' | 'confianza' | 'emergencia' = 'normal';

  descripcion = '';
  ubicacion = '';
  confTecnico: number | null = null;
  confTarifa: number | null = null;

  filtroOficio = '';
  filtroRepMin = 0;
  orden: 'reputacion' | 'tarifa' = 'reputacion';

  directorio: TecnicoDirectorio[] = [];
  favSet = new Set<number>();
  solicitudes: Fila[] = [];
  ofertas: Record<number, Oferta[]> = {};
  mensaje = '';
  error = '';

  constructor(
    private svc: SolicitudService,
    private profSvc: ProfesionalService,
    private rep: ReputacionService,
    private ofe: OfertaService,
    private perfilSvc: PerfilService,
    private fav: FavoritosService
  ) {}

  ngOnInit(): void { this.cargarDirectorio(); }

  asFila(s: Solicitud): Fila { return s as Fila; }

  puedePedir(): boolean {
    if (!this.descripcion || !this.ubicacion) return false;
    if (this.modo === 'confianza') return !!this.confTecnico && !!this.confTarifa;
    return true;
  }
  pedir(): void {
    this.limpiar();
    if (this.modo === 'confianza') {
      this.svc.solicitarDirecto(this.idCliente, this.descripcion, this.ubicacion, this.confTecnico!, this.confTarifa!).subscribe({
        next: () => { this.mensaje = 'Solicitud enviada directo a tu tecnico de confianza.'; this.tras(); },
        error: (e) => this.error = this.textoError(e)
      });
      return;
    }
    const tipo = this.modo === 'emergencia' ? 'EMERGENCIA' : 'NORMAL';
    this.svc.crear(this.idCliente, this.descripcion, this.ubicacion, tipo).subscribe({
      next: (s) => this.svc.publicar(s.id).subscribe({
        next: () => {
          this.mensaje = this.modo === 'emergencia'
            ? 'Emergencia difundida. Los tecnicos cercanos enviaran ofertas.'
            : 'Solicitud publicada. Pronto un tecnico la aceptara.';
          this.tras();
        },
        error: (e) => this.error = this.textoError(e)
      }),
      error: (e) => this.error = this.textoError(e)
    });
  }
  private tras(): void { this.descripcion = ''; this.ubicacion = ''; this.confTarifa = null; this.irSolicitudes(); }
  pedirA(t: TecnicoDirectorio): void { this.modo = 'confianza'; this.confTecnico = t.id; this.vista = 'pedir'; }

  cargarDirectorio(): void {
    this.fav.listar(this.idCliente).subscribe({
      next: (ids) => {
        this.favSet = new Set(ids);
        this.construirDirectorio();
      },
      error: () => { this.favSet = new Set(); this.construirDirectorio(); }
    });
  }
  private construirDirectorio(): void {
    this.profSvc.listarActivos().subscribe({
      next: (activos) => {
        if (!activos.length) { this.directorio = []; return; }
        forkJoin(activos.map(a => forkJoin({
          rep: this.rep.consultar(a.id),
          perfil: this.perfilSvc.obtener(a.id)
        }))).subscribe({
          next: (datos) => this.directorio = activos.map((a, i) => ({
            id: a.id, nombre: a.nombre, ubicacion: a.ubicacion,
            reputacionPromedio: datos[i].rep.calificacionPromedio,
            totalServicios: datos[i].rep.totalServicios,
            favorito: this.favSet.has(a.id),
            oficio: datos[i].perfil.oficioPrincipal,
            tarifaDesde: datos[i].perfil.tarifaDesde,
            descripcion: datos[i].perfil.descripcion,
            destacado: datos[i].perfil.destacado,
            categorias: datos[i].perfil.categorias
          })),
          error: (e) => this.error = this.textoError(e)
        });
      },
      error: (e) => this.error = this.textoError(e)
    });
  }
  oficios(): string[] {
    return [...new Set(this.directorio.map(t => t.oficio).filter(o => o && o !== 'Sin categoria'))];
  }
  listaMostrada(): TecnicoDirectorio[] {
    let base = this.vista === 'favoritos' ? this.directorio.filter(t => t.favorito) : this.directorio;
    if (this.vista === 'directorio') {
      if (this.filtroOficio) base = base.filter(t => t.categorias.some(c => c.oficio === this.filtroOficio));
      if (this.filtroRepMin) base = base.filter(t => t.reputacionPromedio >= this.filtroRepMin);
      base = [...base].sort((a, b) => this.orden === 'tarifa'
        ? a.tarifaDesde - b.tarifaDesde
        : b.reputacionPromedio - a.reputacionPromedio);
    }
    return base;
  }
  toggleFav(t: TecnicoDirectorio): void {
    const obs = t.favorito ? this.fav.quitar(this.idCliente, t.id) : this.fav.agregar(this.idCliente, t.id);
    obs.subscribe({
      next: () => { t.favorito = !t.favorito; t.favorito ? this.favSet.add(t.id) : this.favSet.delete(t.id); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  // ---- mis solicitudes ----
  cargarSolicitudes(): void {
    this.svc.porCliente(this.idCliente).subscribe({ next: (l) => this.solicitudes = l as Fila[], error: (e) => this.error = this.textoError(e) });
  }
  accion(s: Fila, metodo: 'publicar' | 'cancelar'): void {
    this.limpiar();
    this.svc[metodo](s.id).subscribe({ next: () => this.cargarSolicitudes(), error: (e) => this.error = this.textoError(e) });
  }
  calificar(s: Fila): void {
    this.limpiar();
    this.rep.calificar(s.id, s.idProfesional!, s._puntaje ?? 5, s._comentario ?? '').subscribe({
      next: (r) => { this.mensaje = `Gracias por calificar. Promedio del tecnico: ${r.calificacionPromedio}.`; this.cargarSolicitudes(); this.cargarDirectorio(); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  // ---- ofertas ----
  verOfertas(idSolicitud: number): void {
    this.ofe.porSolicitud(idSolicitud).subscribe({ next: (l) => this.ofertas = { ...this.ofertas, [idSolicitud]: l }, error: (e) => this.error = this.textoError(e) });
  }
  elegirOferta(o: Oferta): void {
    this.limpiar();
    this.ofe.aceptar(o.id).subscribe({
      next: () => { this.mensaje = `Elegiste al tecnico #${o.idProfesional}. La solicitud quedo asignada.`; delete this.ofertas[o.idSolicitud]; this.cargarSolicitudes(); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  // ---- navegacion ----
  irDirectorio(): void { this.vista = 'directorio'; this.cargarDirectorio(); }
  irFavoritos(): void { this.vista = 'favoritos'; this.cargarDirectorio(); }
  irSolicitudes(): void { this.vista = 'solicitudes'; this.cargarSolicitudes(); }
  cambioCliente(): void { this.cargarDirectorio(); if (this.vista === 'solicitudes') this.cargarSolicitudes(); }

  // ---- helpers ----
  inicial(n: string): string { return (n || '?').trim().charAt(0).toUpperCase(); }
  estrellas(prom: number): string { const f = Math.round(prom); return '★'.repeat(f) + '☆'.repeat(Math.max(0, 5 - f)); }
  claseEstado(estado: EstadoSolicitud): string {
    switch (estado) {
      case 'FINALIZADA': case 'CALIFICADA': return 'verde';
      case 'ACEPTADA': case 'EN_CURSO': case 'PUBLICADA': return 'azul';
      case 'CANCELADA': return 'rojo';
      default: return 'ambar';
    }
  }
  etiquetaEstado(estado: EstadoSolicitud): string {
    const m: Record<EstadoSolicitud, string> = {
      CREADA: 'Creada', PUBLICADA: 'Buscando tecnico', ACEPTADA: 'Tecnico asignado',
      EN_CURSO: 'En proceso', FINALIZADA: 'Por calificar', CALIFICADA: 'Finalizado', CANCELADA: 'Cancelada'
    };
    return m[estado] ?? estado;
  }
  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
