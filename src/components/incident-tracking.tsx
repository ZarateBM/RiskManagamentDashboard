"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Filter, Plus, Search, FileText, FileDown } from "lucide-react"
import { useIncidents, Incidente } from "@/hooks/useIncidents"
import { useCategory, Categoria } from "@/hooks/useCategory"
import { useUsers } from "@/hooks/useGetUser"
import { User as UserType } from "@/types/User"
import PdfGenerator, { PdfData } from "./PDF/PdfGenerator"
import { useSession } from "@/hooks/useSession"

// Lista estática de estados de incidente
type StatusOption =
  | "Asignado"
  | "En analisis"
  | "En proceso"
  | "Cerrado"
  | "Reabierto"

const STATUS_OPTIONS: StatusOption[] = [
  "Asignado",
  "En analisis",
  "En proceso",
  "Cerrado",
  "Reabierto",
]

type SeverityOption = "Crítica" | "Alta" | "Media" | "Baja"

const SEVERITY_OPTIONS: SeverityOption[] = ["Crítica", "Alta", "Media", "Baja"]

export default function IncidentTracking() {
  const user = useSession();
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [selectedIncidentForPdf, setSelectedIncidentForPdf] = useState<number | null>(null);
  const { users, loading: loadingUsers } = useUsers()

  const {
    incidents,
    loading: loadingIncidents,
    error: errorIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents()

  const {
    categorias,
    loading: loadingCats,
    error: errorCats,
  } = useCategory()

  // Form states for creación
  const [newIncident, setNewIncident] = useState<
    Omit<Incidente, 'idIncidente' | 'fechaRegistro' | 'registroEstado'>
  >({
    idCategoria: 0,
    titulo: '',
    severidad: '',
    descripcion: '',
    estadoIncidente: STATUS_OPTIONS[0],
    fechaIncidente: new Date().toISOString().slice(0, 16),
    accionesTomadas: '',
    idUsuarioRegistro: 0,
    responsableId: 0,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | 'Todos'>("Todos")
  const [statusFilter, setStatusFilter] = useState<string | 'Ninguno'>("Ninguno")

  const handleCreate = async () => {
    const created = await createIncident({
      ...newIncident,
      fechaIncidente: new Date(newIncident.fechaIncidente).toISOString(),
    })
  }

  // Filtrado
  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter === 'Ninguno' && searchTerm === '') return false
    const matchesSearch =
      searchTerm === '' || incident.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'Todos' || incident.idCategoria.toString() === categoryFilter
    const matchesStatus =
      statusFilter === 'Todos' || statusFilter === 'Ninguno' || incident.estadoIncidente === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Crítica': return 'bg-red-100 text-red-800'
      case 'Alta':    return 'bg-amber-100 text-amber-800'
      case 'Media':   return 'bg-yellow-100 text-yellow-800'
      case 'Baja':    return 'bg-green-100 text-green-800'
      default:         return ''
    }
  }

  const getStatusColor = (status: StatusOption) => {
    switch (status) {
      case 'Asignado':     return 'bg-blue-100 text-blue-800'
      case 'En analisis':  return 'bg-amber-100 text-amber-800'
      case 'En proceso':   return 'bg-yellow-100 text-yellow-800'
      case 'Cerrado':      return 'bg-green-100 text-green-800'
      case 'Reabierto':    return 'bg-red-100 text-red-800'
      default:             return ''
    }
  }

  // Función para obtener nombre de usuario
  const getUserNameById = (userId: number): string => {
    const user = users.find((u: UserType) => u.idUsuario === userId)
    return user?.nombreCompleto || "Usuario no encontrado"
  }

  // Función para obtener nombre de categoría
  const getCategoryNameById = (categoryId: number): string => {
    const category = categorias.find((c: Categoria) => c.idCategoria === categoryId)
    return category?.nombre || "Categoría no encontrada"
  }

  // Generar datos para PDF
  const generatePdfData = (): PdfData => {
    if (selectedIncidentForPdf) {
      const selected = incidents.find(
        (incident) => incident.idIncidente === selectedIncidentForPdf
      );
      if (selected) {
        return {
          title: `Informe de Incidente: ${selected.titulo}`,
          content: {
            ID: selected.idIncidente,
            Título: selected.titulo,
            Categoría: getCategoryNameById(selected.idCategoria),
            Descripción: selected.descripcion || "Sin descripción",
            Severidad: selected.severidad,
            Estado: selected.estadoIncidente,
            "Fecha del Incidente": formatDate(selected.fechaIncidente),
            "Acciones Tomadas": selected.accionesTomadas || "No especificadas",
            "Usuario Registro": getUserNameById(selected.idUsuarioRegistro),
            "Responsable": getUserNameById(selected.responsableId || 0),
          },
          footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Incidentes`,
        };
      }
    }

    return {
      title: "Informe General de Incidentes",
      content: {
        "Fecha del informe": new Date().toLocaleDateString(),
        "Total de incidentes": filteredIncidents.length.toString(),
        Filtros: `${categoryFilter !== "Todos" ? "Cat: " + categoryFilter : ""} ${
          statusFilter !== "Ninguno" ? "Estado: " + statusFilter : ""
        }`.trim() || "Ninguno",
        Búsqueda: searchTerm || "Ninguna",
      },
      items: filteredIncidents.map((item) => ({
        ID: item.idIncidente,
        Título: item.titulo,
        Categoría: getCategoryNameById(item.idCategoria),
        Severidad: item.severidad,
        Estado: item.estadoIncidente,
        Fecha: formatDate(item.fechaIncidente),
      })),
      footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Incidentes`,
    };
  };

  const handleGenerateSingleIncidentPdf = (id: number) => {
    setSelectedIncidentForPdf(id);
    setShowPdfPreview(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento de Incidentes</CardTitle>
              <CardDescription>Registro y gestión de incidentes</CardDescription>
            </div>
            <Dialog>
              { user?.rol === "Administrador" ?
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Incidente
                </Button>
              </DialogTrigger>
              : null
              }
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Incidente</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo incidente
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-title">Título</Label>
                    <Input
                      id="incident-title"
                      value={newIncident.titulo}
                      onChange={e => setNewIncident(prev => ({ ...prev, titulo: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident-category">Categoría</Label>
                      {loadingCats ? (
                        <p>Cargando categorías...</p>
                      ) : errorCats ? (
                        <p className="text-red-500">{errorCats}</p>
                      ) : (
                        <Select
                          onValueChange={value =>
                            setNewIncident(prev => ({ ...prev, idCategoria: Number(value) }))
                          }
                          defaultValue=""
                        >
                          <SelectTrigger id="incident-category">
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((cat: Categoria) => (
                              <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident-severity">Severidad</Label>
                      <Select
                        onValueChange={value => setNewIncident(prev => ({ ...prev, severidad: value as SeverityOption }))}
                        defaultValue={newIncident.severidad}
                      >
                        <SelectTrigger id="">
                          <SelectValue placeholder="Severidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident-state">Estado</Label>
                      <Select
                        onValueChange={value => setNewIncident(prev => ({ ...prev, estadoIncidente: value as StatusOption }))}
                        defaultValue={newIncident.estadoIncidente}
                      >
                        <SelectTrigger id="incident-state">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-description">Descripción</Label>
                    <Textarea
                      id="incident-description"
                      value={newIncident.descripcion}
                      onChange={e => setNewIncident(prev => ({ ...prev, descripcion: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident-date">Fecha y Hora</Label>
                      <Input
                        id="incident-date"
                        type="datetime-local"
                        value={newIncident.fechaIncidente}
                        onChange={e => setNewIncident(prev => ({ ...prev, fechaIncidente: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident-actions">Acciones Tomadas</Label>
                      <Textarea
                        id="incident-actions"
                        value={newIncident.accionesTomadas}
                        onChange={e => setNewIncident(prev => ({ ...prev, accionesTomadas: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-user">Responsable</Label>
                    {loadingUsers ? (
                      <p>Cargando usuarios...</p>
                    ) : (
                      <Select
                        onValueChange={(value) =>
                          setNewIncident((prev) => ({ ...prev, responsableId: Number(value) }))
                        }
                        defaultValue={newIncident.responsableId ? newIncident.responsableId.toString() : ""}
                      >
                        <SelectTrigger id="incident-user">
                          <SelectValue placeholder="Seleccionar responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.idUsuario} value={user.idUsuario.toString()}>
                              {user.nombreCompleto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate}>Registrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguno">Ninguno</SelectItem>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loadingIncidents ? (
            <div className="text-center py-8">Cargando incidentes...</div>
          ) : errorIncidents ? (
            <div className="text-center py-8 text-red-500">{errorIncidents}</div>
          ) : statusFilter === "Ninguno" && searchTerm === "" ? (
            <div className="text-center py-8 text-muted-foreground">
              Escribe en el campo de búsqueda o selecciona un filtro para ver los incidentes
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron incidentes con los filtros aplicados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incidente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map(incident => (
                  <TableRow key={incident.idIncidente}>
                    <TableCell>{incident.titulo}</TableCell>
                    <TableCell>{getCategoryNameById(incident.idCategoria)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(incident.severidad)}>
                        {incident.severidad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(incident.estadoIncidente as StatusOption)}>
                        {incident.estadoIncidente}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(incident.fechaIncidente)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <FileText className="mr-1 h-4 w-4" />
                              Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>{incident.titulo}</DialogTitle>
                              <DialogDescription>
                                Registrado el {formatDate(incident.fechaIncidente)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <p><strong>Categoría:</strong> {getCategoryNameById(incident.idCategoria)}</p>
                              <p><strong>Descripción:</strong> {incident.descripcion || "Sin descripción"}</p>
                              <p><strong>Severidad:</strong> {incident.severidad}</p>
                              <p><strong>Estado:</strong> {incident.estadoIncidente}</p>
                              <p><strong>Acciones Tomadas:</strong> {incident.accionesTomadas || "No especificadas"}</p>
                              <p><strong>Responsable:</strong> {getUserNameById(incident.responsableId || 0)}</p>
                              <p><strong>Registrado por:</strong> {getUserNameById(incident.idUsuarioRegistro)}</p>
                            </div>
                            <DialogFooter>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleGenerateSingleIncidentPdf(incident.idIncidente!)}
                                >
                                  <FileDown className="mr-1 h-4 w-4" />
                                  Ver PDF
                                </Button>
                                { user?.rol === "Administrador" ?
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteIncident(incident.idIncidente!)}
                                >
                                  Eliminar
                                </Button>
                                : null
                                }
                                { user?.rol === "Administrador" ?
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateIncident(incident.idIncidente!, incident)}
                                >
                                  Editar
                                </Button>
                                : null
                                }
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredIncidents.length} de {incidents.length} incidentes
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedIncidentForPdf(null);
              setShowPdfPreview(true);
            }}
          >
            <FileDown className="mr-1 h-4 w-4" />
            Exportar PDF
          </Button>
        </CardFooter>
      </Card>
      
      {/* Dialog para PDF */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview} modal>
        <DialogContent className="sm:max-w-[80%] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedIncidentForPdf
                ? "Vista Previa Incidente"
                : "Vista Previa Informe"}
            </DialogTitle>
            <DialogDescription>
              {selectedIncidentForPdf ? "Informe específico de incidente" : "Listado completo de incidentes"}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[60vh]">
            <PdfGenerator
              data={generatePdfData()}
              fileName={
                selectedIncidentForPdf
                  ? `incidente-${selectedIncidentForPdf}.pdf`
                  : "informe-incidentes.pdf"
              }
              preview
            />
          </div>
          <DialogFooter>
            <PdfGenerator
              data={generatePdfData()}
              fileName={
                selectedIncidentForPdf
                  ? `incidente-${selectedIncidentForPdf}.pdf`
                  : "informe-incidentes.pdf"
              }
              preview={false}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}