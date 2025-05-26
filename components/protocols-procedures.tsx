"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Clock,
  Droplets,
  HardDrive,
  Info,
  Plus,
  Printer,
  Save,
  Search,
  Wifi,
  Zap,
} from "lucide-react"

import { supabase, type Protocolo, type Usuario, type EjecucionProtocolo } from "@/lib/supabase"

// Tipos de procedimientos
const procedureCategories = [
  {
    id: "hardware",
    name: "Hardware",
    icon: <HardDrive className="h-5 w-5 text-orange-500" />,
  },
  {
    id: "environmental",
    name: "Ambiental",
    icon: <Droplets className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "connectivity",
    name: "Conectividad",
    icon: <Wifi className="h-5 w-5 text-green-500" />,
  },
  {
    id: "power",
    name: "Energía",
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: "emergency",
    name: "Emergencia",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
]

export default function ProtocolsProcedures() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [ejecucionesRecientes, setEjecucionesRecientes] = useState<EjecucionProtocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeProcedure, setActiveProcedure] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: string[] }>({})
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Estados para crear protocolo
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [severidad, setSeveridad] = useState("")
  const [tiempoEstimado, setTiempoEstimado] = useState("")
  const [herramientas, setHerramientas] = useState("")
  const [pasos, setPasos] = useState([{ titulo: "", descripcion: "", tareas: [""] }])

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
      // Cargar protocolos
      const { data: protocolosData, error: protocolosError } = await supabase
        .from("protocolos")
        .select("*")
        .eq("activo", true)
        .order("titulo")

      if (protocolosError) throw protocolosError

      // Cargar ejecuciones recientes
      const { data: ejecucionesData, error: ejecucionesError } = await supabase
        .from("ejecuciones_protocolo")
        .select(`
          *,
          protocolo:protocolos(*),
          incidente:incidentes(*),
          usuario:usuarios(*)
        `)
        .order("fecha_inicio", { ascending: false })
        .limit(5)

      if (ejecucionesError) throw ejecucionesError

      setProtocolos(protocolosData || [])
      setEjecucionesRecientes(ejecucionesData || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  // Filtrar protocolos
  const filteredProcedures = protocolos.filter((protocolo) => {
    const matchesSearch = protocolo.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || protocolo.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      alert("Solo los administradores pueden crear protocolos")
      return
    }

    try {
      const herramientasArray = herramientas
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)

      const { data: protocoloData, error: protocoloError } = await supabase
        .from("protocolos")
        .insert([
          {
            titulo,
            descripcion,
            categoria,
            severidad,
            tiempo_estimado: tiempoEstimado,
            herramientas_necesarias: herramientasArray,
            pasos: pasos.filter((p) => p.titulo && p.tareas.some((t) => t.trim())),
            creado_por: currentUser?.id_usuario,
            activo: true,
          },
        ])
        .select()
        .single()

      if (protocoloError) throw protocoloError

      // Crear incidente automáticamente
      const { error: incidenteError } = await supabase.from("incidentes").insert([
        {
          titulo: `Protocolo creado: ${titulo}`,
          descripcion: `Se ha creado un nuevo protocolo: ${descripcion}`,
          categoria: categoria,
          severidad: severidad,
          estado: "Pendiente",
          asignado_a: currentUser?.nombre_completo || "Sistema",
          protocolo_id: protocoloData.id_protocolo,
          protocolo_ejecutado: false,
        },
      ])

      if (incidenteError) throw incidenteError

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
      alert("Protocolo creado exitosamente e incidente registrado")
    } catch (error) {
      console.error("Error creando protocolo:", error)
      alert("Error al crear protocolo")
    }
  }

  const resetForm = () => {
    setTitulo("")
    setDescripcion("")
    setCategoria("")
    setSeveridad("")
    setTiempoEstimado("")
    setHerramientas("")
    setPasos([{ titulo: "", descripcion: "", tareas: [""] }])
  }

  const addStep = () => {
    setPasos([...pasos, { titulo: "", descripcion: "", tareas: [""] }])
  }

  const updateStep = (index: number, field: string, value: string) => {
    const newPasos = [...pasos]
    newPasos[index] = { ...newPasos[index], [field]: value }
    setPasos(newPasos)
  }

  const addTask = (stepIndex: number) => {
    const newPasos = [...pasos]
    newPasos[stepIndex].tareas.push("")
    setPasos(newPasos)
  }

  const updateTask = (stepIndex: number, taskIndex: number, value: string) => {
    const newPasos = [...pasos]
    newPasos[stepIndex].tareas[taskIndex] = value
    setPasos(newPasos)
  }

  // Función para manejar el cambio en los checkboxes de tareas
  const handleTaskCheck = (procedureId: number, stepTitle: string, task: string, checked: boolean) => {
    const key = `${procedureId}-${stepTitle}`

    setCompletedSteps((prev) => {
      const currentTasks = prev[key] || []

      if (checked) {
        return { ...prev, [key]: [...currentTasks, task] }
      } else {
        return { ...prev, [key]: currentTasks.filter((t) => t !== task) }
      }
    })
  }

  // Función para guardar notas
  const handleSaveNotes = (procedureId: number, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [`${procedureId}`]: note,
    }))
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

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (categoryId: string) => {
    const category = procedureCategories.find((cat) => cat.id === categoryId)
    return category ? category.icon : <Info className="h-5 w-5" />
  }

  // Función para calcular el progreso de un procedimiento
  const calculateProgress = (procedureId: number) => {
    const procedure = protocolos.find((p) => p.id_protocolo === procedureId)
    if (!procedure) return 0

    let totalTasks = 0
    let completedTasksCount = 0

    procedure.pasos.forEach((step) => {
      totalTasks += step.tareas.length

      const key = `${procedureId}-${step.titulo}`
      const completedTasksForStep = completedSteps[key] || []
      completedTasksCount += completedTasksForStep.length
    })

    return totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Protocolos y Procedimientos</h2>
          <p className="text-muted-foreground">Guías paso a paso para resolver incidentes comunes</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Procedimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Protocolo</DialogTitle>
                  <DialogDescription>
                    Complete la información para crear un nuevo protocolo. Se registrará automáticamente un incidente.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProtocol}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="protocol-title">Título del Protocolo</Label>
                        <Input
                          id="protocol-title"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="protocol-category">Categoría</Label>
                        <Select value={categoria} onValueChange={setCategoria}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="environmental">Ambiental</SelectItem>
                            <SelectItem value="connectivity">Conectividad</SelectItem>
                            <SelectItem value="power">Energía</SelectItem>
                            <SelectItem value="emergency">Emergencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protocol-description">Descripción</Label>
                      <Textarea
                        id="protocol-description"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="protocol-severity">Severidad</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="protocol-time">Tiempo Estimado</Label>
                        <Input
                          id="protocol-time"
                          placeholder="ej: 30-60 min"
                          value={tiempoEstimado}
                          onChange={(e) => setTiempoEstimado(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="protocol-tools">Herramientas (separadas por coma)</Label>
                        <Input
                          id="protocol-tools"
                          placeholder="ej: Destornillador, Multímetro"
                          value={herramientas}
                          onChange={(e) => setHerramientas(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Pasos del Protocolo</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addStep}>
                          Agregar Paso
                        </Button>
                      </div>
                      {pasos.map((paso, stepIndex) => (
                        <Card key={stepIndex}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Título del Paso</Label>
                                  <Input
                                    value={paso.titulo}
                                    onChange={(e) => updateStep(stepIndex, "titulo", e.target.value)}
                                    placeholder="ej: Verificación inicial"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Descripción</Label>
                                  <Input
                                    value={paso.descripcion}
                                    onChange={(e) => updateStep(stepIndex, "descripcion", e.target.value)}
                                    placeholder="ej: Comprobar el estado básico"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Tareas</Label>
                                  <Button type="button" variant="outline" size="sm" onClick={() => addTask(stepIndex)}>
                                    Agregar Tarea
                                  </Button>
                                </div>
                                {paso.tareas.map((tarea, taskIndex) => (
                                  <Input
                                    key={taskIndex}
                                    value={tarea}
                                    onChange={(e) => updateTask(stepIndex, taskIndex, e.target.value)}
                                    placeholder="ej: Verificar conexiones eléctricas"
                                  />
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Protocolo</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Catálogo de Procedimientos</CardTitle>
            <CardDescription>Seleccione un procedimiento para ver los detalles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimientos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Todos
              </Button>
              {procedureCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1"
                >
                  {category.icon}
                  <span className="ml-1">{category.name}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredProcedures.map((protocolo) => (
                <div
                  key={protocolo.id_protocolo}
                  className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${activeProcedure === protocolo.id_protocolo ? "border-primary bg-accent" : ""}`}
                  onClick={() => setActiveProcedure(protocolo.id_protocolo)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(protocolo.categoria)}
                      <span className="font-medium">{protocolo.titulo}</span>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(protocolo.severidad)}>
                      {protocolo.severidad}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Tiempo est.: {protocolo.tiempo_estimado}</span>
                    <span>Progreso: {calculateProgress(protocolo.id_protocolo)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${calculateProgress(protocolo.id_protocolo)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          {activeProcedure ? (
            <>
              {protocolos
                .filter((p) => p.id_protocolo === activeProcedure)
                .map((protocolo) => (
                  <div key={protocolo.id_protocolo}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(protocolo.categoria)}
                          <CardTitle>{protocolo.titulo}</CardTitle>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(protocolo.severidad)}>
                          {protocolo.severidad}
                        </Badge>
                      </div>
                      <CardDescription>{protocolo.descripcion}</CardDescription>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Tiempo estimado: {protocolo.tiempo_estimado}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clipboard className="h-4 w-4 text-muted-foreground" />
                          <span>Progreso: {calculateProgress(protocolo.id_protocolo)}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium">Herramientas Necesarias</h3>
                        <div className="flex flex-wrap gap-2">
                          {protocolo.herramientas_necesarias.map((tool, index) => (
                            <Badge key={index} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium">Pasos del Procedimiento</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {protocolo.pasos.map((step, stepIndex) => {
                            const stepKey = `${protocolo.id_protocolo}-${step.titulo}`
                            const completedTasksForStep = completedSteps[stepKey] || []
                            const progress =
                              step.tareas.length > 0
                                ? Math.round((completedTasksForStep.length / step.tareas.length) * 100)
                                : 0

                            return (
                              <AccordionItem key={stepIndex} value={`step-${stepIndex}`}>
                                <AccordionTrigger>
                                  <div className="flex w-full items-center justify-between pr-4">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                                        {stepIndex + 1}
                                      </span>
                                      <span>{step.titulo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground">{progress}%</span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pl-8">
                                    <p className="text-sm text-muted-foreground">{step.descripcion}</p>
                                    <div className="space-y-2">
                                      {step.tareas.map((task, taskIndex) => {
                                        const isChecked = completedTasksForStep.includes(task)

                                        return (
                                          <div key={taskIndex} className="flex items-start space-x-2">
                                            <Checkbox
                                              id={`task-${protocolo.id_protocolo}-${stepIndex}-${taskIndex}`}
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                handleTaskCheck(
                                                  protocolo.id_protocolo,
                                                  step.titulo,
                                                  task,
                                                  checked as boolean,
                                                )
                                              }}
                                              disabled={!isAdmin} // Solo admin puede marcar tareas
                                            />
                                            <Label
                                              htmlFor={`task-${protocolo.id_protocolo}-${stepIndex}-${taskIndex}`}
                                              className={`text-sm ${isChecked ? "text-muted-foreground line-through" : ""}`}
                                            >
                                              {task}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      </div>

                      {isAdmin && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Notas y Observaciones</h3>
                          <Textarea
                            placeholder="Agregue notas sobre la ejecución de este procedimiento..."
                            value={notes[`${protocolo.id_protocolo}`] || ""}
                            onChange={(e) => handleSaveNotes(protocolo.id_protocolo, e.target.value)}
                            className="min-h-[100px]"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSaveNotes(protocolo.id_protocolo, notes[`${protocolo.id_protocolo}`] || "")
                            }
                            className="mt-2"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Notas
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-5 w-5 ${calculateProgress(protocolo.id_protocolo) === 100 ? "text-green-500" : "text-muted-foreground"}`}
                        />
                        <span className="text-sm">
                          {calculateProgress(protocolo.id_protocolo) === 100
                            ? "Procedimiento completado"
                            : `${calculateProgress(protocolo.id_protocolo)}% completado`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        <Button>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Generar Reporte
                        </Button>
                      </div>
                    </CardFooter>
                  </div>
                ))}
            </>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-medium">Seleccione un Procedimiento</h3>
              <p className="mt-2 text-center text-muted-foreground">
                Elija un procedimiento del catálogo para ver los pasos detallados y comenzar a ejecutarlo.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejecuciones Recientes</CardTitle>
          <CardDescription>Últimos protocolos ejecutados o en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ejecucionesRecientes.map((ejecucion) => (
              <div key={ejecucion.id_ejecucion} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(ejecucion.protocolo?.categoria || "")}
                  <div>
                    <p className="font-medium">{ejecucion.protocolo?.titulo}</p>
                    <p className="text-sm text-muted-foreground">Incidente: {ejecucion.incidente?.titulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Iniciado: {formatDate(ejecucion.fecha_inicio)}</p>
                    <p className="text-xs text-muted-foreground">Por: {ejecucion.usuario?.nombre_completo}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      ejecucion.estado === "Completado"
                        ? "bg-green-100 text-green-800"
                        : ejecucion.estado === "En progreso"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    {ejecucion.estado} ({ejecucion.progreso}%)
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Ver Historial Completo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
