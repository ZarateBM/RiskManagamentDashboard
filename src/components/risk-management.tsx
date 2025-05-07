"use client"

import { useEffect, useState } from "react"
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Droplets, FileText, Filter, Plus, Search, Waves, Zap } from "lucide-react"

// Tipado de los datos según tu modelo Prisma
type Categoria = { idCategoria: number; nombre: string; descripcion: string }
type Usuario = { idUsuario: number; nombreCompleto: string }

type PlanMitigar = { idPlanMitigar: number; nombre: string }
type PlanEvitar   = { idPlanEvitar: number; nombre: string }

type Risk = {
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
  planesEvitar:   { idPlanEvitar:   number; nombre: string }[]
}


export default function RiskManagement() {
  const [riskData, setRiskData] = useState<Risk[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [impactFilter, setImpactFilter] = useState("Ninguno")
  const [error, setError] = useState<string | null>(null)
  console.log({riskData})

  // Estados para el formulario
  const [openNew, setOpenNew] = useState(false)
  const [form, setForm] = useState({
    titulo: "",
    categoriaSeleccionada: "", // Almacena el nombre de la categoría seleccionada
    impacto: "",
    probabilidad: "",
    estado: "",
    responsableId: "",
    idUsuarioRegistro: "",
  })

  // Estados para el manejo de categorías
  const [openCategoria, setOpenCategoria] = useState(false)
  const [formCategoria, setFormCategoria] = useState({
    nombre: "",
    descripcion: ""
  })

  // Carga inicial de riesgos
  useEffect(() => {
    fetch("/api/risk")
      .then(res => res.json())
      .then((data: Risk[]) => setRiskData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Carga inicial de categorías
  useEffect(() => {
    fetch("/api/category")
      .then(res => res.json())
      .then((data: Categoria[]) => {
        setCategorias(data)
        console.log("Categorías cargadas:", data)
      })
      .catch(error => {
        console.error("Error al cargar categorías:", error)
        setError("Error al cargar las categorías")
      })
      .finally(() => setLoadingCategorias(false))
  }, [])

  // Crear riesgo
  const handleCreate = async () => {
    try {
      // Encontrar el ID de la categoría seleccionada por nombre
      const categoriaSeleccionada = categorias.find(cat => cat.nombre === form.categoriaSeleccionada)
      
      if (!categoriaSeleccionada && form.categoriaSeleccionada) {
        setError("La categoría seleccionada no es válida")
        return
      }

      const payload = {
        titulo: form.titulo,
        idCategoria: categoriaSeleccionada ? categoriaSeleccionada.idCategoria : null,
        impacto: form.impacto,
        probabilidad: form.probabilidad,
        estado: form.estado,
        responsableId: Number(form.responsableId),
        idUsuarioRegistro: Number(form.idUsuarioRegistro),
      }
      console.log(payload)
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
      setOpenNew(false)
      setForm({
        titulo: "", categoriaSeleccionada: "", impacto: "",
        probabilidad: "", estado: "",
        responsableId: "", idUsuarioRegistro: ""
      })
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Error al crear el riesgo")
    }
  }

  // Crear nueva categoría
  const handleCreateCategoria = async () => {
    try {
      if (!formCategoria.nombre || !formCategoria.descripcion) {
        setError("El nombre y la descripción son obligatorios")
        return
      }

      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCategoria),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al crear categoría")
      }

      const nuevaCategoria: Categoria = await res.json()
      setCategorias([...categorias, nuevaCategoria])
      setOpenCategoria(false)
      setFormCategoria({ nombre: "", descripcion: "" })
      setError(null)
    } catch (err: any) {
      console.error("Error al crear categoría:", err)
      setError(err.message || "Error al crear la categoría")
    }
  }

  if (loading) return <p className="p-4">Cargando riesgos...</p>

  // Filtrado
  const filteredRisks = riskData.filter(r => {
    const title = r.titulo || ""
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Todos" || (r.categoria?.nombre === categoryFilter)
    const matchesImpact = impactFilter === "Ninguno" || impactFilter === "Todos" || r.impacto === impactFilter
  
    if (impactFilter === "Ninguno") {
      return searchTerm.length > 0 && matchesSearch && matchesCategory
    }
    return matchesSearch && matchesCategory && matchesImpact
  })

  const getImpactColor = (i: string) => {
    switch (i) {
      case "Crítico": return "bg-red-100 text-red-800"
      case "Alto":    return "bg-amber-100 text-amber-800"
      case "Medio":   return "bg-yellow-100 text-yellow-800"
      case "Bajo":    return "bg-green-100 text-green-800"
      default:        return ""
    }
  }

  // Obtener categorías únicas con seguridad
  const uniqueCategories = Array.from(
    new Set(
      riskData
        .filter(r => r.categoria && r.categoria.nombre)
        .map(r => r.categoria.nombre)
    )
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Riesgos</CardTitle>
              <CardDescription>Identificación, clasificación y mitigación de riesgos</CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Diálogo para crear categoría */}
              <Dialog open={openCategoria} onOpenChange={setOpenCategoria}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Nueva Categoría</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                    <DialogDescription>Complete la información de la categoría</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input 
                        id="nombre" 
                        value={formCategoria.nombre}
                        onChange={e => setFormCategoria({...formCategoria, nombre: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea 
                        id="descripcion" 
                        value={formCategoria.descripcion}
                        onChange={e => setFormCategoria({...formCategoria, descripcion: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateCategoria}>Guardar Categoría</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Diálogo para crear riesgo */}
              <Dialog open={openNew} onOpenChange={setOpenNew}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Nuevo Riesgo</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Riesgo</DialogTitle>
                    <DialogDescription>Complete todos los campos</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input id="titulo" value={form.titulo}
                        onChange={e => setForm({...form, titulo: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        {/* Selector de categorías por nombre */}
                        <Select 
                          value={form.categoriaSeleccionada} 
                          onValueChange={value => setForm({...form, categoriaSeleccionada: value})}
                        >
                          <SelectTrigger id="categoria">
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingCategorias ? (
                              <SelectItem value="cargando">Cargando categorías...</SelectItem>
                            ) : (
                              categorias.map(cat => (
                                <SelectItem key={cat.idCategoria} value={cat.nombre}>
                                  {cat.nombre}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impacto">Impacto</Label>
                        <Select value={form.impacto} onValueChange={v=>setForm({...form, impacto:v})}>
                          <SelectTrigger id="impacto"><SelectValue placeholder="Impacto" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Crítico">Crítico</SelectItem>
                            <SelectItem value="Alto">Alto</SelectItem>
                            <SelectItem value="Medio">Medio</SelectItem>
                            <SelectItem value="Bajo">Bajo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="probabilidad">Probabilidad</Label>
                        <Select value={form.probabilidad} onValueChange={v=>setForm({...form, probabilidad:v})}>
                          <SelectTrigger id="probabilidad"><SelectValue placeholder="Probabilidad" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Baja">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={form.estado} onValueChange={v=>setForm({...form, estado:v})}>
                          <SelectTrigger id="estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Mitigado">Mitigado</SelectItem>
                            <SelectItem value="Resuelto">Resuelto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="responsable">Responsable (ID)</Label>
                        <Input id="responsable" placeholder="ID usuario"
                          value={form.responsableId}
                          onChange={e=>setForm({...form, responsableId:e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrador">Registrado por (ID)</Label>
                        <Input id="registrador" placeholder="ID usuario"
                          value={form.idUsuarioRegistro}
                          onChange={e=>setForm({...form, idUsuarioRegistro:e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreate}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar riesgos..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent> 
              </Select>
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Impacto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguno">Ninguno</SelectItem>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Crítico">Crítico</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Riesgo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map(risk => (
                <TableRow key={risk.idRiesgo}>
                  <TableCell>{risk.titulo}</TableCell>
                  <TableCell>{risk.categoria?.nombre || "—"}</TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(risk.impacto)}>{risk.impacto}</Badge>
                  </TableCell>
                  <TableCell>{risk.probabilidad}</TableCell>
                  <TableCell>
                    <Badge variant={risk.estado==="Activo"?"default":"outline"}>{risk.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <FileText className="mr-1 h-4 w-4" /> Detalles
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{risk.titulo}</DialogTitle>
                          <DialogDescription>
                            {risk.registradoPor?.nombreCompleto ? 
                              `Registrado por ${risk.registradoPor.nombreCompleto} el ${new Date(risk.fechaRegistro).toLocaleDateString()}` :
                              `Registrado el ${new Date(risk.fechaRegistro).toLocaleDateString()}`
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <p><strong>Responsable:</strong> {risk.responsable?.nombreCompleto || "—"}</p>
                          <p><strong>Planes de Mitigación:</strong> {risk.planesMitigar?.length ? risk.planesMitigar.map(p=>p.nombre).join(", ") : "—"}</p>
                          <p><strong>Planes de Evitación:</strong> {risk.planesEvitar?.length ? risk.planesEvitar.map(p=>p.nombre).join(", ") : "—"}</p>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Editar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredRisks.length} de {riskData.length} riesgos
          </span>
        </CardFooter>
      </Card>

      {/* Sección para gestionar categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Categorías</CardTitle>
          <CardDescription>Administre las categorías de riesgos</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCategorias ? (
            <p>Cargando categorías...</p>
          ) : categorias.length === 0 ? (
            <p>No hay categorías disponibles. Cree una nueva.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map(categoria => (
                  <TableRow key={categoria.idCategoria}>
                    <TableCell>{categoria.idCategoria}</TableCell>
                    <TableCell>{categoria.nombre}</TableCell>
                    <TableCell>{categoria.descripcion}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="destructive">Eliminar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => setOpenCategoria(true)}>
            <Plus className="mr-2 h-4 w-4" />Agregar Categoría
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}