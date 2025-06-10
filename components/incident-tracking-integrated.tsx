"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Search, Filter, Play, FileText, AlertTriangle, ArrowRight, Printer } from "lucide-react"
import {
  supabase,
  type Incidente,
  type Riesgo,
  type Protocolo,
  type Usuario,
  type EjecucionProtocolo,
} from "@/lib/supabase"
import ProtocolExecution from "@/components/protocol-execution"
import toPDF from 'react-to-pdf';

export default function IncidentTrackingIntegrated() {
  const [executingProtocol, setExecutingProtocol] = useState<number | null>(null)
  const [incidentes, setIncidentes] = useState<Incidente[]>([])
  const [riesgos, setRiesgos] = useState<Riesgo[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([]) // Nuevo estado para usuarios
  const [ejecucionesEnProgreso, setEjecucionesEnProgreso] = useState<EjecucionProtocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Campos del formulario
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [severidad, setSeveridad] = useState("")
  const [asignadoAId, setAsignadoAId] = useState("") // Cambiado de asignadoA a asignadoAId
  const [riesgoId, setRiesgoId] = useState("")
  const [protocoloId, setProtocoloId] = useState("")

  // Agregar este estado en la sección de estados al inicio del componente
  const [protocolsExpanded, setProtocolsExpanded] = useState(false)

  // Agregar este nuevo estado al inicio del componente junto con los otros estados
  const [showAllIncidents, setShowAllIncidents] = useState(false)

  const incidentPdfRef = useRef(null);
  const incidentListPdfRef = useRef(null);

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
      // Cargar incidentes with riesgos, protocolos y usuarios asignados
      const { data: incidentesData, error: incidentesError } = await supabase
        .from("incidentes")
        .select(`
          *,
          riesgo:riesgos(*),
          protocolo:protocolos(*),
          usuario_asignado:usuarios!incidentes_asignado_a_id_fkey(*)
        `)
        .order("fecha_reporte", { ascending: false })

      if (incidentesError) throw incidentesError

      // Cargar riesgos activos
      const { data: riesgosData, error: riesgosError } = await supabase
        .from("riesgos")
        .select("*")
        .eq("estado", "Activo")
        .order("nombre")

      if (riesgosError) throw riesgosError

      // Cargar protocolos activos
      const { data: protocolosData, error: protocolosError } = await supabase
        .from("protocolos")
        .select("*")
        .eq("activo", true)
        .order("titulo")

      if (protocolosError) throw protocolosError

      // Cargar usuarios activos
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("activo", true)
        .order("nombre_completo")

      if (usuariosError) throw usuariosError

      // Cargar ejecuciones en progreso
      const { data: ejecucionesData, error: ejecucionesError } = await supabase
        .from("ejecuciones_protocolo")
        .select(`
          *,
          protocolo:protocolos(*),
          incidente:incidentes(*),
          usuario:usuarios(*)
        `)
        .eq("estado", "En progreso")
        .order("fecha_inicio", { ascending: false })

      if (ejecucionesError) throw ejecucionesError

      setIncidentes(incidentesData || [])
      setRiesgos(riesgosData || [])
      setProtocolos(protocolosData || [])
      setUsuarios(usuariosData || [])
      setEjecucionesEnProgreso(ejecucionesData || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      alert("Solo los administradores pueden crear incidentes")
      return
    }

    if (!titulo || !descripcion || !categoria || !severidad) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    try {
      const nuevoIncidente = {
        titulo,
        descripcion,
        categoria,
        severidad,
        estado: "Pendiente",
        asignado_a_id: asignadoAId ? Number.parseInt(asignadoAId) : null, // Cambiado a asignado_a_id
        riesgo_id: riesgoId ? Number.parseInt(riesgoId) : null,
        protocolo_id: protocoloId ? Number.parseInt(protocoloId) : null,
        protocolo_ejecutado: false,
      }

      const { data: incidenteCreado, error } = await supabase
        .from("incidentes")
        .insert([nuevoIncidente])
        .select()
        .single()

      if (error) throw error

      // Obtener datos adicionales para la notificación
      let riesgoNombre = "";
      let protocoloNombre = "";
      let usuarioAsignado = null;

      // Si hay un riesgo asociado, obtener su nombre
      if (riesgoId) {
        const { data: riesgoData } = await supabase
          .from("riesgos")
          .select("nombre")
          .eq("id_riesgo", riesgoId)
          .single();
        
        if (riesgoData) riesgoNombre = riesgoData.nombre;
      }

      // Si hay un protocolo asociado, obtener su título
      if (protocoloId) {
        const { data: protocoloData } = await supabase
          .from("protocolos")
          .select("titulo")
          .eq("id_protocolo", protocoloId)
          .single();
        
        if (protocoloData) protocoloNombre = protocoloData.titulo;
      }

      // Obtener datos del usuario asignado
      if (asignadoAId) {
        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id_usuario", asignadoAId)
          .single();
        
        if (usuarioData) usuarioAsignado = usuarioData;
      }

      // Si hay un usuario asignado con correo, enviar notificación
      if (usuarioAsignado && usuarioAsignado.correo) {
        try {
          const emailResponse = await fetch('/api/email/send-incident-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              incidentTitle: titulo,
              incidentDescription: descripcion,
              incidentCategory: categoria,
              incidentSeverity: severidad,
              assignedTo: usuarioAsignado.nombre_completo,
              assignedEmail: usuarioAsignado.correo,
              riskName: riesgoNombre,
              protocolName: protocoloNombre,
              createdBy: currentUser?.nombre_completo || "Usuario del sistema"
            }),
          });

          if (!emailResponse.ok) {
            console.error('Error al enviar notificación de incidente');
          }
        } catch (emailError) {
          console.error('Error en la petición de envío de correo de incidente:', emailError);
          // No interrumpimos el flujo si falla el envío de correo
        }
      }

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
      alert("Incidente creado exitosamente")
    } catch (error) {
      console.error("Error creando incidente:", error)
      alert("Error al crear incidente")
    }
  }

  // Modificar la función ejecutarProtocolo para redirigir a la ejecución
  const ejecutarProtocolo = async (incidente: Incidente) => {
    if (!incidente.protocolo_id || !isAdmin) {
      if (!isAdmin) {
        alert("Solo los administradores pueden ejecutar protocolos")
      }
      return
    }

    try {
      // Crear ejecución de protocolo
      const { data: ejecucionData, error } = await supabase
        .from("ejecuciones_protocolo")
        .insert([
          {
            protocolo_id: incidente.protocolo_id,
            incidente_id: incidente.id_incidente,
            usuario_id: currentUser?.id_usuario,
            estado: "En progreso",
            progreso: 0,
            pasos_completados: [],
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado del incidente
      await supabase
        .from("incidentes")
        .update({
          estado: "En proceso",
          protocolo_ejecutado: true,
        })
        .eq("id_incidente", incidente.id_incidente)

      // Redirigir a la ejecución del protocolo
      setExecutingProtocol(ejecucionData.id_ejecucion)
    } catch (error) {
      console.error("Error ejecutando protocolo:", error)
    }
  }

  const continuarEjecucion = (ejecucionId: number) => {
    setExecutingProtocol(ejecucionId)
  }

  const resetForm = () => {
    setTitulo("")
    setDescripcion("")
    setCategoria("")
    setSeveridad("")
    setAsignadoAId("") // Actualizado
    setRiesgoId("")
    setProtocoloId("")
  }

  // Modificar la lógica de filtrado de incidentes
  const filteredIncidents = (searchTerm === "" && !showAllIncidents)
    ? [] 
    : incidentes.filter((incidente) => {
        const matchesSearch = searchTerm === "" ? showAllIncidents : incidente.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "Todos" || incidente.estado === statusFilter
        return matchesSearch && matchesStatus
      })

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case "Crítica":
        return "bg-red-100 text-red-800"
      case "Alta":
        return "bg-amber-100 text-amber-800"
      case "Media":
        return "bg-yellow-100 text-yellow-800"
      case "Baja":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-red-100 text-red-800"
      case "En proceso":
        return "bg-blue-100 text-blue-800"
      case "Resuelto":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  // Agregar modal para gestionar incidentes
  const [selectedIncident, setSelectedIncident] = useState<Incidente | null>(null)
  const [manageModalOpen, setManageModalOpen] = useState(false)

  const openManageModal = (incidente: Incidente) => {
    setSelectedIncident(incidente)
    setManageModalOpen(true)
  }

  // Función para imprimir un incidente individual
  const handlePrintIncident = (incidente: Incidente) => {
    const options = {
      filename: `incidente_${incidente.titulo.replace(/\s+/g, '_')}.pdf`,
      page: { margin: 10 }
    };
    
    if (incidentPdfRef.current) {
      toPDF(incidentPdfRef, options);
    }
  }

  // Función para imprimir la lista de incidentes
  const handlePrintIncidentList = () => {
    const options = {
      filename: `lista_incidentes_${new Date().toISOString().slice(0, 10)}.pdf`,
      page: { margin: 10 }
    };
    
    if (incidentListPdfRef.current) {
      toPDF(incidentListPdfRef, options);
    }
  }

  // Función para formatear fechas (si no existe ya)
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Componente para el PDF de un incidente individual
  const IncidentPDFContent = ({ incidente }: { incidente: Incidente }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={incidentPdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Incidente: {incidente.titulo}</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Información General:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>Categoría:</strong> {incidente.categoria}</li>
            <li><strong>Severidad:</strong> {incidente.severidad}</li>
            <li><strong>Estado:</strong> {incidente.estado}</li>
            <li><strong>Fecha de Reporte:</strong> {formatDate(incidente.fecha_reporte)}</li>
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Asignación:</h3>
          <p><strong>Responsable:</strong> {incidente.usuario_asignado?.nombre_completo || "Sin asignar"}</p>
          
          {incidente.fecha_resolucion && (
            <p><strong>Fecha de Resolución:</strong> {formatDate(incidente.fecha_resolucion)}</p>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Descripción:</h3>
        <p style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          {incidente.descripcion}
        </p>
      </div>
      
      {incidente.riesgo && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Riesgo Relacionado:</h3>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
            <p><strong>Nombre:</strong> {incidente.riesgo.nombre}</p>
            <p><strong>Categoría:</strong> {incidente.riesgo.categoria}</p>
            <p><strong>Impacto:</strong> {incidente.riesgo.impacto}</p>
            <p><strong>Probabilidad:</strong> {incidente.riesgo.probabilidad}</p>
          </div>
        </div>
      )}
      
      {incidente.protocolo && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Protocolo Asignado:</h3>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
            <p><strong>Título:</strong> {incidente.protocolo.titulo}</p>
            <p><strong>Severidad:</strong> {incidente.protocolo.severidad}</p>
            <p><strong>Tiempo Estimado:</strong> {incidente.protocolo.tiempo_estimado}</p>
            <p><strong>Estado de Ejecución:</strong> {incidente.protocolo_ejecutado ? "Ejecutado" : "Pendiente"}</p>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Acciones y Seguimiento:</h3>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '5px',
          minHeight: '150px',
          border: '1px solid #ddd',
          background: 'repeating-linear-gradient(#f9f9f9, #f9f9f9 24px, #ddd 24px, #ddd 25px)'
        }}></div>
      </div>
      
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <p><strong>Reportado por:</strong> _______________________________</p>
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          <p><strong>Fecha:</strong> _______________________________</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <p><strong>Firma responsable:</strong> _______________________________</p>
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          <p><strong>Verificado por:</strong> _______________________________</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
        <p>Universidad de Costa Rica - Sistema de Gestión de Riesgos</p>
        <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
    </div>
  );

  // Componente para el PDF de la lista de incidentes
  const IncidentListPDFContent = ({ incidentes }: { incidentes: Incidente[] }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={incidentListPdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Listado de Incidentes</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Filtros aplicados:</h3>
        <ul>
          <li>Estado: {statusFilter === 'Todos' ? 'Todos los estados' : statusFilter}</li>
          <li>Búsqueda: {searchTerm || 'Sin término de búsqueda'}</li>
        </ul>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Título</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Categoría</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Severidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Estado</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Riesgo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {incidentes.length > 0 ? (
            incidentes.map((incidente) => (
              <tr key={incidente.id_incidente}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {incidente.titulo}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {incidente.categoria}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      incidente.severidad === 'Crítica' ? '#ffebeb' : 
                      incidente.severidad === 'Alta' ? '#fff4e5' : 
                      incidente.severidad === 'Media' ? '#fffde7' : '#e9f7ea',
                    color: 
                      incidente.severidad === 'Crítica' ? '#c41e1e' : 
                      incidente.severidad === 'Alta' ? '#c76a15' : 
                      incidente.severidad === 'Media' ? '#a68a00' : '#1e8f2d'
                  }}>
                    {incidente.severidad}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      incidente.estado === 'Pendiente' ? '#ffebeb' : 
                      incidente.estado === 'En proceso' ? '#e7f5ff' : 
                      '#e9f7ea',
                    color: 
                      incidente.estado === 'Pendiente' ? '#c41e1e' : 
                      incidente.estado === 'En proceso' ? '#1e6fc4' : 
                      '#1e8f2d'
                  }}>
                    {incidente.estado}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {incidente.riesgo?.nombre || "Sin riesgo"}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {incidente.usuario_asignado?.nombre_completo || "Sin asignar"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                No hay incidentes que mostrar con los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
        <p>Universidad de Costa Rica - Sistema de Gestión de Riesgos</p>
        <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
    </div>
  );

  if (executingProtocol) {
    return (
      <ProtocolExecution
        ejecucionId={executingProtocol}
        onBack={() => {
          setExecutingProtocol(null)
          cargarDatos()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary-blue" />
          <p className="mt-2 text-primary-blue">Cargando incidentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ejecuciones en progreso */}
      {ejecucionesEnProgreso.length > 0 && (
        <Card>
          <CardHeader 
            className="cursor-pointer flex flex-row items-center justify-between"
            onClick={() => setProtocolsExpanded(!protocolsExpanded)}
          >
            <div>
              <CardTitle>Protocolos en Ejecución ({ejecucionesEnProgreso.length})</CardTitle>
              <CardDescription>Continúe con los protocolos que están en progreso</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              {protocolsExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </CardHeader>
          {protocolsExpanded && (
            <CardContent>
              <div className="space-y-3">
                {ejecucionesEnProgreso.map((ejecucion) => (
                  <div key={ejecucion.id_ejecucion} className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Play className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{ejecucion.protocolo?.titulo}</p>
                        <p className="text-sm text-primary-blue">Incidente: {ejecucion.incidente?.titulo}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-blue-500" style={{ width: `${ejecucion.progreso}%` }}></div>
                          </div>
                          <span className="text-xs text-primary-blue">{ejecucion.progreso}%</span>
                        </div>
                      </div>
                    </div>
                    <Button className="border border-primary-blue text-white bg-primary-blue" onClick={() => continuarEjecucion(ejecucion.id_ejecucion)} disabled={!isAdmin}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Continuar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seguimiento de Incidentes Integrado</CardTitle>
              <CardDescription>Incidentes vinculados con riesgos y protocolos de respuesta</CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="border border-primary-blue text-white bg-primary-blue">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Incidente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Incidente</DialogTitle>
                    <DialogDescription>Complete la información y vincule con riesgo y protocolo</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateIncident}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="incident-title">Título del Incidente</Label>
                        <Input
                          id="incident-title"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-description">Descripción</Label>
                        <Textarea
                          id="incident-description"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="incident-category">Categoría</Label>
                          <Select value={categoria} onValueChange={setCategoria}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ambiental">Ambiental</SelectItem>
                              <SelectItem value="Seguridad Física">Seguridad Física</SelectItem>
                              <SelectItem value="Operativo">Operativo</SelectItem>
                              <SelectItem value="Digital">Digital</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="incident-severity">Severidad</Label>
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-risk">Riesgo Relacionado</Label>
                        <Select value={riesgoId} onValueChange={setRiesgoId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar riesgo (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {riesgos.map((riesgo) => (
                              <SelectItem key={riesgo.id_riesgo} value={riesgo.id_riesgo.toString()}>
                                {riesgo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-protocol">Protocolo de Respuesta</Label>
                        <Select value={protocoloId} onValueChange={setProtocoloId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar protocolo (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {protocolos.map((protocolo) => (
                              <SelectItem key={protocolo.id_protocolo} value={protocolo.id_protocolo.toString()}>
                                {protocolo.titulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-assigned">Asignar a Usuario</Label>
                        <Select value={asignadoAId} onValueChange={setAsignadoAId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {usuarios.map((usuario) => (
                              <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                                {usuario.nombre_completo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="border border-primary-blue text-white bg-primary-blue" type="submit">Registrar Incidente</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col items-start gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-blue" />
              <Input
                placeholder="Buscar incidentes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="show-all-incidents"
                  checked={showAllIncidents}
                  onChange={(e) => setShowAllIncidents(e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                <Label htmlFor="show-all-incidents" className="text-sm text-primary-blue">
                  Mostrar todos los incidentes
                </Label>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-blue" />
                <span className="text-sm">Filtros:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="border border-primary-blue text-white bg-primary-blue" 
                variant="outline"
                onClick={handlePrintIncidentList}
              >
                <Printer className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incidente</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo Relacionado</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {searchTerm === "" 
                      ? "Ingrese un término de búsqueda para ver los incidentes" 
                      : "No se encontraron incidentes que coincidan con su búsqueda"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incidente) => (
                  <TableRow key={incidente.id_incidente}>
                    <TableCell className="font-medium">{incidente.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSeverityColor(incidente.severidad)}>
                        {incidente.severidad}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(incidente.estado)}>
                        {incidente.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {incidente.riesgo ? (
                        <span className="text-sm">{incidente.riesgo.nombre}</span>
                      ) : (
                        <span className="text-sm text-primary-blue">Sin riesgo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {incidente.protocolo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{incidente.protocolo.titulo}</span>
                          {incidente.protocolo_ejecutado && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Ejecutado
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-primary-blue">Sin protocolo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {incidente.usuario_asignado ? (
                        <span className="text-sm">{incidente.usuario_asignado.nombre_completo}</span>
                      ) : (
                        <span className="text-sm text-primary-blue">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {incidente.protocolo_id && !incidente.protocolo_ejecutado && isAdmin && (
                          <Button className="border border-primary-blue text-white bg-primary-blue"  variant="outline" size="sm" onClick={() => ejecutarProtocolo(incidente)}>
                            <Play className="mr-2 h-4 w-4" />
                            Ejecutar Protocolo
                          </Button>
                        )}
                        <Button className="border border-primary-blue text-white bg-primary-blue"  variant="outline" size="sm" onClick={() => openManageModal(incidente)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Gestionar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={manageModalOpen} onOpenChange={setManageModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gestión de Incidente</DialogTitle>
            <DialogDescription>Detalles y seguimiento del incidente</DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedIncident.titulo}</h3>
                <Badge variant="outline" className={getStatusColor(selectedIncident.estado)}>
                  {selectedIncident.estado}
                </Badge>
              </div>
              <div className="rounded-md border border-primary-blue p-3">
                <h4 className="mb-2 font-medium">Descripción</h4>
                <p className="text-sm">{selectedIncident.descripcion}</p>
              </div>
              {selectedIncident.riesgo && (
                <div className="rounded-md border border-primary-blue p-3">
                  <h4 className="mb-2 font-medium">Riesgo Relacionado</h4>
                  <p className="text-sm">{selectedIncident.riesgo.nombre}</p>
                </div>
              )}
              {selectedIncident.protocolo && (
                <div className="rounded-md border border-primary-blue p-3">
                  <h4 className="mb-2 font-medium">Protocolo Asignado</h4>
                  <p className="text-sm">{selectedIncident.protocolo.titulo}</p>
                  {selectedIncident.protocolo_ejecutado && (
                    <Badge className="mt-2 bg-green-100 text-green-800">Protocolo Ejecutado</Badge>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-medium">Severidad</h4>
                  <Badge variant="outline" className={getSeverityColor(selectedIncident.severidad)}>
                    {selectedIncident.severidad}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">Asignado a</h4>
                  <p className="text-sm">
                    {selectedIncident.usuario_asignado ? (
                      <span>{selectedIncident.usuario_asignado.nombre_completo}</span>
                    ) : (
                      <span className="text-primary-blue">Sin asignar</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue"  variant="outline" onClick={() => setManageModalOpen(false)}>
              Cerrar
            </Button>
            <Button 
              className="border border-primary-blue text-white bg-primary-blue" 
              variant="outline"
              onClick={() => selectedIncident && handlePrintIncident(selectedIncident)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {selectedIncident?.protocolo_id && !selectedIncident.protocolo_ejecutado && isAdmin && (
              <Button className="border border-primary-blue text-white bg-primary-blue" 
                onClick={() => {
                  setManageModalOpen(false)
                  ejecutarProtocolo(selectedIncident)
                }}
              >
                Ejecutar Protocolo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componentes ocultos para el PDF */}
      {selectedIncident && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <IncidentPDFContent incidente={selectedIncident} />
        </div>
      )}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <IncidentListPDFContent incidentes={filteredIncidents} />
      </div>
    </div>
  )
}
