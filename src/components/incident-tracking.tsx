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
import { Filter, Plus, Search } from "lucide-react"
import { useIncidents, Incidente } from "@/hooks/useIncidents"
import { useCategory, Categoria } from "@/hooks/useCategory"
import { useUsers } from "@/hooks/useGetUser"

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
  const { users, loading: loadingUsers } = useUsers()

  const {
    incidents,
    loading: loadingIncidents,
    error: errorIncidents,
    createIncident,
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
      statusFilter === 'Todos' || incident.estadoIncidente === statusFilter
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
      case 'Asignado':           return 'bg-blue-100 text-blue-800'
      case 'En analisis':        return 'bg-amber-100 text-amber-800'
      case 'En proceso':return 'bg-yellow-100 text-yellow-800'
      case 'Cerrado':            return 'bg-green-100 text-green-800'
      case 'Reabierto':          return 'bg-red-100 text-red-800'
      default:                   return ''
    }
  }

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
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Incidente
                </Button>
              </DialogTrigger>
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
                          setNewIncident((prev) => ({ ...prev, idUsuarioRegistro: Number(value) }))
                        }
                        defaultValue={newIncident.idUsuarioRegistro.toString()}
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
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
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
            <p>Cargando incidentes...</p>
          ) : errorIncidents ? (
            <p className="text-red-500">{errorIncidents}</p>
          ) : statusFilter === "Ninguno" && searchTerm === "" ? (
            <div className="text-center py-8 text-muted-foreground">
              Escribe o selecciona un filtro para ver
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron incidentes
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incidente</TableHead>
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
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(incident.severidad)}>{incident.severidad}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(incident.estadoIncidente as StatusOption)}>{incident.estadoIncidente}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(incident.fechaIncidente)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => deleteIncident(incident.idIncidente!)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredIncidents.length} de {incidents.length} incidentes
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
