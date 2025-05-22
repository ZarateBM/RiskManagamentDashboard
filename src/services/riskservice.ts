// services/riskService.ts
import axios from "axios"
import { Risk } from "@/hooks/useRisk"  // Ajusta la ruta si tu carpeta de hooks cambia

/**
 * Obtiene todos los riesgos.
 */
export const getRisks = async (): Promise<Risk[]> => {
  const res = await axios.get("/api/risk")
  return res.data
}

/**
 * Crea un nuevo riesgo.
 */
export const createRiskAPI = async (payload: {
  titulo: string
  idCategoria: number | null
  impacto: string
  probabilidad: string
  estado: string
  responsableId: number | null
  idUsuarioRegistro: number | null
}): Promise<Risk> => {
  const res = await axios.post("/api/risk", payload)
  console.log(res.data)
  return res.data
}

/**
 * Actualiza un riesgo existente.
 */
export const updateRiskAPI = async (
  idRiesgo: number,
  payload: {
    titulo: string
    idCategoria: number
    impacto: string
    probabilidad: string
    estado: string
    responsableId: number | null
    idUsuarioRegistro: number | null
  }
): Promise<Risk> => {
  const res = await axios.put(`/api/risk/${idRiesgo}`, payload)
  return res.data
}

export const deleteRiskAPI = async (idRiesgo: number): Promise<void> => {
  await axios.delete(`/api/risk/[id]/${idRiesgo}`)
}
