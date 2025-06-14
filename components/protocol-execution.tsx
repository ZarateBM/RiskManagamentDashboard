"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, Clock, Save, ArrowLeft } from "lucide-react"
import { supabase, type EjecucionProtocolo, type Protocolo } from "@/lib/supabase"

interface ProtocolExecutionProps {
  ejecucionId: number
  onBack: () => void
}

export default function ProtocolExecution({ ejecucionId, onBack }: ProtocolExecutionProps) {
  const [ejecucion, setEjecucion] = useState<EjecucionProtocolo | null>(null)
  const [protocolo, setProtocolo] = useState<Protocolo | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    cargarEjecucion()
  }, [ejecucionId])

  const cargarEjecucion = async () => {
    try {
      // Cargar ejecución con protocolo e incidente
      const { data: ejecucionData, error: ejecucionError } = await supabase
        .from("ejecuciones_protocolo")
        .select(`
          *,
          protocolo:protocolos(*),
          incidente:incidentes(*),
          usuario:usuarios(*)
        `)
        .eq("id_ejecucion", ejecucionId)
        .single()

      if (ejecucionError) throw ejecucionError

      setEjecucion(ejecucionData)
      setProtocolo(ejecucionData.protocolo)
      setCompletedTasks(ejecucionData.pasos_completados || [])
      setNotes(ejecucionData.notas || "")
    } catch (error) {
      console.error("Error cargando ejecución:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCheck = async (task: string, checked: boolean) => {
    let newCompletedTasks: string[]

    if (checked) {
      newCompletedTasks = [...completedTasks, task]
    } else {
      newCompletedTasks = completedTasks.filter((t) => t !== task)
    }

    setCompletedTasks(newCompletedTasks)

    // Calcular progreso
    const totalTasks = protocolo?.pasos.reduce((total, step) => total + step.tareas.length, 0) || 0
    const progress = totalTasks > 0 ? Math.round((newCompletedTasks.length / totalTasks) * 100) : 0

    // Actualizar en la base de datos
    try {
      await supabase
        .from("ejecuciones_protocolo")
        .update({
          pasos_completados: newCompletedTasks,
          progreso: progress,
          estado: progress === 100 ? "Completado" : "En progreso",
          fecha_fin: progress === 100 ? new Date().toISOString() : null,
        })
        .eq("id_ejecucion", ejecucionId)

      // Si se completó, actualizar el incidente
      if (progress === 100 && ejecucion?.incidente_id) {
        await supabase
          .from("incidentes")
          .update({
            estado: "Resuelto",
            fecha_resolucion: new Date().toISOString(),
            resuelto_por: ejecucion.usuario_id,
          })
          .eq("id_incidente", ejecucion.incidente_id)
      }
    } catch (error) {
      console.error("Error actualizando progreso:", error)
    }
  }

  const handleSaveNotes = async () => {
    try {
      await supabase.from("ejecuciones_protocolo").update({ notas: notes }).eq("id_ejecucion", ejecucionId)
    } catch (error) {
      console.error("Error guardando notas:", error)
    }
  }

  const calculateProgress = () => {
    if (!protocolo) return 0
    const totalTasks = protocolo.pasos.reduce((total, step) => total + step.tareas.length, 0)
    return totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-primary-blue" />
          <p className="mt-2 text-primary-blue">Cargando protocolo...</p>
        </div>
      </div>
    )
  }

  if (!ejecucion || !protocolo) {
    return (
      <div className="text-center py-8">
        <p className="text-primary-blue">No se pudo cargar la ejecución del protocolo</p>
        <Button className="border border-primary-blue text-white bg-primary-blue mt-4" onClick={onBack} >
          Volver
        </Button>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Incidentes
        </Button>
        <Badge variant={progress === 100 ? "default" : "secondary"}>
          {progress === 100 ? "Completado" : "En progreso"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejecutando Protocolo: {protocolo.titulo}</CardTitle>
          <CardDescription>{protocolo.descripcion}</CardDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso: {progress}%</span>
              <span className="text-sm text-primary-blue">
                {completedTasks.length} de {protocolo.pasos.reduce((total, step) => total + step.tareas.length, 0)}{" "}
                tareas
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium">Información del Incidente</h3>
            <div className="rounded-md border border-primary-blue p-3">
              <p className="font-medium">{ejecucion.incidente?.titulo}</p>
              <p className="text-sm text-primary-blue">{ejecucion.incidente?.descripcion}</p>
            </div>
          </div>

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
            <h3 className="mb-2 font-medium">Pasos del Protocolo</h3>
            <Accordion type="single" collapsible className="w-full">
              {protocolo.pasos.map((step, stepIndex) => {
                const stepCompletedTasks = step.tareas.filter((task) => completedTasks.includes(task))
                const stepProgress =
                  step.tareas.length > 0 ? Math.round((stepCompletedTasks.length / step.tareas.length) * 100) : 0

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
                            <div className="h-full bg-primary" style={{ width: `${stepProgress}%` }}></div>
                          </div>
                          <span className="text-xs text-primary-blue">{stepProgress}%</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-8">
                        <p className="text-sm text-primary-blue">{step.descripcion}</p>
                        <div className="space-y-2">
                          {step.tareas.map((task, taskIndex) => {
                            const isChecked = completedTasks.includes(task)

                            return (
                              <div key={taskIndex} className="flex items-start space-x-2">
                                <Checkbox
                                  id={`task-${stepIndex}-${taskIndex}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    handleTaskCheck(task, checked as boolean)
                                  }}
                                />
                                <Label
                                  htmlFor={`task-${stepIndex}-${taskIndex}`}
                                  className={`text-sm ${isChecked ? "text-primary-blue line-through" : ""}`}
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
              placeholder="Agregue notas sobre la ejecución de este protocolo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
           
          </div>

          {progress === 100 && (
            <div className="rounded-md border border-primary-blue border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">Protocolo Completado</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                El protocolo se ha ejecutado completamente y el incidente ha sido resuelto.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
