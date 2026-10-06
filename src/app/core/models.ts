/** Modelos que reflejan los DTO del backend (records *Response). */

export type EstadoVerificacion =
  | 'REGISTRADO' | 'DOCUMENTOS_ENVIADOS' | 'EN_REVISION'
  | 'ACTIVO' | 'RECHAZADO' | 'DOCUMENTACION_INCOMPLETA' | 'SUSPENDIDO';

export type EstadoSolicitud =
  | 'CREADA' | 'PUBLICADA' | 'ACEPTADA' | 'EN_CURSO'
  | 'FINALIZADA' | 'CALIFICADA' | 'CANCELADA';

export interface Profesional {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: EstadoVerificacion;
}

export interface Solicitud {
  id: number;
  idCliente: number;
  idProfesional: number | null;
  descripcion: string;
  ubicacion: string;
  tipo: string;        // NORMAL | EMERGENCIA
  estado: EstadoSolicitud;
  tarifaAcordada: number;
}

export interface Reputacion {
  idProfesional: number;
  calificacionPromedio: number;
  totalServicios: number;
}

export type EstadoOferta = 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';

/** Oferta que un tecnico envia ante una emergencia (flujo broadcast). */
export interface Oferta {
  id: number;
  idSolicitud: number;
  idProfesional: number;
  tarifaPropuesta: number;
  tiempoEstimadoLlegada: number;
  ubicacionActual: string | null;
  estado: EstadoOferta;
}

export interface Categoria {
  id: number;
  nombre: string;
  oficio: string;
  tarifaBaseReferencial: number;
}

export interface Perfil {
  idProfesional: number;
  descripcion: string;
  destacado: boolean;
  oficioPrincipal: string;
  tarifaDesde: number;
  categorias: Categoria[];
}

/** Tecnico del directorio: datos del perfil junto con su reputacion. */
export interface TecnicoDirectorio {
  id: number;
  nombre: string;
  ubicacion: string;
  reputacionPromedio: number;
  totalServicios: number;
  favorito: boolean;
  oficio: string;
  tarifaDesde: number;
  descripcion: string;
  destacado: boolean;
  categorias: Categoria[];
}
