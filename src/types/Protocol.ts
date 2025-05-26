export interface Protocol {
  idProtocolo: number
  nombre: string
  descripcion: string
  categoria: string
  severidad: string
  tiempoEstimado: string
  herramientas: string[]
  pasos: {
    title: string
    description: string
    tasks: string[]
  }[]
  fechaPublicacion: Date
  registroEstado: boolean
  publicadoPor: {
    idUsuario: number
    nombreCompleto: string
    correo: string
  }
}