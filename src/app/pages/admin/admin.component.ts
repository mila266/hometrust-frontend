import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesionalService } from '../../services/profesional.service';
import { CategoriaService } from '../../services/categoria.service';
import { DocumentoService, Documento } from '../../services/documento.service';
import { Profesional, Categoria, EstadoVerificacion } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-head">
      <h1>Administracion</h1>
      <div class="sub">Verificacion de tecnicos, documentos y catalogo de categorias.</div>
    </div>

    <div class="subnav">
      <button [class.on]="vista==='tecnicos'" (click)="vista='tecnicos'">Tecnicos</button>
      <button [class.on]="vista==='categorias'" (click)="irCategorias()">Categorias de servicio</button>
    </div>

    @if (mensaje) { <div class="msg ok">{{ mensaje }}</div> }
    @if (error) { <div class="msg error">{{ error }}</div> }

    <!-- ============ TECNICOS ============ -->
    @if (vista === 'tecnicos') {
      <div class="stats">
        <div class="stat"><div class="n">{{ todos.length }}</div><div class="l">Tecnicos</div></div>
        <div class="stat verde"><div class="n">{{ cuenta('ACTIVO') }}</div><div class="l">Activos</div></div>
        <div class="stat azul"><div class="n">{{ cuenta('EN_REVISION') }}</div><div class="l">En revision</div></div>
        <div class="stat ambar"><div class="n">{{ cuenta('REGISTRADO') + cuenta('DOCUMENTOS_ENVIADOS') }}</div><div class="l">Por procesar</div></div>
      </div>

      <div class="card" style="margin-top:1.2rem">
        <h3>Registrar tecnico</h3>
        <div class="grid grid-2">
          <div class="campo"><label>Nombre</label><input [(ngModel)]="nombre" placeholder="Carlos Ramirez"></div>
          <div class="campo"><label>Ubicacion</label><input [(ngModel)]="ubicacion" placeholder="San Miguel, Lima"></div>
        </div>
        <button (click)="registrar()" [disabled]="!nombre || !ubicacion">Registrar</button>
      </div>

      <div class="row" style="justify-content:space-between;margin-top:1.3rem">
        <h2 style="margin:0">Todos los tecnicos</h2>
        <button class="secundario sm" (click)="cargar()">Actualizar</button>
      </div>
      <div class="card" style="margin-top:.7rem">
        <table>
          <thead><tr><th>#</th><th>Tecnico</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (p of todos; track p.id) {
              <tr>
                <td>{{ p.id }}</td>
                <td>
                  <div class="row">
                    <div class="avatar" style="width:34px;height:34px;font-size:.9rem">{{ inicial(p.nombre) }}</div>
                    <div><strong>{{ p.nombre }}</strong><br><small style="color:var(--gris-500)">📍 {{ p.ubicacion }}</small></div>
                  </div>
                </td>
                <td><span class="badge" [class]="claseEstado(p.estado)">{{ etiqueta(p.estado) }}</span></td>
                <td>
                  <div class="row">
                    <button class="sm" (click)="accion(p,'enviarDocumentos')" [disabled]="p.estado !== 'REGISTRADO' && p.estado !== 'DOCUMENTACION_INCOMPLETA'">Enviar docs</button>
                    <button class="sm" (click)="accion(p,'revisar')" [disabled]="p.estado !== 'DOCUMENTOS_ENVIADOS'">Revisar</button>
                    <button class="exito sm" (click)="accion(p,'aprobar')" [disabled]="p.estado !== 'EN_REVISION'">Aprobar</button>
                    <button class="peligro sm" (click)="accion(p,'rechazar')" [disabled]="p.estado !== 'EN_REVISION'">Rechazar</button>
                    <button class="sm" (click)="accion(p,'docIncompleta')" [disabled]="p.estado !== 'EN_REVISION'">Docs incompletos</button>
                    <button class="peligro sm" (click)="accion(p,'suspender')" [disabled]="p.estado !== 'ACTIVO'">Suspender</button>
                    <button class="exito sm" (click)="accion(p,'reactivar')" [disabled]="p.estado !== 'SUSPENDIDO'">Reactivar</button>
                    <button class="secundario sm" (click)="toggleDocs(p.id)">Documentos</button>
                  </div>
                </td>
              </tr>
              @if (docsTecnico === p.id) {
                <tr><td colspan="4" style="background:var(--gris-50)">
                  <strong style="font-size:.85rem">Documentos de {{ p.nombre }}</strong>
                  <table style="margin:.5rem 0">
                    <thead><tr><th>Tipo</th><th>URL</th><th>Estado</th></tr></thead>
                    <tbody>
                      @for (d of docs; track d.id) {
                        <tr><td>{{ d.tipo }}</td><td><a [href]="d.url" target="_blank">{{ d.url }}</a></td><td><span class="badge gris">{{ d.estado }}</span></td></tr>
                      } @empty { <tr><td colspan="3" style="color:var(--gris-500)">Sin documentos.</td></tr> }
                    </tbody>
                  </table>
                  <div class="row">
                    <input [(ngModel)]="nuevoTipo" placeholder="Tipo (DNI, Certificado...)" style="width:200px">
                    <input [(ngModel)]="nuevoUrl" placeholder="https://..." style="width:260px">
                    <button class="sm" (click)="subirDoc(p.id)" [disabled]="!nuevoTipo || !nuevoUrl">Subir documento</button>
                  </div>
                </td></tr>
              }
            } @empty {
              <tr><td colspan="4" class="vacio">Sin tecnicos registrados.</td></tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- ============ CATEGORIAS ============ -->
    @if (vista === 'categorias') {
      <div class="card">
        <h3>{{ catEdit ? 'Editar categoria' : 'Nueva categoria' }}</h3>
        <div class="grid grid-3">
          <div class="campo"><label>Nombre del servicio</label><input [(ngModel)]="catNombre" placeholder="Fuga de agua"></div>
          <div class="campo"><label>Oficio</label><input [(ngModel)]="catOficio" placeholder="Gasfiteria"></div>
          <div class="campo"><label>Tarifa base (S/)</label><input type="number" [(ngModel)]="catTarifa" placeholder="60"></div>
        </div>
        <div class="row">
          <button (click)="guardarCat()" [disabled]="!catNombre || !catOficio || !catTarifa">{{ catEdit ? 'Guardar cambios' : 'Crear categoria' }}</button>
          @if (catEdit) { <button class="secundario" (click)="cancelarEdit()">Cancelar</button> }
        </div>
      </div>

      <div class="card" style="margin-top:1rem">
        <table>
          <thead><tr><th>#</th><th>Servicio</th><th>Oficio</th><th>Tarifa base</th><th></th></tr></thead>
          <tbody>
            @for (c of categorias; track c.id) {
              <tr>
                <td>{{ c.id }}</td><td>{{ c.nombre }}</td><td>{{ c.oficio }}</td><td>S/ {{ c.tarifaBaseReferencial }}</td>
                <td><div class="row">
                  <button class="sm secundario" (click)="editarCat(c)">Editar</button>
                  <button class="sm peligro" (click)="eliminarCat(c)">Eliminar</button>
                </div></td>
              </tr>
            } @empty { <tr><td colspan="5" class="vacio">Sin categorias.</td></tr> }
          </tbody>
        </table>
      </div>
    }
  `
})
export class AdminComponent implements OnInit {
  vista: 'tecnicos' | 'categorias' = 'tecnicos';

  nombre = '';
  ubicacion = '';
  todos: Profesional[] = [];

  docsTecnico: number | null = null;
  docs: Documento[] = [];
  nuevoTipo = '';
  nuevoUrl = '';

  categorias: Categoria[] = [];
  catEdit: number | null = null;
  catNombre = '';
  catOficio = '';
  catTarifa: number | null = null;

  mensaje = '';
  error = '';

  constructor(
    private svc: ProfesionalService,
    private catSvc: CategoriaService,
    private docSvc: DocumentoService
  ) {}

  ngOnInit(): void { this.cargar(); }

  // ---- tecnicos ----
  cargar(): void {
    this.svc.listarTodos().subscribe({ next: (l) => this.todos = l, error: (e) => this.error = this.textoError(e) });
  }
  cuenta(estado: EstadoVerificacion): number { return this.todos.filter(p => p.estado === estado).length; }
  registrar(): void {
    this.limpiar();
    this.svc.registrar(this.nombre, this.ubicacion).subscribe({
      next: (p) => { this.mensaje = `Tecnico "${p.nombre}" registrado con ID ${p.id}.`; this.nombre = ''; this.ubicacion = ''; this.cargar(); },
      error: (e) => this.error = this.textoError(e)
    });
  }
  accion(p: Profesional, metodo: 'enviarDocumentos' | 'revisar' | 'aprobar' | 'rechazar' | 'docIncompleta' | 'suspender' | 'reactivar'): void {
    this.limpiar();
    this.svc[metodo](p.id).subscribe({ next: () => this.cargar(), error: (e) => this.error = this.textoError(e) });
  }

  // ---- documentos ----
  toggleDocs(id: number): void {
    if (this.docsTecnico === id) { this.docsTecnico = null; return; }
    this.docsTecnico = id; this.docs = []; this.nuevoTipo = ''; this.nuevoUrl = '';
    this.docSvc.listar(id).subscribe({ next: (l) => this.docs = l, error: (e) => this.error = this.textoError(e) });
  }
  subirDoc(id: number): void {
    this.limpiar();
    this.docSvc.subir(id, this.nuevoTipo, this.nuevoUrl).subscribe({
      next: () => { this.nuevoTipo = ''; this.nuevoUrl = ''; this.docSvc.listar(id).subscribe(l => this.docs = l); },
      error: (e) => this.error = this.textoError(e)
    });
  }

  // ---- categorias ----
  irCategorias(): void { this.vista = 'categorias'; this.cargarCategorias(); }
  cargarCategorias(): void {
    this.catSvc.listar().subscribe({ next: (l) => this.categorias = l, error: (e) => this.error = this.textoError(e) });
  }
  guardarCat(): void {
    this.limpiar();
    const op = this.catEdit
      ? this.catSvc.actualizar(this.catEdit, this.catNombre, this.catOficio, this.catTarifa!)
      : this.catSvc.crear(this.catNombre, this.catOficio, this.catTarifa!);
    op.subscribe({ next: () => { this.mensaje = 'Categoria guardada.'; this.cancelarEdit(); this.cargarCategorias(); }, error: (e) => this.error = this.textoError(e) });
  }
  editarCat(c: Categoria): void { this.catEdit = c.id; this.catNombre = c.nombre; this.catOficio = c.oficio; this.catTarifa = c.tarifaBaseReferencial; }
  cancelarEdit(): void { this.catEdit = null; this.catNombre = ''; this.catOficio = ''; this.catTarifa = null; }
  eliminarCat(c: Categoria): void {
    this.limpiar();
    this.catSvc.eliminar(c.id).subscribe({ next: () => this.cargarCategorias(), error: () => this.error = 'No se pudo eliminar (puede estar en uso por un perfil).' });
  }

  // ---- helpers ----
  inicial(nombre: string): string { return (nombre || '?').trim().charAt(0).toUpperCase(); }
  claseEstado(estado: EstadoVerificacion): string {
    if (estado === 'ACTIVO') return 'verde';
    if (estado === 'EN_REVISION' || estado === 'DOCUMENTOS_ENVIADOS') return 'azul';
    if (estado === 'RECHAZADO' || estado === 'SUSPENDIDO') return 'rojo';
    return 'ambar';
  }
  etiqueta(estado: EstadoVerificacion): string {
    const m: Record<EstadoVerificacion, string> = {
      REGISTRADO: 'Registrado', DOCUMENTOS_ENVIADOS: 'Docs enviados', EN_REVISION: 'En revision',
      ACTIVO: 'Activo', RECHAZADO: 'Rechazado', DOCUMENTACION_INCOMPLETA: 'Docs incompletos', SUSPENDIDO: 'Suspendido'
    };
    return m[estado] ?? estado;
  }
  private limpiar(): void { this.mensaje = ''; this.error = ''; }
  private textoError(e: any): string {
    return e?.error?.mensaje || e?.error?.message || e?.message || 'No se pudo conectar con el backend.';
  }
}
