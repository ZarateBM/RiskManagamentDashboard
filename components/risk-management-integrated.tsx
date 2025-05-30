"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, FileText, AlertTriangle, BookOpen, Zap, Eye, Play } from "lucide-react"
import { supabase, type Riesgo, type Protocolo, type Usuario, type MaterializacionRiesgo } from "@/lib/supabase"

export default function RiskManagementIntegrated() {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [materializaciones, setMaterializaciones] = useState<MaterializacionRiesgo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [impactFilter, setImpactFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [materializeModalOpen, setMaterializeModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<Riesgo | null>(null)

  // Campos del formulario de riesgo
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [impacto, setImpacto] = useState("")
  const [probabilidad, setProbabilidad] = useState("")
  const [medidas, setMedidas] = useState("")
  const [responsableId, setResponsableId] = useState("")
  const [protocoloId, setProtocoloId] = useState("")

  // Campos del formulario de materialización
  const [descripcionEvento, setDescripcionEvento] = useState("")
  const [severidadReal, setSeveridadReal] = useState("")
  const [accionesTomadas, setAccionesTomadas] = useState("")
  const [notasMaterializacion, setNotasMaterializacion] = useState("")

  // Estados para modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [materializationDetailsOpen, setMaterializationDetailsOpen] = useState(false)
  const [selectedMaterialization, setSelectedMaterialization] = useState<MaterializacionRiesgo | null>(null)

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem("usuario")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    cargarDatos()
  }, [])

  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  const cargarDatos = async () => {
    try {
      // Cargar riesgos con protocolos y responsables
      const { data: riesgosData, error: riesgosError } = await supabase
        .from("riesgos")
        .select(`
          *,
          protocolo:protocolos(*),
          responsable:usuarios!riesgos_responsable_id_fkey(*)
        `)
        .order("fecha_creacion", { ascending: false })

      if (riesgosError) throw riesgosError

      // Cargar usuarios activos
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("activo", true)
        .order("nombre_completo")

      if (usuariosError) throw usuariosError

      // Cargar protocolos
      const { data: protocolosData, error: protocolosError } = await supabase
        .from("protocolos")
        .select("*")
        .eq("activo", true)
        .order("titulo")

      if (protocolosError) throw protocolosError

      // Cargar materializaciones
      const { data: materializacionesData, error: materializacionesError } = await supabase
        .from("materializaciones_riesgo")
        .select(`
          *,
          riesgo:riesgos(*),
          protocolo_ejecutado:protocolos(*),
          incidente_generado:incidentes(*),
          usuario_reporta:usuarios!materializaciones_riesgo_usuario_reporta_id_fkey(*),
          usuario_resuelve:usuarios!materializaciones_riesgo_resuelto_por_fkey(*)
        `)
        .order("fecha_materializacion", { ascending: false })

      if (materializacionesError) throw materializacionesError

      setRiesgos(riesgosData || [])
      setUsuarios(usuariosData || [])
      setProtocolos(protocolosData || [])
      setMaterializaciones(materializacionesData || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      alert("Solo los administradores pueden crear riesgos")
      return
    }

    try {
      const nuevoRiesgo = {
        nombre,
        descripcion,
        categoria,
        impacto,
        probabilidad,
        estado: "Activo",
        medidas_mitigacion: medidas,
        responsable_id: Number.parseInt(responsableId),
        protocolo_id: protocoloId ? Number.parseInt(protocoloId) : null,
      }

      const { error } = await supabase.from("riesgos").insert([nuevoRiesgo])

      if (error) throw error

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
      alert("Riesgo creado exitosamente")
    } catch (error) {
      console.error("Error creando riesgo:", error)
      alert("Error al crear riesgo")
    }
  }

  const handleMaterializeRisk = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRisk || !isAdmin) {
      alert("Solo los administradores pueden materializar riesgos")
      return
    }

    try {
      const acciones = accionesTomadas
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)

      // Crear materialización
      const { data: materializacionData, error: materializacionError } = await supabase
        .from("materializaciones_riesgo")
        .insert([
          {
            riesgo_id: selectedRisk.id_riesgo,
            descripcion_evento: descripcionEvento,
            severidad_real: severidadReal,
            acciones_tomadas: acciones,
            usuario_reporta_id: currentUser?.id_usuario,
            notas: notasMaterializacion,
          },
        ])
        .select()
        .single()

      if (materializacionError) throw materializacionError

      // Si hay protocolo asociado, crear incidente automáticamente
      if (selectedRisk.protocolo_id) {
        const { data: incidenteData, error: incidenteError } = await supabase
          .from("incidentes")
          .insert([
            {
              titulo: `Materialización de riesgo: ${selectedRisk.nombre}`,
              descripcion: descripcionEvento,
              categoria: selectedRisk.categoria,
              severidad: severidadReal,
              estado: "Pendiente",
              asignado_a: selectedRisk.responsable?.nombre_completo || "Sin asignar",
              riesgo_id: selectedRisk.id_riesgo,
              protocolo_id: selectedRisk.protocolo_id,
              protocolo_ejecutado: false,
            },
          ])
          .select()
          .single()

        if (incidenteError) throw incidenteError

        // Actualizar materialización con el incidente generado
        await supabase
          .from("materializaciones_riesgo")
          .update({ incidente_generado_id: incidenteData.id_incidente })
          .eq("id_materializacion", materializacionData.id_materializacion)
      }

      setMaterializeModalOpen(false)
      resetMaterializationForm()
      cargarDatos()
      alert(
        selectedRisk.protocolo_id
          ? "Riesgo materializado e incidente creado automáticamente"
          : "Riesgo materializado exitosamente",
      )
    } catch (error) {
      console.error("Error materializando riesgo:", error)
      alert("Error al materializar riesgo")
    }
  }

  const openMaterializeModal = (riesgo: Riesgo) => {
    setSelectedRisk(riesgo)
    setMaterializeModalOpen(true)
  }

  const openDetailsModal = (riesgo: Riesgo) => {
    setSelectedRisk(riesgo)
    setDetailsModalOpen(true)
  }

  const openMaterializationDetails = (materializacion: MaterializacionRiesgo) => {
    setSelectedMaterialization(materializacion)
    setMaterializationDetailsOpen(true)
  }

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setCategoria("")
    setImpacto("")
    setProbabilidad("")
    setMedidas("")
    setResponsableId("")
    setProtocoloId("")
  }

  const resetMaterializationForm = () => {
    setDescripcionEvento("")
    setSeveridadReal("")
    setAccionesTomadas("")
    setNotasMaterializacion("")
  }

  const filteredRisks = riesgos.filter((riesgo) => {
    const matchesSearch = riesgo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Todos" || riesgo.categoria === categoryFilter
    const matchesImpact = impactFilter === "Todos" || riesgo.impacto === impactFilter
    return matchesSearch && matchesCategory && matchesImpact
  })

  const getImpactColor = (impacto: string) => {
    switch (impacto) {
      case "Crítico":
        return "bg-red-100 text-red-800"
      case "Alto":
        return "bg-amber-100 text-amber-800"
      case "Medio":
        return "bg-yellow-100 text-yellow-800"
      case "Bajo":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "bg-red-100 text-red-800"
      case "En seguimiento":
        return "bg-blue-100 text-blue-800"
      case "Resuelto":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary-blue" />
          <p className="mt-2 text-primary-blue">Cargando riesgos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="riesgos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="riesgos">Gestión de Riesgos</TabsTrigger>
          <TabsTrigger value="materializaciones">Materializaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="riesgos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Riesgos Integrada</CardTitle>
                  <CardDescription>
                    Riesgos vinculados con protocolos de respuesta y usuarios responsables
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Riesgo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Registrar Nuevo Riesgo</DialogTitle>
                        <DialogDescription>
                          Complete la información y vincule con un protocolo de respuesta
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateRisk}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-name">Nombre del Riesgo</Label>
                              <Input
                                id="risk-name"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="risk-category">Categoría</Label>
                              <Select value={categoria} onValueChange={setCategoria}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ambiental">Ambiental</SelectItem>
                                  <SelectItem value="Seguridad Física">Seguridad Física</SelectItem>
                                  <SelectItem value="Operativo">Operativo</SelectItem>
                                  <SelectItem value="Digital">Digital</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="risk-description">Descripción</Label>
                            <Textarea
                              id="risk-description"
                              value={descripcion}
                              onChange={(e) => setDescripcion(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-impact">Impacto</Label>
                              <Select value={impacto} onValueChange={setImpacto}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar impacto" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Crítico">Crítico</SelectItem>
                                  <SelectItem value="Alto">Alto</SelectItem>
                                  <SelectItem value="Medio">Medio</SelectItem>
                                  <SelectItem value="Bajo">Bajo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="risk-probability">Probabilidad</Label>
                              <Select value={probabilidad} onValueChange={setProbabilidad}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar probabilidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Alta">Alta</SelectItem>
                                  <SelectItem value="Media">Media</SelectItem>
                                  <SelectItem value="Baja">Baja</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-responsible">Responsable</Label>
                              <Select value={responsableId} onValueChange={setResponsableId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar responsable" />
                                </SelectTrigger>
                                <SelectContent>
                                  {usuarios.map((usuario) => (
                                    <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                                      {usuario.nombre_completo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="risk-protocol">Protocolo de Respuesta</Label>
                              <Select value={protocoloId} onValueChange={setProtocoloId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar protocolo (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {protocolos.map((protocolo) => (
                                    <SelectItem key={protocolo.id_protocolo} value={protocolo.id_protocolo.toString()}>
                                      {protocolo.titulo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="risk-mitigation">Medidas de Mitigación</Label>
                            <Textarea
                              id="risk-mitigation"
                              value={medidas}
                              onChange={(e) => setMedidas(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="border border-primary-blue text-white bg-primary-blue" type="submit">Guardar Riesgo</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-blue" />
                  <Input
                    placeholder="Buscar riesgos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary-blue" />
                    <span className="text-sm">Filtros:</span>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todas las categorías</SelectItem>
                      <SelectItem value="Ambiental">Ambiental</SelectItem>
                      <SelectItem value="Seguridad Física">Seguridad Física</SelectItem>
                      <SelectItem value="Operativo">Operativo</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={impactFilter} onValueChange={setImpactFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos los impactos</SelectItem>
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
                    <TableHead>Responsable</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.map((riesgo) => (
                    <TableRow key={riesgo.id_riesgo}>
                      <TableCell className="font-medium">{riesgo.nombre}</TableCell>
                      <TableCell>{riesgo.categoria}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getImpactColor(riesgo.impacto)}>
                          {riesgo.impacto}
                        </Badge>
                      </TableCell>
                      <TableCell>{riesgo.probabilidad}</TableCell>
                      <TableCell>
                        <Badge variant={riesgo.estado === "Activo" ? "default" : "outline"}>{riesgo.estado}</Badge>
                      </TableCell>
                      <TableCell>{riesgo.responsable?.nombre_completo || "Sin asignar"}</TableCell>
                      <TableCell>
                        {riesgo.protocolo ? (
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{riesgo.protocolo.titulo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-primary-blue">Sin protocolo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openDetailsModal(riesgo)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                          {isAdmin && (
                            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openMaterializeModal(riesgo)}>
                              <Zap className="mr-2 h-4 w-4" />
                              Materializar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materializaciones">
          <Card>
            <CardHeader>
              <CardTitle>Materializaciones de Riesgos</CardTitle>
              <CardDescription>Registro de riesgos que se han materializado y las acciones tomadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materializaciones.map((materializacion) => (
                  <div
                    key={materializacion.id_materializacion}
                    className="flex items-center justify-between rounded-md border border-primary-blue p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          materializacion.severidad_real === "Crítica"
                            ? "bg-red-100"
                            : materializacion.severidad_real === "Alta"
                              ? "bg-amber-100"
                              : materializacion.severidad_real === "Media"
                                ? "bg-yellow-100"
                                : "bg-green-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            materializacion.severidad_real === "Crítica"
                              ? "text-red-600"
                              : materializacion.severidad_real === "Alta"
                                ? "text-amber-600"
                                : materializacion.severidad_real === "Media"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{materializacion.riesgo?.nombre}</p>
                        <p className="text-sm text-primary-blue">{materializacion.descripcion_evento}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={getImpactColor(materializacion.severidad_real)}>
                            {materializacion.severidad_real}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(materializacion.estado)}>
                            {materializacion.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(materializacion.fecha_materializacion)}</p>
                        <p className="text-xs text-primary-blue">
                          Por: {materializacion.usuario_reporta?.nombre_completo}
                        </p>
                      </div>
                      <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openMaterializationDetails(materializacion)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de materialización */}
      <Dialog open={materializeModalOpen} onOpenChange={setMaterializeModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Materializar Riesgo</DialogTitle>
            <DialogDescription>Registre que el riesgo "{selectedRisk?.nombre}" se ha materializado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMaterializeRisk}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-description">Descripción del Evento</Label>
                <Textarea
                  id="event-description"
                  placeholder="Describa qué ocurrió exactamente..."
                  value={descripcionEvento}
                  onChange={(e) => setDescripcionEvento(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="real-severity">Severidad Real</Label>
                <Select value={severidadReal} onValueChange={setSeveridadReal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar severidad real" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actions-taken">Acciones Tomadas (separadas por coma)</Label>
                <Textarea
                  id="actions-taken"
                  placeholder="ej: Evacuación, Contacto con emergencias, Activación de protocolo..."
                  value={accionesTomadas}
                  onChange={(e) => setAccionesTomadas(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialization-notes">Notas Adicionales</Label>
                <Textarea
                  id="materialization-notes"
                  placeholder="Información adicional relevante..."
                  value={notasMaterializacion}
                  onChange={(e) => setNotasMaterializacion(e.target.value)}
                />
              </div>
              {selectedRisk?.protocolo && (
                <div className="rounded-md border border-primary-blue p-3 bg-blue-50">
                  <h4 className="font-medium text-blue-900">Protocolo Automático</h4>
                  <p className="text-sm text-blue-700">
                    Se creará automáticamente un incidente con el protocolo: "{selectedRisk.protocolo.titulo}"
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setMaterializeModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="border border-primary-blue text-white bg-primary-blue" type="submit">Materializar Riesgo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de riesgo */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Riesgo</DialogTitle>
            <DialogDescription>Información completa y acciones de mitigación</DialogDescription>
          </DialogHeader>
          {selectedRisk && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Nombre del Riesgo</h4>
                  <p>{selectedRisk.nombre}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Categoría</h4>
                  <p>{selectedRisk.categoria}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Descripción</h4>
                <p className="text-sm">{selectedRisk.descripcion}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Impacto</h4>
                  <Badge variant="outline" className={getImpactColor(selectedRisk.impacto)}>
                    {selectedRisk.impacto}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Probabilidad</h4>
                  <p>{selectedRisk.probabilidad}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Estado</h4>
                  <Badge variant={selectedRisk.estado === "Activo" ? "default" : "outline"}>
                    {selectedRisk.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Responsable</h4>
                <p>{selectedRisk.responsable?.nombre_completo || "Sin asignar"}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Medidas de Mitigación</h4>
                <p className="text-sm">{selectedRisk.medidas_mitigacion}</p>
              </div>
              {selectedRisk.protocolo && (
                <div>
                  <h4 className="mb-2 font-semibold">Protocolo Vinculado</h4>
                  <div className="rounded-md border border-primary-blue p-3">
                    <p className="font-medium">{selectedRisk.protocolo.titulo}</p>
                    <p className="text-sm text-primary-blue">{selectedRisk.protocolo.descripcion}</p>
                    <Badge variant="outline" className="mt-2">
                      {selectedRisk.protocolo.severidad}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Cerrar
            </Button>
            {isAdmin && selectedRisk && (
              <Button className="border border-primary-blue text-white bg-primary-blue" onClick={() => openMaterializeModal(selectedRisk)}>
                <Zap className="mr-2 h-4 w-4" />
                Materializar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de materialización */}
      <Dialog open={materializationDetailsOpen} onOpenChange={setMaterializationDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Materialización</DialogTitle>
            <DialogDescription>Información completa del evento materializado</DialogDescription>
          </DialogHeader>
          {selectedMaterialization && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Riesgo</h4>
                  <p>{selectedMaterialization.riesgo?.nombre}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Fecha</h4>
                  <p>{formatDate(selectedMaterialization.fecha_materializacion)}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Descripción del Evento</h4>
                <p className="text-sm">{selectedMaterialization.descripcion_evento}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Severidad Real</h4>
                  <Badge variant="outline" className={getImpactColor(selectedMaterialization.severidad_real)}>
                    {selectedMaterialization.severidad_real}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Estado</h4>
                  <Badge variant="outline" className={getStatusColor(selectedMaterialization.estado)}>
                    {selectedMaterialization.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Acciones Tomadas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterialization.acciones_tomadas.map((accion, index) => (
                    <Badge key={index} variant="outline">
                      {accion}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Reportado por</h4>
                <p>{selectedMaterialization.usuario_reporta?.nombre_completo}</p>
              </div>
              {selectedMaterialization.incidente_generado && (
                <div>
                  <h4 className="mb-2 font-semibold">Incidente Generado</h4>
                  <div className="rounded-md border border-primary-blue p-3">
                    <p className="font-medium">{selectedMaterialization.incidente_generado.titulo}</p>
                    <p className="text-sm text-primary-blue">
                      Estado: {selectedMaterialization.incidente_generado.estado}
                    </p>
                  </div>
                </div>
              )}
              {selectedMaterialization.notas && (
                <div>
                  <h4 className="mb-2 font-semibold">Notas</h4>
                  <p className="text-sm">{selectedMaterialization.notas}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" onClick={() => setMaterializationDetailsOpen(false)}>
              Cerrar
            </Button>
            {isAdmin && selectedMaterialization?.incidente_generado && (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Ver Incidente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
