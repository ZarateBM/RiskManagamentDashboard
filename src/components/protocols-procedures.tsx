"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Server,
  Wifi,
  Zap,
} from "lucide-react"

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

// Datos de ejemplo para procedimientos
const proceduresData = [
  {
    id: 1,
    title: "PC dañada o con fallas",
    category: "hardware",
    description: "Procedimiento para diagnosticar y resolver problemas en equipos de cómputo",
    severity: "Media",
    estimatedTime: "30-60 min",
    requiredTools: ["Destornilladores", "Software de diagnóstico", "Multímetro"],
    steps: [
      {
        title: "Verificación inicial",
        description: "Comprobar si el equipo enciende y muestra signos de actividad",
        tasks: [
          "Verificar que el equipo esté conectado a la corriente eléctrica",
          "Comprobar que el botón de encendido funcione correctamente",
          "Verificar si hay luces indicadoras encendidas (disco duro, red, etc.)",
          "Escuchar si hay sonidos anormales (ventiladores, disco duro)",
        ],
      },
      {
        title: "Diagnóstico básico",
        description: "Identificar el tipo de falla que presenta el equipo",
        tasks: [
          "Si enciende pero no muestra imagen, verificar conexión del monitor",
          "Si no enciende, verificar fuente de poder y conexiones internas",
          "Si se reinicia constantemente, verificar temperatura y memoria RAM",
          "Si funciona lento, verificar uso de CPU y disco duro",
        ],
      },
      {
        title: "Solución de problemas de hardware",
        description: "Acciones para resolver problemas físicos del equipo",
        tasks: [
          "Abrir el gabinete y verificar que todos los componentes estén bien conectados",
          "Limpiar el polvo acumulado en ventiladores y disipadores",
          "Verificar que la memoria RAM esté correctamente instalada",
          "Comprobar conexiones de discos duros y unidades ópticas",
        ],
      },
      {
        title: "Solución de problemas de software",
        description: "Acciones para resolver problemas del sistema operativo",
        tasks: [
          "Iniciar el equipo en modo seguro para verificar si el problema persiste",
          "Ejecutar herramientas de diagnóstico del sistema operativo",
          "Verificar actualizaciones pendientes del sistema",
          "Comprobar si hay malware o virus con un antivirus actualizado",
        ],
      },
      {
        title: "Documentación y seguimiento",
        description: "Registro de las acciones realizadas",
        tasks: [
          "Documentar el problema detectado y la solución aplicada",
          "Registrar los componentes que fueron reemplazados (si aplica)",
          "Actualizar el inventario de hardware si hubo cambios",
          "Programar seguimiento para verificar que el problema no se repita",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Equipo afectado por agua o humedad",
    category: "environmental",
    description: "Procedimiento para recuperar equipos que han sido expuestos a líquidos o humedad excesiva",
    severity: "Alta",
    estimatedTime: "24-48 horas",
    requiredTools: ["Destornilladores", "Alcohol isopropílico", "Paños de microfibra", "Secador de aire frío"],
    steps: [
      {
        title: "Acciones inmediatas",
        description: "Pasos críticos para minimizar el daño inicial",
        tasks: [
          "Apagar inmediatamente el equipo si está encendido",
          "Desconectar de la corriente eléctrica y retirar la batería (si es posible)",
          "Desconectar todos los periféricos y cables externos",
          "Colocar el equipo en posición que permita el drenaje del líquido",
        ],
      },
      {
        title: "Evaluación del daño",
        description: "Determinar el alcance de la exposición al líquido",
        tasks: [
          "Identificar qué tipo de líquido afectó al equipo (agua, café, refresco)",
          "Determinar qué componentes fueron expuestos al líquido",
          "Evaluar si el líquido llegó a componentes críticos (placa madre, disco duro)",
          "Documentar con fotografías el estado del equipo para reportes",
        ],
      },
      {
        title: "Secado inicial",
        description: "Proceso para eliminar la humedad visible",
        tasks: [
          "Abrir el equipo tanto como sea posible (quitar tapas, paneles)",
          "Absorber el líquido visible con paños de microfibra o toallas absorbentes",
          "Inclinar el equipo en diferentes ángulos para drenar líquido atrapado",
          "NO usar secador de pelo o calor directo que pueda dañar componentes",
        ],
      },
      {
        title: "Limpieza y secado profundo",
        description: "Proceso detallado para eliminar residuos y humedad",
        tasks: [
          "Desmontar los componentes principales si se tiene el conocimiento técnico",
          "Limpiar las placas electrónicas con alcohol isopropílico al 90% o superior",
          "Usar un secador de aire frío o dejar secar naturalmente por 24-48 horas",
          "Colocar el equipo en un ambiente con deshumidificador si es posible",
        ],
      },
      {
        title: "Prueba y recuperación",
        description: "Verificación del funcionamiento después del secado",
        tasks: [
          "Después de al menos 48 horas de secado, reconectar la batería",
          "Intentar encender el equipo sin conectarlo a la corriente",
          "Si enciende, realizar pruebas básicas de funcionamiento",
          "Realizar respaldo de datos inmediatamente si el equipo funciona",
        ],
      },
      {
        title: "Seguimiento y documentación",
        description: "Acciones posteriores a la recuperación",
        tasks: [
          "Monitorear el equipo durante varios días para detectar fallos intermitentes",
          "Documentar todo el proceso y resultado final",
          "Evaluar si se requiere reemplazo de componentes específicos",
          "Actualizar el registro de incidentes con toda la información",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Problemas de conectividad de red",
    category: "connectivity",
    description: "Procedimiento para diagnosticar y resolver problemas de conexión a la red",
    severity: "Alta",
    estimatedTime: "30-90 min",
    requiredTools: ["Cable de red de prueba", "Tester de cables", "Laptop con software de diagnóstico"],
    steps: [
      {
        title: "Verificación inicial",
        description: "Comprobar el estado básico de la conexión",
        tasks: [
          "Verificar si los indicadores LED de conexión están activos en el equipo",
          "Comprobar si otros dispositivos en la misma red tienen conexión",
          "Verificar si el problema afecta a todas las aplicaciones o solo algunas",
          "Comprobar si hay alertas en el sistema de monitoreo de red",
        ],
      },
      {
        title: "Diagnóstico de conexión física",
        description: "Verificar componentes físicos de la red",
        tasks: [
          "Comprobar que los cables de red estén correctamente conectados",
          "Verificar que los puertos de red no estén dañados",
          "Probar con un cable de red diferente para descartar fallos",
          "Verificar el estado de los switches y routers relacionados",
        ],
      },
      {
        title: "Diagnóstico de configuración",
        description: "Verificar parámetros de red del equipo",
        tasks: [
          "Verificar la configuración IP (estática o DHCP)",
          "Ejecutar comandos de diagnóstico (ping, tracert, ipconfig)",
          "Comprobar la configuración del firewall",
          "Verificar la configuración DNS y puerta de enlace",
        ],
      },
      {
        title: "Solución de problemas comunes",
        description: "Acciones para resolver problemas frecuentes",
        tasks: [
          "Reiniciar adaptadores de red del equipo",
          "Reiniciar equipos de red (switches, routers) si es necesario",
          "Liberar y renovar dirección IP (ipconfig /release, ipconfig /renew)",
          "Limpiar caché DNS (ipconfig /flushdns)",
        ],
      },
      {
        title: "Escalamiento y documentación",
        description: "Pasos finales si el problema persiste",
        tasks: [
          "Documentar todas las pruebas realizadas y resultados",
          "Escalar el problema al equipo de redes si no se resuelve",
          "Registrar el incidente en el sistema de seguimiento",
          "Informar a los usuarios afectados sobre el estado del problema",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Fallo en servidor",
    category: "hardware",
    description: "Procedimiento para diagnosticar y resolver problemas en servidores",
    severity: "Crítica",
    estimatedTime: "1-4 horas",
    requiredTools: [
      "Consola de administración remota",
      "Herramientas de diagnóstico del fabricante",
      "Repuestos críticos",
    ],
    steps: [
      {
        title: "Evaluación inicial",
        description: "Determinar el alcance y naturaleza del fallo",
        tasks: [
          "Verificar alertas en el sistema de monitoreo",
          "Comprobar acceso a la consola de administración remota",
          "Identificar servicios afectados y su impacto",
          "Notificar a los usuarios y equipos relevantes sobre el incidente",
        ],
      },
      {
        title: "Diagnóstico remoto",
        description: "Análisis sin intervención física",
        tasks: [
          "Revisar logs del sistema para identificar errores",
          "Verificar estado de hardware mediante consola de administración",
          "Comprobar uso de recursos (CPU, memoria, disco)",
          "Verificar conectividad de red y acceso a almacenamiento",
        ],
      },
      {
        title: "Intervención física (si es necesario)",
        description: "Acciones que requieren acceso físico al servidor",
        tasks: [
          "Verificar indicadores LED de estado en el panel frontal",
          "Comprobar que todos los componentes estén correctamente instalados",
          "Verificar funcionamiento de ventiladores y sistema de refrigeración",
          "Comprobar conexiones de alimentación y red",
        ],
      },
      {
        title: "Recuperación de servicios",
        description: "Restaurar la operación normal",
        tasks: [
          "Reiniciar servicios afectados en orden correcto",
          "Verificar integridad de datos y aplicaciones",
          "Comprobar que todos los servicios dependientes funcionen correctamente",
          "Realizar pruebas de funcionamiento con usuarios seleccionados",
        ],
      },
      {
        title: "Documentación y prevención",
        description: "Registro y acciones para evitar recurrencia",
        tasks: [
          "Documentar detalladamente la causa raíz del problema",
          "Registrar todas las acciones realizadas para la solución",
          "Actualizar procedimientos si se identificaron mejoras",
          "Programar acciones preventivas para evitar que el problema se repita",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Corte de energía",
    category: "power",
    description: "Procedimiento para manejar interrupciones en el suministro eléctrico",
    severity: "Crítica",
    estimatedTime: "Variable",
    requiredTools: ["Linterna", "Multímetro", "Herramientas básicas"],
    steps: [
      {
        title: "Respuesta inmediata",
        description: "Acciones iniciales ante un corte de energía",
        tasks: [
          "Verificar si el sistema UPS está funcionando correctamente",
          "Comprobar que los equipos críticos sigan operativos",
          "Verificar el tiempo estimado de respaldo del UPS",
          "Notificar al personal relevante sobre la situación",
        ],
      },
      {
        title: "Evaluación de la situación",
        description: "Determinar alcance y duración probable",
        tasks: [
          "Determinar si el corte es general o solo afecta al edificio",
          "Contactar a la compañía eléctrica para obtener información",
          "Estimar la duración probable del corte",
          "Evaluar el impacto en las operaciones",
        ],
      },
      {
        title: "Acciones durante el corte",
        description: "Gestión mientras dura la interrupción",
        tasks: [
          "Monitorear constantemente el nivel de batería del UPS",
          "Apagar ordenadamente equipos no críticos para extender tiempo de respaldo",
          "Mantener comunicación con el personal y usuarios",
          "Preparar el generador de respaldo si el corte se extiende",
        ],
      },
      {
        title: "Restauración del servicio",
        description: "Acciones cuando regresa la energía",
        tasks: [
          "Verificar que el voltaje se haya estabilizado antes de reconectar equipos",
          "Encender equipos en orden: infraestructura de red, servidores, equipos de usuario",
          "Comprobar que todos los sistemas funcionen correctamente",
          "Verificar que el UPS esté recargando sus baterías",
        ],
      },
      {
        title: "Documentación y mejora",
        description: "Registro y análisis posterior",
        tasks: [
          "Documentar la duración del corte y su impacto",
          "Evaluar la efectividad de los sistemas de respaldo",
          "Identificar oportunidades de mejora en el procedimiento",
          "Actualizar el plan de contingencia si es necesario",
        ],
      },
    ],
  },
]

export default function ProtocolsProcedures() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeProcedure, setActiveProcedure] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: string[] }>({})
  const [notes, setNotes] = useState<{ [key: string]: string }>({})

  // Filtrar los procedimientos según los criterios
  const filteredProcedures = proceduresData.filter((procedure) => {
    const matchesSearch = procedure.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || procedure.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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
    const procedure = proceduresData.find((p) => p.id === procedureId)
    if (!procedure) return 0

    let totalTasks = 0
    let completedTasksCount = 0

    procedure.steps.forEach((step) => {
      totalTasks += step.tasks.length

      const key = `${procedureId}-${step.title}`
      const completedTasksForStep = completedSteps[key] || []
      completedTasksCount += completedTasksForStep.length
    })

    return totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight primary-title">Protocolos y Procedimientos</h2>
          <p className="text-muted-foreground">Guías paso a paso para resolver incidentes comunes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Procedimiento
          </Button>
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
              {filteredProcedures.map((procedure) => (
                <div
                  key={procedure.id}
                  className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${activeProcedure === procedure.id ? "border-primary bg-accent" : ""}`}
                  onClick={() => setActiveProcedure(procedure.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(procedure.category)}
                      <span className="font-medium">{procedure.title}</span>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(procedure.severity)}>
                      {procedure.severity}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Tiempo est.: {procedure.estimatedTime}</span>
                    <span>Progreso: {calculateProgress(procedure.id)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${calculateProgress(procedure.id)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          {activeProcedure ? (
            <>
              {proceduresData
                .filter((p) => p.id === activeProcedure)
                .map((procedure) => (
                  <div key={procedure.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(procedure.category)}
                          <CardTitle>{procedure.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(procedure.severity)}>
                          {procedure.severity}
                        </Badge>
                      </div>
                      <CardDescription>{procedure.description}</CardDescription>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Tiempo estimado: {procedure.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clipboard className="h-4 w-4 text-muted-foreground" />
                          <span>Progreso: {calculateProgress(procedure.id)}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium">Herramientas Necesarias</h3>
                        <div className="flex flex-wrap gap-2">
                          {procedure.requiredTools.map((tool, index) => (
                            <Badge key={index} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium">Pasos del Procedimiento</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {procedure.steps.map((step, stepIndex) => {
                            const stepKey = `${procedure.id}-${step.title}`
                            const completedTasksForStep = completedSteps[stepKey] || []
                            const progress =
                              step.tasks.length > 0
                                ? Math.round((completedTasksForStep.length / step.tasks.length) * 100)
                                : 0

                            return (
                              <AccordionItem key={stepIndex} value={`step-${stepIndex}`}>
                                <AccordionTrigger>
                                  <div className="flex w-full items-center justify-between pr-4">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                                        {stepIndex + 1}
                                      </span>
                                      <span>{step.title}</span>
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
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    <div className="space-y-2">
                                      {step.tasks.map((task, taskIndex) => {
                                        const isChecked = completedTasksForStep.includes(task)

                                        return (
                                          <div key={taskIndex} className="flex items-start space-x-2">
                                            <Checkbox
                                              id={`task-${procedure.id}-${stepIndex}-${taskIndex}`}
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                handleTaskCheck(procedure.id, step.title, task, checked as boolean)
                                              }}
                                            />
                                            <Label
                                              htmlFor={`task-${procedure.id}-${stepIndex}-${taskIndex}`}
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

                      <div className="space-y-2">
                        <h3 className="font-medium">Notas y Observaciones</h3>
                        <Textarea
                          placeholder="Agregue notas sobre la ejecución de este procedimiento..."
                          value={notes[`${procedure.id}`] || ""}
                          onChange={(e) => handleSaveNotes(procedure.id, e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveNotes(procedure.id, notes[`${procedure.id}`] || "")}
                          className="mt-2"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Notas
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`h-5 w-5 ${calculateProgress(procedure.id) === 100 ? "text-green-500" : "text-muted-foreground"}`}
                        />
                        <span className="text-sm">
                          {calculateProgress(procedure.id) === 100
                            ? "Procedimiento completado"
                            : `${calculateProgress(procedure.id)}% completado`}
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
          <CardTitle>Procedimientos Recientes</CardTitle>
          <CardDescription>Últimos procedimientos ejecutados o en progreso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Equipo afectado por agua o humedad</p>
                  <p className="text-sm text-muted-foreground">Aplicado a: Laptop de Sala de Reuniones</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Iniciado: 19/03/2025</p>
                  <p className="text-xs text-muted-foreground">Por: Técnico de Soporte</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Completado
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Fallo en servidor</p>
                  <p className="text-sm text-muted-foreground">Aplicado a: Servidor de Base de Datos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Iniciado: 17/03/2025</p>
                  <p className="text-xs text-muted-foreground">Por: Administrador de Sistemas</p>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  En progreso (75%)
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Problemas de conectividad de red</p>
                  <p className="text-sm text-muted-foreground">Aplicado a: Switch de Distribución</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Iniciado: 15/03/2025</p>
                  <p className="text-xs text-muted-foreground">Por: Técnico de Redes</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Completado
                </Badge>
              </div>
            </div>
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

