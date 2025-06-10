"use client"

import type React from "react"
import toPDF from 'react-to-pdf';
import { useRef } from "react"

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
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Trash,
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

  // Agregar estos estados en la sección de estados
  const [showAllExecutions, setShowAllExecutions] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [protocoloParaEditar, setProtocoloParaEditar] = useState<Protocolo | null>(null)

  // Agregar la referencia junto con los otros estados
  const pdfRef = useRef(null);

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
  const filteredProcedures = protocolos
    .filter((protocolo) => {
      const matchesSearch = protocolo.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || protocolo.categoria === selectedCategory
      return matchesSearch && matchesCategory
    })
    // Limitar a 5 protocolos si no hay búsqueda activa
    .slice(0, searchTerm === "" ? 5 : undefined)

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      alert("Solo los administradores pueden crear protocolos")
      return
    }

    // Validación de campos obligatorios
    if (!titulo.trim()) {
      alert("El título del protocolo es obligatorio")
      return
    }

    if (!categoria) {
      alert("Debe seleccionar una categoría para el protocolo")
      return
    }

    if (!severidad) {
      alert("Debe seleccionar un nivel de severidad")
      return
    }

    if (!tiempoEstimado.trim()) {
      alert("El tiempo estimado es obligatorio")
      return
    }
    if (!herramientas.trim()) {
      alert("Debe ingresar al menos una herramienta necesaria")
      return
    }

    // Validar que haya al menos un paso con título y tareas
    const pasosValidos = pasos.filter(
      (paso) => paso.titulo.trim() && paso.tareas.some((tarea) => tarea.trim())
    )

    if (pasosValidos.length === 0) {
      alert("El protocolo debe contener al menos un paso con título y una tarea")
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
            pasos: pasosValidos, // Usar solo los pasos válidos
            creado_por: currentUser?.id_usuario,
            activo: true,
          },
        ])
        .select()
        .single()

      if (protocoloError) throw protocoloError

      // Eliminar la creación automática de incidente

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
      alert("Protocolo creado exitosamente")
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

  const handleCompleteProtocol = async (protocolo: Protocolo) => {
    if (!currentUser || !isAdmin) {
      alert("Solo los administradores pueden completar protocolos")
      return
    }

    // Verificar si el usuario quiere completar el protocolo
    if (!confirm(`¿Está seguro de marcar como completado el protocolo "${protocolo.titulo}"?`)) {
      return
    }

    try {
      // 1. Crear un incidente basado en el protocolo
      const nuevoIncidente = {
        titulo: `Protocolo ejecutado: ${protocolo.titulo}`,
        descripcion: `Se ha ejecutado el protocolo "${protocolo.titulo}". Notas: ${notes[`${protocolo.id_protocolo}`] || 'Sin notas adicionales'}`,
        categoria: protocolo.categoria,
        severidad: protocolo.severidad,
        estado: "Pendiente",
        asignado_a_id: currentUser.id_usuario, // Asignar al usuario que completa el protocolo
        protocolo_id: protocolo.id_protocolo,
        protocolo_ejecutado: true, // Marcar como ejecutado desde el inicio
      }

      const { data: incidenteCreado, error: incidenteError } = await supabase
        .from("incidentes")
        .insert([nuevoIncidente])
        .select()
        .single()

      if (incidenteError) throw incidenteError

      // 2. Crear registro de ejecución de protocolo
      const { error: ejecucionError } = await supabase
        .from("ejecuciones_protocolo")
        .insert([
          {
            protocolo_id: protocolo.id_protocolo,
            incidente_id: incidenteCreado.id_incidente,
            usuario_id: currentUser.id_usuario,
            estado: "Completado",
            progreso: 100,
            pasos_completados: protocolo.pasos.map(p => p.titulo),
            notas: notes[`${protocolo.id_protocolo}`] || '',
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date().toISOString()
          },
        ])

      if (ejecucionError) throw ejecucionError

      // 3. Intentar notificar al usuario asignado (si es diferente del actual)
      try {
        const emailResponse = await fetch('/api/email/send-incident-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incidentTitle: incidenteCreado.titulo,
            incidentDescription: incidenteCreado.descripcion,
            incidentCategory: protocolo.categoria,
            incidentSeverity: protocolo.severidad,
            assignedTo: currentUser.nombre_completo,
            assignedEmail: currentUser.correo,
            protocolName: protocolo.titulo,
            createdBy: currentUser.nombre_completo,
            isFromProtocol: true
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error al enviar notificación de incidente generado por protocolo');
        }
      } catch (emailError) {
        console.error('Error en la petición de envío de correo:', emailError);
        // No interrumpimos el flujo si falla el envío de correo
      }

      // 4. Resetear el estado local para el protocolo
      setCompletedSteps((prev) => {
        const newCompletedSteps = { ...prev };
        protocolo.pasos.forEach(paso => {
          delete newCompletedSteps[`${protocolo.id_protocolo}-${paso.titulo}`];
        });
        return newCompletedSteps;
      });
      
      setNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[`${protocolo.id_protocolo}`];
        return newNotes;
      });

      alert("Protocolo completado exitosamente y se ha generado un incidente para seguimiento");
      
      // 5. Recargar datos
      cargarDatos();
    } catch (error) {
      console.error("Error completando protocolo:", error);
      alert("Error al completar el protocolo")
    }
  }
  const prepararEdicionProtocolo = async (protocolo: Protocolo) => {
  const resultado = await verificarProtocoloVinculado(protocolo.id_protocolo)
  
  if (resultado.vinculado) {
    alert(`No se puede editar este protocolo porque está vinculado a un ${resultado.tipo}.`)
    return
  }
  
  // Cargar los datos del protocolo en el formulario
  setTitulo(protocolo.titulo)
  setDescripcion(protocolo.descripcion)
  setCategoria(protocolo.categoria)
  setSeveridad(protocolo.severidad)
  setTiempoEstimado(protocolo.tiempo_estimado)
  setHerramientas(protocolo.herramientas_necesarias.join(", "))
  setPasos([...protocolo.pasos]) // Clonar para evitar modificar el original
  
  setProtocoloParaEditar(protocolo)
  setEditModalOpen(true)
}

