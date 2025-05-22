import { useState, useEffect } from "react"

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
  const [form, setForm] = useState<RiskFormData>({
    titulo: "",
    categoriaSeleccionada: "",
    impacto: "",
    probabilidad: "",
    estado: "",
    responsableId: "",
    idUsuarioRegistro: "",
  })

  // Cargar riesgos
  const fetchRisks = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/risk")
      if (!res.ok) throw new Error("Error al cargar los riesgos")
      const data: Risk[] = await res.json()
      setRiskData(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Error al cargar los riesgos")
    } finally {
      setLoading(false)
    }
  }

  // Crear riesgo
  const createRisk = async (categorias: { idCategoria: number; nombre: string }[]) => {
    try {
      if (!validateForm()) return false;
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === form.categoriaSeleccionada)
      
      if (!categoriaSeleccionada && form.categoriaSeleccionada) {
        setError("La categoría seleccionada no es válida")
        return false
      }

      const payload = {
        titulo: form.titulo,
        idCategoria: categoriaSeleccionada ? categoriaSeleccionada.idCategoria : null,
        impacto: form.impacto,
        probabilidad: form.probabilidad,
        estado: form.estado,
        responsableId: form.responsableId ? Number(form.responsableId) : null,
        idUsuarioRegistro: form.idUsuarioRegistro ? Number(form.idUsuarioRegistro) : null,
      }

      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Error al crear riesgo: ${res.status} - ${errorText}`)
      }
      
      const nuevoRiesgo: Risk = await res.json()
      
      // Asegurarnos de que el nuevo riesgo tenga toda la información de la categoría
      const nuevoRiesgoCompleto = {
        ...nuevoRiesgo,
        categoria: categoriaSeleccionada ? {
          idCategoria: categoriaSeleccionada.idCategoria,
          nombre: categoriaSeleccionada.nombre
        } : null
      }
      
      setRiskData([nuevoRiesgoCompleto as Risk, ...riskData])
      resetForm()
      setError(null)
      return true
    } catch (err) {
      console.error(err)
      setError("Error al crear el riesgo")
      return false
    }
  }

  // Actualizar riesgo
  const updateRisk = async (id: number) => {
    try {
      if (!validateForm()) return false;
      const payload = {
        titulo: form.titulo,
        idCategoria: Number(form.categoriaSeleccionada),
        impacto: form.impacto,
        probabilidad: form.probabilidad,
        estado: form.estado,
        responsableId: form.responsableId ? Number(form.responsableId) : null,
        idUsuarioRegistro: form.idUsuarioRegistro ? Number(form.idUsuarioRegistro) : null,
        registroEstado: true,
      }
      const res = await fetch(`/api/risk?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Error al actualizar riesgo: ${res.status} - ${errorText}`)
      }
      const updatedRisk: Risk = await res.json()
      setRiskData(prev => prev.map(r => r.idRiesgo === id ? { ...r, ...updatedRisk } : r))
      resetForm()
      setError(null)
      return true
    } catch (err) {
      console.error(err)
      setError("Error al actualizar el riesgo")
      return false
    }
  }

  // Eliminar riesgo
  const deleteRisk = async (id: number) => {
    try {
      const res = await fetch(`/api/risk?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error(`Error al eliminar riesgo: ${res.status}`)
      setRiskData(prev => prev.filter(r => r.idRiesgo !== id))
      return true
    } catch (err) {
      console.error(err)
      setError("Error al eliminar el riesgo")
      return false
    }
  }

  // Actualizar formulario
  const updateForm = (field: keyof RiskFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Resetear formulario
  const resetForm = () => {
    setForm({
      titulo: "",
      categoriaSeleccionada: "",
      impacto: "",
      probabilidad: "",
      estado: "",
      responsableId: "",
      idUsuarioRegistro: ""
    })
    setOpenNew(false)
  }

  // Filtrar riesgos
  const getFilteredRisks = () => {
    return riskData.filter(r => {
      const title = r.titulo || ""
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "Todos" || (r.categoria?.nombre === categoryFilter)
      const matchesImpact = impactFilter === "Ninguno" || impactFilter === "Todos" || r.impacto === impactFilter
    
      if (impactFilter === "Ninguno") {
        return searchTerm.length > 0 && matchesSearch && matchesCategory
      }
      return matchesSearch && matchesCategory && matchesImpact
    })
  }

  // Cargar riesgos al iniciar
  useEffect(() => {
    fetchRisks()
  }, [])

  // Función auxiliar para obtener el color del impacto
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Crítico": return "bg-red-100 text-red-800"
      case "Alto":    return "bg-amber-100 text-amber-800"
      case "Medio":   return "bg-yellow-100 text-yellow-800"
      case "Bajo":    return "bg-green-100 text-green-800"
      default:        return ""
    }
  }

  // Obtener categorías únicas de los riesgos
  const getUniqueCategories = () => {
    return Array.from(
      new Set(
        riskData
          .filter(r => r.categoria && r.categoria.nombre)
          .map(r => r.categoria.nombre)
      )
    )
  }

   const validateForm = (): boolean => {
    if (!form.titulo.trim()) {
      setError("El título es obligatorio");
      return false;
    }
    if (!form.categoriaSeleccionada) {
      setError("Debes seleccionar una categoría");
      return false;
    }
    if (!form.impacto) {
      setError("Debes indicar el impacto");
      return false;
    }
    if (!form.probabilidad) {
      setError("Debes indicar la probabilidad");
      return false;
    }
    if (!form.estado) {
      setError("Debes seleccionar el estado");
      return false;
    }
    if (!form.responsableId) {
      setError("Debes asignar un responsable");
      return false;
    }
    if (!form.idUsuarioRegistro) {
      setError("Falta indicar quién registra");
      return false;
    }
    // si llegamos aquí, todo OK
    setError(null);
    return true;
  };


  return {
    riskData,
    loading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    impactFilter,
    setImpactFilter,
    openNew,
    setOpenNew,
    form,
    updateForm,
    resetForm,
    createRisk,
    updateRisk,
    deleteRisk,
    getFilteredRisks,
    getImpactColor,
    getUniqueCategories,
    fetchRisks
  }
}
