import { useState, useEffect } from "react"

export type Categoria = { 
  idCategoria: number
  nombre: string
  descripcion: string 
}

type CategoriaFormData = {
  nombre: string
  descripcion: string
  
}

export function useCategory() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openNew, setOpenNew] = useState(false)
  const [form, setForm] = useState<CategoriaFormData>({
    nombre: "",
    descripcion: ""
  })

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/category")
      if (!res.ok) throw new Error("Error al cargar las categorías")
      const data: Categoria[] = await res.json()
      setCategorias(data)
      setError(null)
    } catch (err) {
      console.error("Error al cargar categorías:", err)
      setError("Error al cargar las categorías")
    } finally {
      setLoading(false)
    }
  }

  // Crear categoría
  const createCategory = async () => {
    try {
      if (!form.nombre || !form.descripcion) {
        setError("El nombre y la descripción son obligatorios")
        return false
      }

      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al crear categoría")
      }

      const nuevaCategoria: Categoria = await res.json()
      setCategorias([...categorias, nuevaCategoria])
      resetForm()
      setError(null)
      return true
    } catch (err) {
      const error = err as Error
      console.error("Error al crear categoría:", err)
      setError(error.message || "Error al crear la categoría")
      return false
    }
  }

  // Actualizar formulario
  const updateForm = (field: keyof CategoriaFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Resetear formulario
  const resetForm = () => {
    setForm({ nombre: "", descripcion: "" })
    setOpenNew(false)
  }

  // Eliminar categoría
  const deleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/category/${id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) {
        throw new Error("Error al eliminar la categoría")
      }
      
      setCategorias(categorias.filter(cat => cat.idCategoria !== id))
      return true
    } catch (err) {
      console.error("Error al eliminar categoría:", err)
      setError("Error al eliminar la categoría")
      return false
    }
  }

const updateCategory = async (id: number, data: CategoriaFormData) => {
  try {
    const res = await fetch(`/api/category/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), 
    })

    if (!res.ok) {
      throw new Error("Error al editar la categoría")
    }

    const categoriaActualizada: Categoria = await res.json()
    setCategorias(prev =>
      prev.map(cat =>
        cat.idCategoria === id ? categoriaActualizada : cat
      )
    )

    return true
  } catch (err) {
    console.error("Error al editar categoría:", err)
    setError("Error al editar la categoría")
    return false
  }
}

  // Cargar categorías al iniciar
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categorias,
    loading,
    error,
    setError,
    openNew,
    setOpenNew,
    form,
    updateForm,
    resetForm,
    createCategory,
    deleteCategory,
    fetchCategories,
    updateCategory
  }
}