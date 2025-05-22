"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Plus,
  Search,
  Filter,
  FileDown,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Importamos nuestros hooks personalizados
import { useRisk } from "../hooks/useRisk";
import { useCategory, Categoria } from "../hooks/useCategory";

// Importamos el componente PdfGenerator
import PdfGenerator, { PdfData } from "../components/PDF/PdfGenerator";

export default function RiskManagement() {
  const [showCategories, setShowCategories] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState<boolean>(false);
  const [editCategoryForm, setEditCategoryForm] = useState<Partial<Categoria>>(
    {}
  );
  const [editRiskOpen, setEditRiskOpen] = useState<boolean>(false);
  const [editRiskForm, setEditRiskForm] = useState<any>({});
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [selectedRiskForPdf, setSelectedRiskForPdf] = useState<number | null>(
    null
  );

  const risk = useRisk();
  const category = useCategory();

  // Obtener riesgos filtrados
  const filteredRisks = risk.getFilteredRisks();

  // ---- Edición de Categorías ----
  const handleEditCategoryClick = (cat: Categoria) => {
    setEditCategoryForm(cat);
    setEditCategoryOpen(true);
  };

  const handleUpdateCategory = () => {
    if (editCategoryForm.idCategoria && editCategoryForm.nombre) {
      category.updateCategory(editCategoryForm.idCategoria, {
        nombre: editCategoryForm.nombre,
        descripcion: editCategoryForm.descripcion || "",
      });
      setEditCategoryOpen(false);
      setEditCategoryForm({});
    }
  };

  // ---- Edición de Riesgos ----
  const handleEditRiskClick = (item: any) => {
    setEditRiskForm({
      idRiesgo: item.idRiesgo,
      titulo: item.titulo,
      categoriaSeleccionada: item.categoria?.nombre || "",
      impacto: item.impacto,
      probabilidad: item.probabilidad,
      estado: item.estado,
      responsableId: item.responsable?.id || "",
      idUsuarioRegistro: item.registradoPor?.id || "",
    });
    setEditRiskOpen(true);
  };

  const handleUpdateRisk = () => {
    if (
      editRiskForm.idRiesgo &&
      editRiskForm.titulo &&
      editRiskForm.categoriaSeleccionada &&
      editRiskForm.impacto &&
      editRiskForm.probabilidad &&
      editRiskForm.estado
    ) {
      risk.updateRisk(
        editRiskForm.idRiesgo,
        {
          titulo: editRiskForm.titulo,
          categoriaSeleccionada: editRiskForm.categoriaSeleccionada,
          impacto: editRiskForm.impacto,
          probabilidad: editRiskForm.probabilidad,
          estado: editRiskForm.estado,
          responsableId: editRiskForm.responsableId || "",
          idUsuarioRegistro: editRiskForm.idUsuarioRegistro || "",
        },
        category.categorias
      );
      setEditRiskOpen(false);
      setEditRiskForm({});
    }
  };

  // Generación de PDF (idéntico)
  const generatePdfData = (): PdfData => {
    if (selectedRiskForPdf) {
      const selected = risk.riskData.find(
        (r) => r.idRiesgo === selectedRiskForPdf
      );
      if (selected) {
        return {
          title: `Informe de Riesgo: ${selected.titulo}`,
          content: {
            ID: selected.idRiesgo,
            Categoría: selected.categoria?.nombre || "No asignada",
            Impacto: selected.impacto,
            Probabilidad: selected.probabilidad,
            Estado: selected.estado,
            "Fecha de Registro": new Date(
              selected.fechaRegistro
            ).toLocaleDateString(),
            "Registrado por":
              selected.registradoPor?.nombreCompleto || "No especificado",
            Responsable: selected.responsable?.nombreCompleto || "No asignado",
            "Planes de Mitigación": selected.planesMitigar?.length
              ? selected.planesMitigar.map((p) => p.nombre).join(", ")
              : "—",
            "Planes de Evitación": selected.planesEvitar?.length
              ? selected.planesEvitar.map((p) => p.nombre).join(", ")
              : "—",
          },
          footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Riesgos`,
        };
      }
    }
    return {
      title: "Informe de Riesgos",
      content: {
        "Fecha del informe": new Date().toLocaleDateString(),
        "Total de riesgos": filteredRisks.length.toString(),
        Filtros:
          `${
            risk.categoryFilter !== "Todos" ? "Cat: " + risk.categoryFilter : ""
          } ${
            risk.impactFilter !== "Ninguno" ? "Imp:" + risk.impactFilter : ""
          }`.trim() || "Ninguno",
        Búsqueda: risk.searchTerm || "Ninguna",
      },
      items: filteredRisks.map((item) => ({
        ID: item.idRiesgo,
        Título: item.titulo,
        Categria: item.categoria?.nombre || "—",
        Impacto: item.impacto,
        Probabilidad: item.probabilidad,
        Estado: item.estado,
      })),
      footer: `Generado el ${new Date().toLocaleDateString()} - Sistema de Gestión de Riesgos`,
    };
  };

  const handleGenerateSingleRiskPdf = (id: number) => {
    setSelectedRiskForPdf(id);
    setShowPdfPreview(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Riesgos</CardTitle>
              <CardDescription>
                Identificación y mitigación de riesgos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Crear Categoria*/}
              <Dialog
                open={category.openNew}
                onOpenChange={category.setOpenNew}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Crear Categoría</DialogTitle>
                    <DialogDescription>Complete info</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {category.error && (
                      <Alert variant="destructive">
                        <AlertCircle />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{category.error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={category.form.nombre}
                        onChange={(e) =>
                          category.updateForm("nombre", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        rows={4}
                        value={category.form.descripcion}
                        onChange={(e) =>
                          category.updateForm("descripcion", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={category.createCategory}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Crear Riesgo*/}
              <Dialog open={risk.openNew} onOpenChange={risk.setOpenNew}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nuevo Riesgo</DialogTitle>
                    <DialogDescription>Complete campos</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {risk.error && (
                      <Alert variant="destructive">
                        <AlertCircle />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{risk.error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={risk.form.titulo}
                        onChange={(e) =>
                          risk.updateForm("titulo", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select
                          value={risk.form.categoriaSeleccionada}
                          onValueChange={(v) =>
                            risk.updateForm("categoriaSeleccionada", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {category.loading ? (
                              <SelectItem value="cargando">
                                Cargando...
                              </SelectItem>
                            ) : (
                              category.categorias.map((cat) => (
                                <SelectItem
                                  key={cat.idCategoria}
                                  value={cat.nombre}
                                >
                                  {cat.nombre}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Impacto</Label>
                        <Select
                          value={risk.form.impacto}
                          onValueChange={(v) => risk.updateForm("impacto", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Impacto" />
                          </SelectTrigger>
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
                        <Label>Probabilidad</Label>
                        <Select
                          value={risk.form.probabilidad}
                          onValueChange={(v) =>
                            risk.updateForm("probabilidad", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Probabilidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Baja">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select
                          value={risk.form.estado}
                          onValueChange={(v) => risk.updateForm("estado", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Identificado">
                              Identificado
                            </SelectItem>
                            <SelectItem value="Planificado">
                              Planificado
                            </SelectItem>
                            <SelectItem value="Mitigado">Mitigado</SelectItem>
                            <SelectItem value="En monitoreo">
                              En monitoreo
                            </SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                            <SelectItem value="Reactivado">
                              Reactivado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mitigador (ID)</Label>
                        <Input
                          placeholder="ID usuario"
                          value={risk.form.responsableId}
                          onChange={(e) =>
                            risk.updateForm("responsableId", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Registrado por (ID)</Label>
                        <Input
                          placeholder="ID usuario"
                          value={risk.form.idUsuarioRegistro}
                          onChange={(e) =>
                            risk.updateForm("idUsuarioRegistro", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => risk.createRisk(category.categorias)}
                    >
                      Guardar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* filtros y búsqueda */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar..."
                value={risk.searchTerm}
                onChange={(e) => risk.setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={risk.categoryFilter}
                onValueChange={risk.setCategoryFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {risk.getUniqueCategories().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={risk.impactFilter}
                onValueChange={risk.setImpactFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Impacto" />
                </SelectTrigger>
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
                <TableHead>Categoria</TableHead>
                <TableHead>Impacto</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risk.loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredRisks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No resultados
                  </TableCell>
                </TableRow>
              ) : (
                filteredRisks.map((item) => (
                  <TableRow key={item.idRiesgo}>
                    <TableCell>{item.titulo}</TableCell>
                    <TableCell>{item.categoria?.nombre || "—"}</TableCell>
                    <TableCell>
                      <Badge className={risk.getImpactColor(item.impacto)}>
                        {item.impacto}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.probabilidad}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.estado === "Activo" ? "default" : "outline"
                        }
                      >
                        {item.estado}
                      </Badge>
                    </TableCell>
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
                              <DialogTitle>{item.titulo}</DialogTitle>
                              <DialogDescription>
                                {item.registradoPor?.nombreCompleto
                                  ? `Registrado por ${
                                      item.registradoPor.nombreCompleto
                                    } el ${new Date(
                                      item.fechaRegistro
                                    ).toLocaleDateString()}`
                                  : `Registrado el ${new Date(
                                      item.fechaRegistro
                                    ).toLocaleDateString()}`}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                              <p>
                                <strong>Responsable:</strong>{" "}
                                {item.responsable?.nombreCompleto || "—"}
                              </p>
                              <p>
                                <strong>Planes de Mitigación:</strong>{" "}
                                {item.planesMitigar?.length
                                  ? item.planesMitigar
                                      .map((p) => p.nombre)
                                      .join(", ")
                                  : "—"}
                              </p>
                              <p>
                                <strong>Planes de Evitación:</strong>{" "}
                                {item.planesEvitar?.length
                                  ? item.planesEvitar
                                      .map((p) => p.nombre)
                                      .join(", ")
                                  : "—"}
                              </p>
                            </div>
                            <DialogFooter>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleGenerateSingleRiskPdf(item.idRiesgo)
                                  }
                                >
                                  <FileDown className="mr-1 h-4 w-4" />
                                  Ver PDF
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRiskClick(item)}
                                >
                                  Editar
                                </Button>
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
            Mostrando {filteredRisks.length} de {risk.riskData.length}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedRiskForPdf(null);
              setShowPdfPreview(true);
            }}
          >
            <FileDown className="mr-1 h-4 w-4" />
            Exportar PDF
          </Button>
        </CardFooter>
      </Card>

      {/* Gestión de Categorías */}
      <Card>
        <CardHeader
          className="cursor-pointer flex flex-row items-center justify-between"
          onClick={() => setShowCategories(!showCategories)}
        >
          <div>
            <CardTitle>Gestión de Categorías</CardTitle>
            <CardDescription>Administre las categorías</CardDescription>
          </div>
          <Plus
            className="h-5 w-5 transition-transform duration-200 ease-in-out"
            style={{
              transform: showCategories ? "rotate(45deg)" : "rotate(0deg)",
              color: "#41ADE7",
            }}
          />
        </CardHeader>
        {showCategories && (
          <CardContent>
            {category.loading ? (
              <p>Cargando...</p>
            ) : category.categorias.length === 0 ? (
              <p>No hay categorías</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Desc</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.categorias.map((cat) => (
                    <TableRow key={cat.idCategoria}>
                      <TableCell>{cat.idCategoria}</TableCell>
                      <TableCell>{cat.nombre}</TableCell>
                      <TableCell>{cat.descripcion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategoryClick(cat)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              category.deleteCategory(cat.idCategoria)
                            }
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
        <Dialog open={editCategoryOpen} onOpenChange={setEditCategoryOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>Modifique datos</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {category.error && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{category.error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={editCategoryForm.nombre || ""}
                  onChange={(e) =>
                    setEditCategoryForm({
                      ...editCategoryForm,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  rows={4}
                  value={editCategoryForm.descripcion || ""}
                  onChange={(e) =>
                    setEditCategoryForm({
                      ...editCategoryForm,
                      descripcion: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCategory}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Editar Riesgo Dialog */}
      <Dialog open={editRiskOpen} onOpenChange={setEditRiskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Riesgo</DialogTitle>
            <DialogDescription>
              Modifique los campos del riesgo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {risk.error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{risk.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editRiskForm.titulo || ""}
                onChange={(e) =>
                  setEditRiskForm({ ...editRiskForm, titulo: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={editRiskForm.categoriaSeleccionada || ""}
                  onValueChange={(v) =>
                    setEditRiskForm({
                      ...editRiskForm,
                      categoriaSeleccionada: v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.loading ? (
                      <SelectItem value="cargando">Cargando...</SelectItem>
                    ) : (
                      category.categorias.map((cat) => (
                        <SelectItem key={cat.idCategoria} value={cat.nombre}>
                          {cat.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impacto</Label>
                <Select
                  value={editRiskForm.impacto || ""}
                  onValueChange={(v) =>
                    setEditRiskForm({ ...editRiskForm, impacto: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Impacto" />
                  </SelectTrigger>
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
                <Label>Probabilidad</Label>
                <Select
                  value={editRiskForm.probabilidad || ""}
                  onValueChange={(v) =>
                    setEditRiskForm({ ...editRiskForm, probabilidad: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Probabilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={editRiskForm.estado || ""}
                  onValueChange={(v) =>
                    setEditRiskForm({ ...editRiskForm, estado: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
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
                <Label>Mitigador (ID)</Label>
                <Input
                  placeholder="ID usuario"
                  value={editRiskForm.responsableId || ""}
                  onChange={(e) =>
                    setEditRiskForm({
                      ...editRiskForm,
                      responsableId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Registrado por (ID)</Label>
                <Input
                  placeholder="ID usuario"
                  value={editRiskForm.idUsuarioRegistro || ""}
                  onChange={(e) =>
                    setEditRiskForm({
                      ...editRiskForm,
                      idUsuarioRegistro: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateRisk}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview} modal>
        <DialogContent className="sm:max-w-[80%] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedRiskForPdf
                ? "Vista Previa Riesgo"
                : "Vista Previa Informe"}
            </DialogTitle>
            <DialogDescription>
              {selectedRiskForPdf ? "Informe específico" : "Listado completo"}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[60vh]">
            <PdfGenerator
              data={generatePdfData()}
              fileName={
                selectedRiskForPdf
                  ? `riesgo-${selectedRiskForPdf}.pdf`
                  : "informe-riesgos.pdf"
              }
              preview
            />
          </div>
          <DialogFooter>
            <PdfGenerator
              data={generatePdfData()}
              fileName={
                selectedRiskForPdf
                  ? `riesgo-${selectedRiskForPdf}.pdf`
                  : "informe-riesgos.pdf"
              }
              preview={false}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
