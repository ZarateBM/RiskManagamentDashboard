import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos
export interface Usuario {
  id_usuario: number
  nombre_completo: string
  correo: string
  rol: "ADMINISTRADOR" | "LECTOR" // Eliminado EDITOR
  fecha_creacion: string
  ultimo_acceso?: string
  activo: boolean
}

export interface Protocolo {
  id_protocolo: number
  titulo: string
  descripcion: string
  categoria: string
  severidad: "Crítica" | "Alta" | "Media" | "Baja"
  tiempo_estimado: string
  herramientas_necesarias: string[]
  pasos: Array<{
    titulo: string
    descripcion: string
    tareas: string[]
  }>
  fecha_creacion: string
  creado_por: number
  activo: boolean
}

export interface Riesgo {
  id_riesgo: number
  nombre: string
  descripcion: string
  categoria: string
  impacto: "Crítico" | "Alto" | "Medio" | "Bajo"
  probabilidad: "Alta" | "Media" | "Baja"
  estado: "Activo" | "Mitigado" | "Resuelto"
  medidas_mitigacion: string
  responsable_id: number
  protocolo_id?: number
  fecha_creacion: string
  fecha_actualizacion: string
  protocolo?: Protocolo
  responsable?: Usuario
}

export interface Incidente {
  id_incidente: number
  titulo: string
  descripcion: string
  categoria: string
  severidad: "Crítica" | "Alta" | "Media" | "Baja"
  estado: "Pendiente" | "En proceso" | "Resuelto"
  fecha_reporte: string
  asignado_a: string
  riesgo_id?: number
  protocolo_id?: number
  protocolo_ejecutado: boolean
  notas?: string
  fecha_resolucion?: string
  resuelto_por?: number
  riesgo?: Riesgo
  protocolo?: Protocolo
}

export interface EjecucionProtocolo {
  id_ejecucion: number
  protocolo_id: number
  incidente_id: number
  usuario_id: number
  fecha_inicio: string
  fecha_fin?: string
  estado: "En progreso" | "Completado" | "Cancelado"
  progreso: number
  pasos_completados: string[]
  notas?: string
  protocolo?: Protocolo
  incidente?: Incidente
  usuario?: Usuario
}

export interface MaterializacionRiesgo {
  id_materializacion: number
  riesgo_id: number
  fecha_materializacion: string
  descripcion_evento: string
  severidad_real: "Crítica" | "Alta" | "Media" | "Baja"
  acciones_tomadas: string[]
  protocolo_ejecutado_id?: number
  incidente_generado_id?: number
  estado: "Activo" | "Resuelto" | "En seguimiento"
  usuario_reporta_id: number
  notas?: string
  fecha_resolucion?: string
  resuelto_por?: number
  riesgo?: Riesgo
  protocolo_ejecutado?: Protocolo
  incidente_generado?: Incidente
  usuario_reporta?: Usuario
  usuario_resuelve?: Usuario
}
