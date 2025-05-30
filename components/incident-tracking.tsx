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
import { Calendar, Clock, Droplets, Filter, Lock, Plus, Search, Server, UserCircle, Zap } from "lucide-react"

// Datos de ejemplo para incidentes
const incidentData = [
  {
    id: 1,
    title: "Humedad elevada",
    description: "Se detectó humedad por encima del 70% durante más de 4 horas",
    category: "Ambiental",
    severity: "Media",
    status: "En proceso",
    dateReported: "2025-03-18T10:30:00",
    assignedTo: "Mantenimiento",
    icon: <Droplets className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 2,
    title: "Intento de acceso no autorizado",
    description: "Se detectaron 3 intentos fallidos de acceso con tarjeta RFID no registrada",
    category: "Seguridad Física",
    severity: "Alta",
    status: "Resuelto",
    dateReported: "2025-03-17T16:45:00",
    assignedTo: "Seguridad",
    icon: <Lock className="h-4 w-4 text-purple-500" />,
  },
  {
    id: 3,
    title: "Fallo en servidor principal",
    description: "El servidor principal presentó un error de disco y se activó el servidor de respaldo",
    category: "Operativo",
    severity: "Crítica",
    status: "Pendiente",
    dateReported: "2025-03-20T08:15:00",
    assignedTo: "TI",
    icon: <Server className="h-4 w-4 text-orange-500" />,
  },
  {
    id: 4,
    title: "Fluctuación de energía",
    description: "Se detectó una caída de voltaje que activó el sistema UPS",
    category: "Ambiental",
    severity: "Baja",
    status: "Resuelto",
    dateReported: "2025-03-15T22:10:00",
    assignedTo: "Ing. Eléctrico",
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
  },
]

export default function IncidentTracking() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("Todos")

  // Filtrar los incidentes según los criterios
  const filteredIncidents = incidentData.filter((incident) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Todos" || incident.category === categoryFilter
    const matchesStatus = statusFilter === "Todos" || incident.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Función para formatear la fecha
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

  // Función para obtener el color del badge según la severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Crítica":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Alta":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Media":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Baja":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return ""
    }
  }

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "En proceso":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Resuelto":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento de Incidentes</CardTitle>
              <CardDescription>Registro y gestión de incidentes en el cuarto de comunicaciones</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Incidente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Incidente</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo incidente en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-title">Título del Incidente</Label>
                    <Input id="incident-title" placeholder="Ej: Fallo en sistema de refrigeración" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident-category">Categoría</Label>
                      <Select>
                        <SelectTrigger id="incident-category">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ambiental">Ambiental</SelectItem>
                          <SelectItem value="seguridad">Seguridad Física</SelectItem>
                          <SelectItem value="operativo">Operativo</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident-severity">Severidad</Label>
                      <Select>
                        <SelectTrigger id="incident-severity">
                          <SelectValue placeholder="Seleccionar severidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critica">Crítica</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-description">Descripción</Label>
                    <Textarea id="incident-description" placeholder="Describa el incidente en detalle" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident-date">Fecha y Hora</Label>
                      <Input id="incident-date" type="datetime-local" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident-assigned">Asignar a</Label>
                      <Select>
                        <SelectTrigger id="incident-assigned">
                          <SelectValue placeholder="Seleccionar responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ti">Departamento TI</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="seguridad">Seguridad</SelectItem>
                          <SelectItem value="electrico">Ing. Eléctrico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Registrar Incidente</Button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filtros:</span>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas las categorías</SelectItem>
                  <SelectItem value="Ambiental">Ambiental</SelectItem>
                  <SelectItem value="Seguridad Física">Seguridad Física</SelectItem>
                  <SelectItem value="Operativo">Operativo</SelectItem>
                  <SelectItem value="Digital">Digital</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
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
                <TableHead>Categoría</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Reportado</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {incident.icon}
                      {incident.title}
                    </div>
                  </TableCell>
                  <TableCell>{incident.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(incident.dateReported)}</TableCell>
                  <TableCell>{incident.assignedTo}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Gestionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Gestión de Incidente</DialogTitle>
                          <DialogDescription>Detalles y seguimiento del incidente</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{incident.title}</h3>
                            <Badge variant="outline" className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Reportado: {formatDate(incident.dateReported)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserCircle className="h-4 w-4" />
                                <span>Asignado a: {incident.assignedTo}</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-md border border-primary-blue p-3">
                            <h4 className="mb-2 font-medium">Descripción</h4>
                            <p className="text-sm">{incident.description}</p>
                          </div>
                          <div>
                            <h4 className="mb-2 font-medium">Historial de Acciones</h4>
                            <div className="space-y-2">
                              <div className="rounded-md border border-primary-blue p-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Actualización de estado</p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Hace 2 horas</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Se cambió el estado de "Pendiente" a "En proceso"
                                </p>
                              </div>
                              <div className="rounded-md border border-primary-blue p-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Asignación</p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Hace 1 día</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Incidente asignado a {incident.assignedTo}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="update-comment">Agregar Comentario</Label>
                            <Textarea id="update-comment" placeholder="Escriba un comentario o actualización..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="update-status">Actualizar Estado</Label>
                              <Select>
                                <SelectTrigger id="update-status">
                                  <SelectValue placeholder={incident.status} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="en-proceso">En proceso</SelectItem>
                                  <SelectItem value="resuelto">Resuelto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="update-assigned">Reasignar</Label>
                              <Select>
                                <SelectTrigger id="update-assigned">
                                  <SelectValue placeholder={incident.assignedTo} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ti">Departamento TI</SelectItem>
                                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                  <SelectItem value="seguridad">Seguridad</SelectItem>
                                  <SelectItem value="electrico">Ing. Eléctrico</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancelar</Button>
                          <Button>Guardar Cambios</Button>
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
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredIncidents.length} de {incidentData.length} incidentes
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              Imprimir
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
