import { useState, useEffect } from "react"
import {
  getRisks,
  createRiskAPI,
  updateRiskAPI,
  deleteRiskAPI,
} from "../services/riskservice"
import { useSession } from "./useSession"

export type Risk = {
  idRiesgo: number
  titulo: string
  impacto: string
  probabilidad: string
  estado: string
  fechaRegistro: string
  registroEstado: boolean
  categoria: { idCategoria: number; nombre: string }
  responsable: { idUsuario: number; nombreCompleto: string }
  registradoPor: { idUsuario: number; nombreCompleto: string }
  planesMitigar: { idPlanMitigar: number; nombre: string }[]
  planesEvitar: { idPlanEvitar: number; nombre: string }[]
}

type RiskFormData = {
  titulo: string
  categoriaSeleccionada: string
  impacto: string
  probabilidad: string
  estado: string
  responsableId: string
  idUsuarioRegistro: string
}

export function useRisk() {
  const [riskData, setRiskData] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [impactFilter, setImpactFilter] = useState("Ninguno")
  const [error, setError] = useState<string | null>(null)
  const [openNew, setOpenNew] = useState(false)
  
  // Obtener usuario en sesión
  const currentUser = useSession()
  
  const [form, setForm] = useState<RiskFormData>({
    titulo: "",
    categoriaSeleccionada: "",
    impacto: "",
    probabilidad: "",
    estado: "",
    responsableId: "",
    idUsuarioRegistro: "", 
  })

  // Llenar automáticamente el usuario registrador cuando cambie la sesión
  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({
        ...prev,
        idUsuarioRegistro: currentUser.idUsuario.toString()
      }))
    }
  }, [currentUser])

  // ——— Fetch all risks —————————————————————————————
  const fetchRisks = async () => {
    try {
      setLoading(true)
      const data = await getRisks()
      setRiskData(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Error al cargar los riesgos")
    } finally {
      setLoading(false)
    }
  }

  // ——— Create risk ——————————————————————————————————
  const createRisk = async (categorias: { idCategoria: number; nombre: string }[]) => {
    try {
      if (!validateForm()) return false
      const cat = categorias.find(c => c.nombre === form.categoriaSeleccionada)
      if (!cat && form.categoriaSeleccionada) {
        setError("La categoría seleccionada no es válida")
        return false
      }

      const payload = {
        titulo: form.titulo,
        idCategoria: cat ? cat.idCategoria : null,
        impacto: form.impacto,
        probabilidad: form.probabilidad,
        estado: form.estado,
        responsableId: form.responsableId ? Number(form.responsableId) : null,
        idUsuarioRegistro: form.idUsuarioRegistro ? Number(form.idUsuarioRegistro) : null,
      }

      const nuevo = await createRiskAPI(payload)
      setRiskData([ { ...nuevo, categoria: cat ?? null } as Risk, ...riskData ])
      resetForm()
      setError(null)
      return true
    } catch (err) {
      console.error(err)
      setError("Error al crear el riesgo")
      return false
    }
  }

  // ——— Update risk ——————————————————————————————————
  const updateRisk = async (
    idRiesgo: number,
    data: {
      titulo: string
      categoriaSeleccionada: string
      impacto: string
      probabilidad: string
      estado: string
      responsableId?: string
      idUsuarioRegistro?: string
    },
    categorias: { idCategoria: number; nombre: string }[]
  ): Promise<boolean> => {
    try {
      if (!data.titulo.trim()) {
        setError("El título es obligatorio")
        return false
      }
      const cat = categorias.find(c => c.nombre === data.categoriaSeleccionada)
      if (!cat) {
        setError("Categoría inválida")
        return false
      }

      const payload = {
        titulo: data.titulo,
        idCategoria: cat.idCategoria,
        impacto: data.impacto,
        probabilidad: data.probabilidad,
        estado: data.estado,
        responsableId: data.responsableId ? Number(data.responsableId) : null,
        idUsuarioRegistro: data.idUsuarioRegistro ? Number(data.idUsuarioRegistro) : null,
      }

      const updated = await updateRiskAPI(idRiesgo, payload)
      setRiskData(prev =>
        prev.map(r => r.idRiesgo === idRiesgo
          ? { ...updated, categoria: { idCategoria: cat.idCategoria, nombre: cat.nombre } }
          : r
        )
      )
      setError(null)
      return true
    } catch (err) {
      console.error(err)
      setError("No se pudo actualizar el riesgo")
      return false
    }
  }

  // ——— Delete risk ——————————————————————————————————
  const deleteRisk = async (idRiesgo: number) => {
    try {
      await deleteRiskAPI(idRiesgo)
      setRiskData(prev => prev.filter(r => r.idRiesgo !== idRiesgo))
      setError(null)
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar el riesgo")
    }
  }

  // ——— Form handlers & helpers ——————————————————————
  const updateForm = (field: keyof RiskFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm({
      titulo: "",
      categoriaSeleccionada: "",
      impacto: "",
      probabilidad: "",
      estado: "",
      responsableId: "",
      idUsuarioRegistro: currentUser ? currentUser.idUsuario.toString() : "",
    })
    setOpenNew(false)
  }

  const validateForm = (): boolean => {
    if (!form.titulo.trim())    return setError("El título es obligatorio"), false
    if (!form.categoriaSeleccionada) return setError("Debes seleccionar una categoría"), false
    if (!form.impacto)           return setError("Debes indicar el impacto"), false
    if (!form.probabilidad)      return setError("Debes indicar la probabilidad"), false
    if (!form.estado)            return setError("Debes seleccionar el estado"), false
    if (!form.responsableId)     return setError("Debes asignar un responsable"), false
    if (!form.idUsuarioRegistro) return setError("No hay usuario en sesión"), false
    setError(null)
    return true
  }

  // ——— Filters & utilities —————————————————————————
  const getFilteredRisks = () => {
    return riskData.filter(r => {
      const matchesSearch   = r.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "Todos" || r.categoria?.nombre === categoryFilter
      const matchesImpact   = impactFilter === "Ninguno"
        ? searchTerm.length > 0 && matchesSearch && matchesCategory
        : (impactFilter === "Todos" || r.impacto === impactFilter) && matchesSearch && matchesCategory

      return matchesImpact
    })
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Crítico": return "bg-red-100 text-red-800"
      case "Alto":    return "bg-amber-100 text-amber-800"
      case "Medio":   return "bg-yellow-100 text-yellow-800"
      case "Bajo":    return "bg-green-100 text-green-800"
      default:        return ""
    }
  }

  const getUniqueCategories = () => [
    ...new Set(riskData.map(r => r.categoria?.nombre).filter(Boolean))
  ] as string[]

  // ——— Auto-load on mount ————————————————————————
  useEffect(() => {
    fetchRisks()
  }, [])

  return {
    // state
    riskData,
    loading,
    error,
    openNew,
    form,
    searchTerm,
    categoryFilter,
    impactFilter,
    currentUser, 

    // setters
    setError,
    setOpenNew,
    updateForm,
    setSearchTerm,
    setCategoryFilter,
    setImpactFilter,

    // actions
    fetchRisks,
    createRisk,
    updateRisk,
    deleteRisk,

    // helpers
    resetForm,
    getFilteredRisks,
    getImpactColor,
    getUniqueCategories,
  }
}