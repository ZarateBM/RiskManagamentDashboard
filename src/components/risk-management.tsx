"use client" 

import { useState } from "react"
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
import { FileText, Plus, Search, Filter, FileDown, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Importamos nuestros hooks personalizados
import { useRisk } from "../hooks/useRisk"
import { useCategory, Categoria } from "../hooks/useCategory"

// Importamos el componente PdfGenerator
import PdfGenerator, { PdfData } from "../components/PDF/PdfGenerator"

export default function RiskManagement() {
  const [showCategories, setShowCategories] = useState(false)
  const [editOpen, setEditOpen] = useState<boolean>(false)
  const [editForm, setEditForm] = useState<Partial<Categoria>>({})
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false)
  const [selectedRiskForPdf, setSelectedRiskForPdf] = useState<number | null>(null)

  const risk = useRisk()
  const category = useCategory()

  // Obtener riesgos filtrados
  const filteredRisks = risk.getFilteredRisks()

  // Manejar apertura de diálogo de edición
  const handleEditClick = (cat: Categoria) => {
    setEditForm(cat)
    setEditOpen(true)
  }
  

  const handleUpdateCategory = () => {
    if (editForm.idCategoria && editForm.nombre) {
      category.updateCategory(
        editForm.idCategoria,
        { nombre: editForm.nombre, descripcion: editForm.descripcion || "" }
      )
      setEditOpen(false)
      setEditForm({})
    }
  }


  const generatePdfData = (): PdfData => {
  
    if (selectedRiskForPdf) {
      const selectedRisk = risk.riskData.find(r => r.idRiesgo === selectedRiskForPdf);
      
      if (selectedRisk) {
        return {
          title: `Informe de Riesgo: ${selectedRisk.titulo}`,
          content: {
            'ID': selectedRisk.idRiesgo,
            'Categoría': selectedRisk.categoria?.nombre || 'No asignada',
            'Impacto': selectedRisk.impacto,
            'Probabilidad': selectedRisk.probabilidad,
            'Estado': selectedRisk.estado,
            'Fecha de Registro': new Date(selectedRisk.fechaRegistro).toLocaleDateString(),
            'Registrado por': selectedRisk.registradoPor?.nombreCompleto || 'No especificado',
            'Responsable': selectedRisk.responsable?.nombreCompleto || 'No asignado',
            'Planes de Mitigación': selectedRisk.planesMitigar?.length 
              ? selectedRisk.planesMitigar.map(p => p.nombre).join(", ") 
              : "No hay planes de mitigación registrados",
            'Planes de Evitación': selectedRisk.planesEvitar?.length 
              ? selectedRisk.planesEvitar.map(p => p.nombre).join(", ") 
              : "No hay planes de evitación registrados"
          },
          footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Riesgos`
        };
      }
    }
    

    return {
      title: 'Informe de Riesgos',
      content: {
        'Fecha del informe': new Date().toLocaleDateString(),
        'Total de riesgos': filteredRisks.length.toString(),
        'Filtros aplicados': `${risk.categoryFilter !== 'Todos' ? 'Categoría: ' + risk.categoryFilter : ''} ${risk.impactFilter !== 'Ninguno' ? 'Impacto: ' + risk.impactFilter : ''}`.trim() || 'Ninguno',
        'Término de búsqueda': risk.searchTerm || 'Ninguno'
      },
      items: filteredRisks.map(item => ({
        'ID': item.idRiesgo,
        'Título': item.titulo,
        'Categoría': item.categoria?.nombre || '—',
        'Impacto': item.impacto,
        'Probabilidad': item.probabilidad,
        'Estado': item.estado
      })),
      footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Riesgos`
    };
  };

  // Gestionar la generación de PDF para un riesgo específico
  const handleGenerateSingleRiskPdf = (riskId: number) => {
    setSelectedRiskForPdf(riskId);
    setShowPdfPreview(true);
  };

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
              <Dialog open={category.openNew} onOpenChange={category.setOpenNew}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Nueva Categoría</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                    <DialogDescription>Complete la información de la categoría</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {category.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{category.error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input 
                        id="nombre" 
                        value={category.form.nombre}
                        onChange={e => category.updateForm("nombre", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea 
                        id="descripcion" 
                        value={category.form.descripcion}
                        onChange={e => category.updateForm("descripcion", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={category.createCategory}>Guardar Categoría</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Diálogo para crear riesgo */}
              <Dialog open={risk.openNew} onOpenChange={risk.setOpenNew}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" />Nuevo Riesgo</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Riesgo</DialogTitle>
                    <DialogDescription>Complete todos los campos</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {risk.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{risk.error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input 
                        id="titulo" 
                        value={risk.form.titulo}
                        onChange={e => risk.updateForm("titulo", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        {/* Selector de categorías por nombre */}
                        <Select 
                          value={risk.form.categoriaSeleccionada} 
                          onValueChange={value => risk.updateForm("categoriaSeleccionada", value)}
                        >
                          <SelectTrigger id="categoria">
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {category.loading ? (
                              <SelectItem value="cargando">Cargando categorías...</SelectItem>
                            ) : (
                              category.categorias.map(cat => (
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
                        <Select 
                          value={risk.form.impacto} 
                          onValueChange={v => risk.updateForm("impacto", v)}
                        >
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
                        <Select 
                          value={risk.form.probabilidad} 
                          onValueChange={v => risk.updateForm("probabilidad", v)}
                        >
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
                        <Select 
                          value={risk.form.estado} 
                          onValueChange={v => risk.updateForm("estado", v)}
                        >
                          <SelectTrigger id="estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Identificado">Identificado</SelectItem>
                            <SelectItem value="Planificado">Planificado</SelectItem>
                            <SelectItem value="Mitigado">Mitigado</SelectItem>
                            <SelectItem value="En monitoreo">En monitoreo</SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                            <SelectItem value="Reactivado">Reactivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="responsable">Mitigador (ID)</Label>
                        <Input 
                          id="responsable" 
                          placeholder="ID usuario"
                          value={risk.form.responsableId}
                          onChange={e => risk.updateForm("responsableId", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrador">Registrado por (ID)</Label>
                        <Input 
                          id="registrador" 
                          placeholder="ID usuario"
                          value={risk.form.idUsuarioRegistro}
                          onChange={e => risk.updateForm("idUsuarioRegistro", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => risk.createRisk(category.categorias)}>Guardar</Button>
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
                value={risk.searchTerm}
                onChange={e => risk.setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={risk.categoryFilter} onValueChange={risk.setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {risk.getUniqueCategories().map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent> 
              </Select>
              <Select value={risk.impactFilter} onValueChange={risk.setImpactFilter}>
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
              {risk.loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Cargando riesgos...</TableCell>
                </TableRow>
              ) : filteredRisks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No se encontraron riesgos que coincidan con los criterios</TableCell>
                </TableRow>
              ) : (
                filteredRisks.map(item => (
                  <TableRow key={item.idRiesgo}>
                    <TableCell>{item.titulo}</TableCell>
                    <TableCell>{item.categoria?.nombre || "—"}</TableCell>
                    <TableCell>
                      <Badge className={risk.getImpactColor(item.impacto)}>{item.impacto}</Badge>
                    </TableCell>
                    <TableCell>{item.probabilidad}</TableCell>
                    <TableCell>
                      <Badge variant={item.estado==="Activo"?"default":"outline"}>{item.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <FileText className="mr-1 h-4 w-4" /> Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>{item.titulo}</DialogTitle>
                              <DialogDescription>
                                {item.registradoPor?.nombreCompleto ? 
                                  `Registrado por ${item.registradoPor.nombreCompleto} el ${new Date(item.fechaRegistro).toLocaleDateString()}` :
                                  `Registrado el ${new Date(item.fechaRegistro).toLocaleDateString()}`
                                }
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <p><strong>Responsable:</strong> {item.responsable?.nombreCompleto || "—"}</p>
                              <p><strong>Planes de Mitigación:</strong> {item.planesMitigar?.length ? item.planesMitigar.map(p=>p.nombre).join(", ") : "—"}</p>
                              <p><strong>Planes de Evitación:</strong> {item.planesEvitar?.length ? item.planesEvitar.map(p=>p.nombre).join(", ") : "—"}</p>
                            </div>
                            <DialogFooter>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleGenerateSingleRiskPdf(item.idRiesgo)}
                                >
                                  <FileDown className="mr-1 h-4 w-4" /> Generar PDF
                                </Button>
                                <Button variant="outline">Editar</Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredRisks.length} de {risk.riskData.length} riesgos
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedRiskForPdf(null);
                setShowPdfPreview(true);
              }}
            >
              <FileDown className="mr-1 h-4 w-4" /> Exportar a PDF
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Sección para gestionar categorías */}
      <Card>
        <CardHeader
          className="cursor-pointer flex flex-row items-center justify-between"
          onClick={() => setShowCategories(!showCategories)}
        >
          <div>
            <CardTitle>Gestión de Categorías</CardTitle>
            <CardDescription>Administre las categorías de riesgos</CardDescription>
          </div>
          <Plus
            className="h-5 w-5 transition-transform duration-200 bg"
            style={{ color: "#41ADE7",transform: showCategories ? "rotate(45deg)" : "rotate(0deg)" }}
          />
        </CardHeader>

        {showCategories && (
          <CardContent>
            {category.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{category.error}</AlertDescription>
              </Alert>
            )}
            
            {category.loading ? (
              <p>Cargando categorías...</p>
            ) : category.categorias.length === 0 ? (
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
                  {category.categorias.map(cat => (
                    <TableRow key={cat.idCategoria}>
                      <TableCell>{cat.idCategoria}</TableCell>
                      <TableCell>{cat.nombre}</TableCell>
                      <TableCell>{cat.descripcion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(cat)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => category.deleteCategory(cat.idCategoria)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>Modifica los datos de la categoría</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {category.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{category.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editForm.nombre || ""}
                  onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  rows={4}
                  value={editForm.descripcion || ""}
                  onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCategory}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Diálogo para mostrar la vista previa del PDF */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview} modal>
        <DialogContent className="sm:max-w-[80%] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedRiskForPdf 
                ? 'Vista Previa del Informe de Riesgo' 
                : 'Vista Previa del Informe de Riesgos'}
            </DialogTitle>
            <DialogDescription>
              {selectedRiskForPdf 
                ? 'Informe detallado del riesgo seleccionado' 
                : 'Listado de riesgos según los filtros aplicados'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[60vh]">
            <PdfGenerator 
              data={generatePdfData()} 
              fileName={selectedRiskForPdf ? `riesgo-${selectedRiskForPdf}.pdf` : "informe-riesgos.pdf"} 
              preview={true} 
            />
          </div>
          
          <DialogFooter>
            <PdfGenerator 
              data={generatePdfData()} 
              fileName={selectedRiskForPdf ? `riesgo-${selectedRiskForPdf}.pdf` : "informe-riesgos.pdf"} 
              preview={false} 
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}