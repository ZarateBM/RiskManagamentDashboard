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
import { Droplets, FileText, Filter, Lock, Plus, Search, Server, Shield, Waves, Zap } from "lucide-react"

// Datos de ejemplo para riesgos
const riskData = [
  {
    id: 1,
    name: "Inundación por cercanía al estero",
    category: "Ambiental",
    impact: "Crítico",
    probability: "Media",
    status: "Activo",
    mitigation: "Sensores de humedad, sellado de accesos, elevar equipos",
    responsible: "Ing. Civil",
    icon: <Waves className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 2,
    name: "Corrosión por salinidad",
    category: "Ambiental",
    impact: "Alto",
    probability: "Alta",
    status: "Activo",
    mitigation: "Materiales resistentes a corrosión, revisiones preventivas",
    responsible: "Mantenimiento",
    icon: <Droplets className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 3,
    name: "Cortes eléctricos",
    category: "Ambiental",
    impact: "Crítico",
    probability: "Alta",
    status: "Mitigado",
    mitigation: "Sistema UPS y generador instalados",
    responsible: "Ing. Eléctrico",
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
  },
  {
    id: 4,
    name: "Acceso no autorizado",
    category: "Seguridad Física",
    impact: "Alto",
    probability: "Media",
    status: "Activo",
    mitigation: "Control de acceso RFID, biometría, cámaras",
    responsible: "Seguridad",
    icon: <Lock className="h-4 w-4 text-purple-500" />,
  },
  {
    id: 5,
    name: "Fallo de equipos",
    category: "Operativo",
    impact: "Crítico",
    probability: "Baja",
    status: "Activo",
    mitigation: "Monitoreo remoto, mantenimiento preventivo",
    responsible: "TI",
    icon: <Server className="h-4 w-4 text-orange-500" />,
  },
  {
    id: 6,
    name: "Ciberataques",
    category: "Digital",
    impact: "Alto",
    probability: "Media",
    status: "Activo",
    mitigation: "Firewalls, segmentación de red, actualizaciones",
    responsible: "Seguridad TI",
    icon: <Shield className="h-4 w-4 text-green-500" />,
  },
]

export default function RiskManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [impactFilter, setImpactFilter] = useState("Ninguno")

  // Filtrar los riesgos según los criterios
  const filteredRisks = riskData.filter((risk) => {
    const matchesSearch = risk.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Todos" || risk.category === categoryFilter
    const matchesImpact = impactFilter === "Todos" || risk.impact === impactFilter
    
    // Si impactFilter es "Ninguno", solo mostrar resultados cuando hay un término de búsqueda
    if (impactFilter === "Ninguno") {
      return searchTerm.length > 0 && matchesSearch && matchesCategory
    }
    
    return matchesSearch && matchesCategory && matchesImpact
  })

  // Función para obtener el color del badge según el impacto
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Crítico":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Alto":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Medio":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Bajo":
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
              <CardTitle>Gestión de Riesgos</CardTitle>
              <CardDescription>Identificación, clasificación y mitigación de riesgos</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Riesgo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Riesgo</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo riesgo en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="risk-name">Nombre del Riesgo</Label>
                      <Input id="risk-name" placeholder="Ej: Fallo de aire acondicionado" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk-category">Categoría</Label>
                      <Select>
                        <SelectTrigger id="risk-category">
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="risk-impact">Impacto</Label>
                      <Select>
                        <SelectTrigger id="risk-impact">
                          <SelectValue placeholder="Seleccionar impacto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critico">Crítico</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="bajo">Bajo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk-probability">Probabilidad</Label>
                      <Select>
                        <SelectTrigger id="risk-probability">
                          <SelectValue placeholder="Seleccionar probabilidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk-mitigation">Medidas de Mitigación</Label>
                    <Textarea id="risk-mitigation" placeholder="Describa las medidas para mitigar este riesgo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="risk-responsible">Responsable</Label>
                      <Input id="risk-responsible" placeholder="Ej: Departamento de TI" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk-status">Estado</Label>
                      <Select>
                        <SelectTrigger id="risk-status">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="mitigado">Mitigado</SelectItem>
                          <SelectItem value="resuelto">Resuelto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Riesgo</Button>
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
                placeholder="Buscar riesgos..."
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
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Impacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguno">Ninguno</SelectItem>
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
                <TableHead>Mitigación</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.length > 0 ? (
                filteredRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {risk.icon}
                        {risk.name}
                      </div>
                    </TableCell>
                    <TableCell>{risk.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getImpactColor(risk.impact)}>
                        {risk.impact}
                      </Badge>
                    </TableCell>
                    <TableCell>{risk.probability}</TableCell>
                    <TableCell>
                      <Badge variant={risk.status === "Activo" ? "default" : "outline"}>{risk.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{risk.mitigation}</TableCell>
                    <TableCell>{risk.responsible}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Detalles del Riesgo</DialogTitle>
                            <DialogDescription>Información completa y acciones de mitigación</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Nombre del Riesgo</h4>
                                <p className="text-base">{risk.name}</p>
                              </div>
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Categoría</h4>
                                <p className="text-base">{risk.category}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Impacto</h4>
                                <Badge variant="outline" className={getImpactColor(risk.impact)}>{risk.impact}</Badge>
                              </div>
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Probabilidad</h4>
                                <p>{risk.probability}</p>
                              </div>
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Estado</h4>
                                <Badge variant={risk.status === "Activo" ? "default" : "outline"}>{risk.status}</Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Medidas de Mitigación</h4>
                                <p>{risk.mitigation}</p>
                              </div>
                              <div>
                                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">Responsable</h4>
                                <p>{risk.responsible}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Historial de Acciones</h4>
                              <div className="space-y-3">
                                <div className="rounded-md border p-3">
                                  <p className="text-sm font-medium">15/03/2025 - Revisión de medidas</p>
                                  <p className="text-sm text-muted-foreground">
                                    Se verificó la efectividad de las medidas implementadas.
                                  </p>
                                </div>
                                <div className="rounded-md border p-3">
                                  <p className="text-sm font-medium">01/03/2025 - Implementación inicial</p>
                                  <p className="text-sm text-muted-foreground">
                                    Se registró el riesgo y se definieron las medidas de mitigación.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline">Editar</Button>
                            <Button>Actualizar Estado</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    {impactFilter === "Ninguno" && searchTerm === "" ? (
                      "Escriba en el campo de búsqueda para ver los riesgos"
                    ) : (
                      "No se encontraron riesgos que coincidan con los criterios de búsqueda"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground primary-text">
            Mostrando {filteredRisks.length} de {riskData.length} riesgos
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