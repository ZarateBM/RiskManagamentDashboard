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
import { Plus, Search, Filter, Play, FileText, AlertTriangle, ArrowRight } from "lucide-react"
import {
  supabase,
  type Incidente,
  type Riesgo,
  type Protocolo,
  type Usuario,
  type EjecucionProtocolo,
} from "@/lib/supabase"
import ProtocolExecution from "@/components/protocol-execution"

export default function IncidentTrackingIntegrated() {
  const [executingProtocol, setExecutingProtocol] = useState<number | null>(null)
  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [riesgos, setRiesgos] = useState<Riesgo[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [ejecucionesEnProgreso, setEjecucionesEnProgreso] = useState<EjecucionProtocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Campos del formulario
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [severidad, setSeveridad] = useState("")
  const [asignadoA, setAsignadoA] = useState("")
  const [riesgoId, setRiesgoId] = useState("")
  const [protocoloId, setProtocoloId] = useState("")

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem("usuario")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Cargar incidentes con riesgos y protocolos
      const { data: incidentesData, error: incidentesError } = await supabase
        .from("incidentes")
        .select(`
          *,
          riesgo:riesgos(*),
          protocolo:protocolos(*)
        `)
        .order("fecha_reporte", { ascending: false })

      if (incidentesError) throw incidentesError

      // Cargar riesgos activos
      const { data: riesgosData, error: riesgosError } = await supabase
        .from("riesgos")
        .select("*")
        .eq("estado", "Activo")
        .order("nombre")

      if (riesgosError) throw riesgosError

      // Cargar protocolos activos
      const { data: protocolosData, error: protocolosError } = await supabase
        .from("protocolos")
        .select("*")
        .eq("activo", true)
        .order("titulo")

      if (protocolosError) throw protocolosError

      // Cargar ejecuciones en progreso
      const { data: ejecucionesData, error: ejecucionesError } = await supabase
        .from("ejecuciones_protocolo")
        .select(`
          *,
          protocolo:protocolos(*),
          incidente:incidentes(*),
          usuario:usuarios(*)
        `)
        .eq("estado", "En progreso")
        .order("fecha_inicio", { ascending: false })

      if (ejecucionesError) throw ejecucionesError

      setIncidentes(incidentesData || [])
      setRiesgos(riesgosData || [])
      setProtocolos(protocolosData || [])
      setEjecucionesEnProgreso(ejecucionesData || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      alert("Solo los administradores pueden crear incidentes")
      return
    }

    try {
      const nuevoIncidente = {
        titulo,
        descripcion,
        categoria,
        severidad,
        estado: "Pendiente",
        asignado_a: asignadoA,
        riesgo_id: riesgoId ? Number.parseInt(riesgoId) : null,
        protocolo_id: protocoloId ? Number.parseInt(protocoloId) : null,
        protocolo_ejecutado: false,
      }

      const { error } = await supabase.from("incidentes").insert([nuevoIncidente])

      if (error) throw error

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
    } catch (error) {
      console.error("Error creando incidente:", error)
    }
  }

  // Modificar la función ejecutarProtocolo para redirigir a la ejecución
  const ejecutarProtocolo = async (incidente: Incidente) => {
    if (!incidente.protocolo_id || !isAdmin) {
      if (!isAdmin) {
        alert("Solo los administradores pueden ejecutar protocolos")
      }
      return
    }

    try {
      // Crear ejecución de protocolo
      const { data: ejecucionData, error } = await supabase
        .from("ejecuciones_protocolo")
        .insert([
          {
            protocolo_id: incidente.protocolo_id,
            incidente_id: incidente.id_incidente,
            usuario_id: currentUser?.id_usuario,
            estado: "En progreso",
            progreso: 0,
            pasos_completados: [],
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado del incidente
      await supabase
        .from("incidentes")
        .update({
          estado: "En proceso",
          protocolo_ejecutado: true,
        })
        .eq("id_incidente", incidente.id_incidente)

      // Redirigir a la ejecución del protocolo
      setExecutingProtocol(ejecucionData.id_ejecucion)
    } catch (error) {
      console.error("Error ejecutando protocolo:", error)
    }
  }

  const continuarEjecucion = (ejecucionId: number) => {
    setExecutingProtocol(ejecucionId)
  }

  const resetForm = () => {
    setTitulo("")
    setDescripcion("")
    setCategoria("")
    setSeveridad("")
    setAsignadoA("")
    setRiesgoId("")
    setProtocoloId("")
  }

  const filteredIncidents = incidentes.filter((incidente) => {
    const matchesSearch = incidente.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "Todos" || incidente.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case "Crítica":
        return "bg-red-100 text-red-800"
      case "Alta":
        return "bg-amber-100 text-amber-800"
      case "Media":
        return "bg-yellow-100 text-yellow-800"
      case "Baja":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-red-100 text-red-800"
      case "En proceso":
        return "bg-blue-100 text-blue-800"
      case "Resuelto":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  // Agregar modal para gestionar incidentes
  const [selectedIncident, setSelectedIncident] = useState<Incidente | null>(null)
  const [manageModalOpen, setManageModalOpen] = useState(false)

  const openManageModal = (incidente: Incidente) => {
    setSelectedIncident(incidente)
    setManageModalOpen(true)
  }

  if (executingProtocol) {
    return (
      <ProtocolExecution
        ejecucionId={executingProtocol}
        onBack={() => {
          setExecutingProtocol(null)
          cargarDatos()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Cargando incidentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ejecuciones en progreso */}
      {ejecucionesEnProgreso.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Protocolos en Ejecución</CardTitle>
            <CardDescription>Continúe con los protocolos que están en progreso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ejecucionesEnProgreso.map((ejecucion) => (
                <div key={ejecucion.id_ejecucion} className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Play className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{ejecucion.protocolo?.titulo}</p>
                      <p className="text-sm text-muted-foreground">Incidente: {ejecucion.incidente?.titulo}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-blue-500" style={{ width: `${ejecucion.progreso}%` }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{ejecucion.progreso}%</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => continuarEjecucion(ejecucion.id_ejecucion)} disabled={!isAdmin}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continuar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento de Incidentes Integrado</CardTitle>
              <CardDescription>Incidentes vinculados con riesgos y protocolos de respuesta</CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Incidente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Incidente</DialogTitle>
                    <DialogDescription>Complete la información y vincule con riesgo y protocolo</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateIncident}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="incident-title">Título del Incidente</Label>
                        <Input
                          id="incident-title"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-description">Descripción</Label>
                        <Textarea
                          id="incident-description"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="incident-category">Categoría</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="incident-severity">Severidad</Label>
                          <Select value={severidad} onValueChange={setSeveridad}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar severidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Crítica">Crítica</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Media">Media</SelectItem>
                              <SelectItem value="Baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-risk">Riesgo Relacionado</Label>
                        <Select value={riesgoId} onValueChange={setRiesgoId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar riesgo (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {riesgos.map((riesgo) => (
                              <SelectItem key={riesgo.id_riesgo} value={riesgo.id_riesgo.toString()}>
                                {riesgo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-protocol">Protocolo de Respuesta</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="incident-assigned">Asignar a</Label>
                        <Input
                          id="incident-assigned"
                          value={asignadoA}
                          onChange={(e) => setAsignadoA(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Registrar Incidente</Button>
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
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar incidentes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filtros:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incidente</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo Relacionado</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incidente) => (
                <TableRow key={incidente.id_incidente}>
                  <TableCell className="font-medium">{incidente.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(incidente.severidad)}>
                      {incidente.severidad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(incidente.estado)}>
                      {incidente.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {incidente.riesgo ? (
                      <span className="text-sm">{incidente.riesgo.nombre}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin riesgo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {incidente.protocolo ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{incidente.protocolo.titulo}</span>
                        {incidente.protocolo_ejecutado && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Ejecutado
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin protocolo</span>
                    )}
                  </TableCell>
                  <TableCell>{incidente.asignado_a}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {incidente.protocolo_id && !incidente.protocolo_ejecutado && isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => ejecutarProtocolo(incidente)}>
                          <Play className="mr-2 h-4 w-4" />
                          Ejecutar Protocolo
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openManageModal(incidente)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Gestionar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={manageModalOpen} onOpenChange={setManageModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gestión de Incidente</DialogTitle>
            <DialogDescription>Detalles y seguimiento del incidente</DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedIncident.titulo}</h3>
                <Badge variant="outline" className={getStatusColor(selectedIncident.estado)}>
                  {selectedIncident.estado}
                </Badge>
              </div>
              <div className="rounded-md border border-primary-blue p-3">
                <h4 className="mb-2 font-medium">Descripción</h4>
                <p className="text-sm">{selectedIncident.descripcion}</p>
              </div>
              {selectedIncident.riesgo && (
                <div className="rounded-md border border-primary-blue p-3">
                  <h4 className="mb-2 font-medium">Riesgo Relacionado</h4>
                  <p className="text-sm">{selectedIncident.riesgo.nombre}</p>
                </div>
              )}
              {selectedIncident.protocolo && (
                <div className="rounded-md border border-primary-blue p-3">
                  <h4 className="mb-2 font-medium">Protocolo Asignado</h4>
                  <p className="text-sm">{selectedIncident.protocolo.titulo}</p>
                  {selectedIncident.protocolo_ejecutado && (
                    <Badge className="mt-2 bg-green-100 text-green-800">Protocolo Ejecutado</Badge>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-medium">Severidad</h4>
                  <Badge variant="outline" className={getSeverityColor(selectedIncident.severidad)}>
                    {selectedIncident.severidad}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Asignado a</h4>
                  <p className="text-sm">{selectedIncident.asignado_a}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageModalOpen(false)}>
              Cerrar
            </Button>
            {selectedIncident?.protocolo_id && !selectedIncident.protocolo_ejecutado && isAdmin && (
              <Button
                onClick={() => {
                  setManageModalOpen(false)
                  ejecutarProtocolo(selectedIncident)
                }}
              >
                Ejecutar Protocolo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