const handleUpdateProtocol = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!isAdmin || !protocoloParaEditar) {
    alert("Solo los administradores pueden actualizar protocolos")
    return
  }
  
  // Validación de campos obligatorios (igual que en creación)
  if (!titulo.trim()) {
    alert("El título del protocolo es obligatorio")
    return
  }

  if (!categoria) {
    alert("Debe seleccionar una categoría para el protocolo")
    return
  }

  if (!severidad) {
    alert("Debe seleccionar un nivel de severidad")
    return
  }

  if (!tiempoEstimado.trim()) {
    alert("El tiempo estimado es obligatorio")
    return
  }
  
  if (!herramientas.trim()) {
    alert("Debe ingresar al menos una herramienta necesaria")
    return
  }

  // Validar que haya al menos un paso con título y tareas
  const pasosValidos = pasos.filter(
    (paso) => paso.titulo.trim() && paso.tareas.some((tarea) => tarea.trim())
  )

  if (pasosValidos.length === 0) {
    alert("El protocolo debe contener al menos un paso con título y una tarea")
    return
  }
  
  try {
    // Verificar nuevamente por si ha cambiado el estado de vinculación
    const resultado = await verificarProtocoloVinculado(protocoloParaEditar.id_protocolo)
    
    if (resultado.vinculado) {
      alert(`No se puede actualizar este protocolo porque está vinculado a un ${resultado.tipo}.`)
      return
    }
    
    const herramientasArray = herramientas
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
    
    const { error: protocoloError } = await supabase
      .from("protocolos")
      .update({
        titulo,
        descripcion,
        categoria,
        severidad,
        tiempo_estimado: tiempoEstimado,
        herramientas_necesarias: herramientasArray,
        pasos: pasosValidos,
      })
      .eq("id_protocolo", protocoloParaEditar.id_protocolo)
    
    if (protocoloError) throw protocoloError
    
    setEditModalOpen(false)
    resetForm()
    cargarDatos()
    alert("Protocolo actualizado exitosamente")
  } catch (error) {
    console.error("Error actualizando protocolo:", error)
    alert("Error al actualizar protocolo")
  }
}

const handleDeleteProtocol = async (protocolo: Protocolo) => {
  if (!isAdmin) {
    alert("Solo los administradores pueden eliminar protocolos")
    return
  }

  if (!confirm(`¿Está seguro de eliminar el protocolo "${protocolo.titulo}"? Esta acción no se puede deshacer.`)) {
    return
  }

    try {
      const resultado = await verificarProtocoloVinculado(protocolo.id_protocolo)
      
      if (resultado.vinculado) {
        alert(`No se puede eliminar este protocolo porque está vinculado a un ${resultado.tipo}.`)
        return
      }
      
      // En lugar de eliminar físicamente, marcamos como inactivo
      const { error } = await supabase
        .from("protocolos")
        .update({ activo: false })
        .eq("id_protocolo", protocolo.id_protocolo)
      
      if (error) throw error
      
      cargarDatos()
      
      // Si estamos visualizando el protocolo que se eliminó, limpiamos la selección
      if (activeProcedure === protocolo.id_protocolo) {
        setActiveProcedure(null)
      }
      
      alert("Protocolo eliminado exitosamente")
    } catch (error) {
      console.error("Error eliminando protocolo:", error)
      alert("Error al eliminar protocolo")
    }
  }

  const handleCancelProtocol = async (protocolo: Protocolo) => {
    if (!currentUser || !isAdmin) {
      alert("Solo los administradores pueden cancelar protocolos")
      return
    }

    // Solicitar razón de la cancelación
    const cancelReason = prompt(
      `Indique la razón por la que no se puede completar el protocolo "${protocolo.titulo}":`
    );
    
    if (cancelReason === null) {
      // Usuario canceló el prompt
      return;
    }

    if (!cancelReason.trim()) {
      alert("Debe proporcionar una razón para la cancelación del protocolo");
      return;
    }

    try {
      // 1. Crear un incidente basado en el protocolo cancelado
      const nuevoIncidente = {
        titulo: `Protocolo cancelado: ${protocolo.titulo}`,
        descripcion: `No se pudo completar el protocolo "${protocolo.titulo}". \n\nRazón: ${cancelReason} \n\nNotas adicionales: ${notes[`${protocolo.id_protocolo}`] || 'Sin notas adicionales'}`,
        categoria: protocolo.categoria,
        severidad: protocolo.severidad,
        estado: "Pendiente",
        asignado_a_id: currentUser.id_usuario,
        protocolo_id: protocolo.id_protocolo,
        protocolo_ejecutado: false,
      }

      const { data: incidenteCreado, error: incidenteError } = await supabase
        .from("incidentes")
        .insert([nuevoIncidente])
        .select()
        .single()

      if (incidenteError) throw incidenteError

      // 2. Crear registro de ejecución de protocolo como cancelado
      const { error: ejecucionError } = await supabase
        .from("ejecuciones_protocolo")
        .insert([
          {
            protocolo_id: protocolo.id_protocolo,
            incidente_id: incidenteCreado.id_incidente,
            usuario_id: currentUser.id_usuario,
            estado: "Cancelado",
            progreso: calculateProgress(protocolo.id_protocolo), // Guardar el progreso alcanzado
            pasos_completados: Object.entries(completedSteps)
              .filter(([key]) => key.startsWith(`${protocolo.id_protocolo}-`))
              .flatMap(([_, tasks]) => tasks),
            notas: `${notes[`${protocolo.id_protocolo}`] || ''}\n\nMotivo de cancelación: ${cancelReason}`,
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date().toISOString()
          },
        ])

      if (ejecucionError) throw ejecucionError

      // 3. Intentar notificar al usuario asignado
      try {
        const emailResponse = await fetch('/api/email/send-incident-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incidentTitle: incidenteCreado.titulo,
            incidentDescription: incidenteCreado.descripcion,
            incidentCategory: protocolo.categoria,
            incidentSeverity: protocolo.severidad,
            assignedTo: currentUser.nombre_completo,
            assignedEmail: currentUser.correo,
            protocolName: protocolo.titulo,
            createdBy: currentUser.nombre_completo,
            isFromProtocol: true,
            wasCancelled: true,
            cancellationReason: cancelReason
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error al enviar notificación de protocolo cancelado');
        }
      } catch (emailError) {
        console.error('Error en la petición de envío de correo:', emailError);
        // No interrumpimos el flujo si falla el envío de correo
      }

      // 4. Resetear el estado local para el protocolo
      setCompletedSteps((prev) => {
        const newCompletedSteps = { ...prev };
        protocolo.pasos.forEach(paso => {
          delete newCompletedSteps[`${protocolo.id_protocolo}-${paso.titulo}`];
        });
        return newCompletedSteps;
      });
      
      setNotes((prev) => {
        const newNotes = { ...prev };
        delete newNotes[`${protocolo.id_protocolo}`];
        return newNotes;
      });

      alert("Protocolo cancelado y se ha generado un incidente para seguimiento");
      
      // 5. Recargar datos
      cargarDatos();
    } catch (error) {
      console.error("Error cancelando protocolo:", error);
      alert("Error al registrar la cancelación del protocolo")
    }
  }

  // Función para generar el contenido del PDF (simplificada)
  const handlePrintProtocol = (protocolo: Protocolo) => {
    const options = {
      filename: `protocolo_${protocolo.titulo.replace(/\s+/g, '_')}.pdf`,
      page: { margin: 10 }
    };
    
    if (pdfRef.current) {
      toPDF(pdfRef, options);
    }
  }

  const verificarProtocoloVinculado = async (idProtocolo: number) => {
    try {
      // Verificar si está vinculado a riesgos
      const { data: riesgosVinculados, error: errorRiesgos } = await supabase
        .from("riesgos")
        .select("id_riesgo")
        .eq("protocolo_id", idProtocolo)
        .limit(1)
      
      if (errorRiesgos) throw errorRiesgos
      
      if (riesgosVinculados && riesgosVinculados.length > 0) {
        return { vinculado: true, tipo: "riesgo" }
      }
      
      // Verificar si está vinculado a incidentes
      const { data: incidentesVinculados, error: errorIncidentes } = await supabase
        .from("incidentes")
        .select("id_incidente")
        .eq("protocolo_id", idProtocolo)
        .limit(1)
      
      if (errorIncidentes) throw errorIncidentes
      
      if (incidentesVinculados && incidentesVinculados.length > 0) {
        return { vinculado: true, tipo: "incidente" }
      }
      
      // Verificar si tiene ejecuciones
      const { data: ejecucionesVinculadas, error: errorEjecuciones } = await supabase
        .from("ejecuciones_protocolo")
        .select("id_ejecucion")
        .eq("protocolo_id", idProtocolo)
        .limit(1)
      
      if (errorEjecuciones) throw errorEjecuciones
      
      if (ejecucionesVinculadas && ejecucionesVinculadas.length > 0) {
        return { vinculado: true, tipo: "ejecución" }
      }
      
      return { vinculado: false }
    } catch (error) {
      console.error("Error verificando vinculación de protocolo:", error)
      return { vinculado: true, error: true } // Por seguridad, si hay error, asumimos que está vinculado
    }
  }

  const ProtocolPDFContent = ({ protocolo }: { protocolo: Protocolo }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={pdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Protocolo: {protocolo.titulo}</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Información General:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>Categoría:</strong> {protocolo.categoria}</li>
            <li><strong>Severidad:</strong> {protocolo.severidad}</li>
            <li><strong>Tiempo Estimado:</strong> {protocolo.tiempo_estimado}</li>
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Herramientas Necesarias:</h3>
          <ul>
            {protocolo.herramientas_necesarias.map((tool, index) => (
              <li key={index}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Descripción:</h3>
        <p style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          {protocolo.descripcion}
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Pasos del Protocolo:</h3>
        {protocolo.pasos.map((paso, index) => (
          <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>{index + 1}. {paso.titulo}</h4>
            <p><em>{paso.descripcion}</em></p>
            <ul>
              {paso.tareas.map((tarea, taskIndex) => (
                <li key={taskIndex}>{tarea}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Notas y Observaciones:</h3>
        <p style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', minHeight: '50px' }}>
          {notes[`${protocolo.id_protocolo}`] || 'Sin notas adicionales'}
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
        <div>
          <p><strong>Generado por:</strong> {currentUser?.nombre_completo || 'Usuario del sistema'}</p>
        </div>
        <div>
          <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
        <p>Universidad de Costa Rica - Sistema de Gestión de Riesgos</p>
        <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Protocolos y Procedimientos</h2>
          <p className="text-primary-blue">Guías paso a paso para resolver incidentes comunes</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Protocolos
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
                            <SelectItem  value="hardware">Hardware</SelectItem>
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
                        <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" size="sm" onClick={addStep}>
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
                                  <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" size="sm" onClick={() => addTask(stepIndex)}>
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
                    <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" type="submit">Crear Protocolo</Button>
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
            <CardTitle>Catálogo de Protocolos</CardTitle>
            <CardDescription>Seleccione un procedimiento para ver los detalles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-blue" />
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
                  className={`cursor-pointer rounded-md border border-primary-blue p-3 transition-colors hover:bg-accent ${activeProcedure === protocolo.id_protocolo ? "border-primary bg-accent" : ""}`}
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
                  <div className="mt-2 flex items-center justify-between text-sm text-primary-blue">
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
              {searchTerm === "" && protocolos.length > 5 && (
                <div className="mt-2 text-center text-sm text-primary-blue">
                  Mostrando 5 de {protocolos.length} protocolos. Busque para ver más.
                </div>
              )}
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
                          <Clock className="h-4 w-4 text-primary-blue" />
                          <span>Tiempo estimado: {protocolo.tiempo_estimado}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clipboard className="h-4 w-4 text-primary-blue" />
                          <span>Progreso: {calculateProgress(protocolo.id_protocolo)}%</span>
                        </div>
                        <div>
                          {isAdmin && (
                          <>
                            <Button
                              className="border border-primary-blue text-white bg-primary-blue"
                              variant="outline"
                              onClick={() => prepararEdicionProtocolo(protocolo)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Button
                              className="border border-red-500 text-white bg-red-500"
                              variant="outline"
                              onClick={() => handleDeleteProtocol(protocolo)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </>
                        )}
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
                                      <span className="text-xs text-primary-blue">{progress}%</span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pl-8">
                                    <p className="text-sm text-primary-blue">{step.descripcion}</p>
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
                          className={`h-5 w-5 ${calculateProgress(protocolo.id_protocolo) === 100 ? "text-green-500" : "text-primary-blue"}`}
                        />
                        <span className="text-sm">
                          {calculateProgress(protocolo.id_protocolo) === 100
                            ? "Procedimiento completado"
                            : `${calculateProgress(protocolo.id_protocolo)}% completado`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="border border-primary-blue text-white bg-primary-blue" 
                          variant="outline"
                          onClick={() => handlePrintProtocol(protocolo)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              className="border border-red-500 text-white bg-red-500"
                              variant="outline"
                              onClick={() => handleCancelProtocol(protocolo)}
                              disabled={calculateProgress(protocolo.id_protocolo) === 0} // No permite cancelar si no se ha iniciado
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                            <Button
                              className="border border-primary-blue text-white bg-primary-blue"
                              onClick={() => handleCompleteProtocol(protocolo)}
                              disabled={calculateProgress(protocolo.id_protocolo) < 100}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Completar
                            </Button>
                          </>
                        )}
                        
                      </div>
                    </CardFooter>
                  </div>
                ))}
            </>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-6">
                <BookOpen className="h-10 w-10 text-primary-blue" />
              </div>
              <h3 className="mt-4 text-xl font-medium">Seleccione un Procedimiento</h3>
              <p className="mt-2 text-center text-primary-blue">
                Elija un procedimiento del catálogo para ver los pasos detallados y comenzar a ejecutarlo.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader 
          className="cursor-pointer flex flex-row items-center justify-between"
        >
          <div>
            <CardTitle>Ejecuciones Recientes</CardTitle>
            <CardDescription>Últimos protocolos ejecutados o en progreso</CardDescription>
          </div>
        </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {ejecucionesRecientes
                  .slice(0, showAllExecutions ? undefined : 3)
                  .map((ejecucion) => (
                    <div key={ejecucion.id_ejecucion} className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(ejecucion.protocolo?.categoria || "")}
                        <div>
                          <p className="font-medium">{ejecucion.protocolo?.titulo}</p>
                          <p className="text-sm text-primary-blue">Incidente: {ejecucion.incidente?.titulo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Iniciado: {formatDate(ejecucion.fecha_inicio)}</p>
                          <p className="text-xs text-primary-blue">Por: {ejecucion.usuario?.nombre_completo}</p>
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
              <Button 
                className="border border-primary-blue text-white bg-primary-blue w-full" 
                variant="outline"
                onClick={() => setShowAllExecutions(!showAllExecutions)}
              >
                {showAllExecutions 
                  ? "Mostrar Solo Recientes" 
                  : ejecucionesRecientes.length > 3 
                    ? `Ver Historial Completo (${ejecucionesRecientes.length - 3} más)` 
                    : "No hay más registros"}
              </Button>
            </CardFooter>

      </Card>

      {/* Modal para edición de protocolo - siempre presente, controlado por estado */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Protocolo</DialogTitle>
            <DialogDescription>
              Actualice la información del protocolo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProtocol}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol-title-edit">Título del Protocolo</Label>
                  <Input
                    id="protocol-title-edit"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol-category-edit">Categoría</Label>
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
                <Label htmlFor="protocol-description-edit">Descripción</Label>
                <Textarea
                  id="protocol-description-edit"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol-severity-edit">Severidad</Label>
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
                  <Label htmlFor="protocol-time-edit">Tiempo Estimado</Label>
                  <Input
                    id="protocol-time-edit"
                    placeholder="ej: 30-60 min"
                    value={tiempoEstimado}
                    onChange={(e) => setTiempoEstimado(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol-tools-edit">Herramientas (separadas por coma)</Label>
                  <Input
                    id="protocol-tools-edit"
                    placeholder="ej: Destornillador, Multímetro"
                    value={herramientas}
                    onChange={(e) => setHerramientas(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pasos del Protocolo</Label>
                  <Button 
                    className="border border-primary-blue text-white bg-primary-blue" 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addStep}
                  >
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
                            <Button 
                              className="border border-primary-blue text-white bg-primary-blue" 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addTask(stepIndex)}
                            >
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
              <Button 
                className="border border-primary-blue text-white bg-primary-blue" 
                type="button" 
                variant="outline" 
                onClick={() => setEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="border border-primary-blue text-white bg-primary-blue" 
                type="submit"
              >
                Actualizar Protocolo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Componente oculto para el PDF */}
      {activeProcedure && protocolos.filter(p => p.id_protocolo === activeProcedure).map(protocolo => (
        <div key={protocolo.id_protocolo} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ProtocolPDFContent protocolo={protocolo} />
        </div>
      ))}
    </div>
  )
}
