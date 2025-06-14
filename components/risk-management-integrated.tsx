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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, FileText, AlertTriangle, BookOpen, Zap, Eye, Play, Printer } from "lucide-react"
import { supabase, type Riesgo, type Protocolo, type Usuario, type MaterializacionRiesgo } from "@/lib/supabase"
import toPDF from 'react-to-pdf';
import Logger from "@/lib/logger"

export default function RiskManagementIntegrated() {
  const [riesgos, setRiesgos] = useState<Riesgo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [materializaciones, setMaterializaciones] = useState<MaterializacionRiesgo[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingRisk, setCreatingRisk] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [impactFilter, setImpactFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [materializeModalOpen, setMaterializeModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<Riesgo | null>(null)

  // Campos del formulario de riesgo
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [impacto, setImpacto] = useState("")
  const [probabilidad, setProbabilidad] = useState("")
  const [medidas, setMedidas] = useState("")
  const [responsableId, setResponsableId] = useState("")
  const [protocoloId, setProtocoloId] = useState("")

  // Campos del formulario de materialización
  const [descripcionEvento, setDescripcionEvento] = useState("")
  const [severidadReal, setSeveridadReal] = useState("")
  const [accionesTomadas, setAccionesTomadas] = useState("")
  const [notasMaterializacion, setNotasMaterializacion] = useState("")

  // Estados para modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [materializationDetailsOpen, setMaterializationDetailsOpen] = useState(false)
  const [selectedMaterialization, setSelectedMaterialization] = useState<MaterializacionRiesgo | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false) // Nuevo estado para modal de edición

  // Estado para edición de riesgo
  const [editMedidas, setEditMedidas] = useState("")
  const [editEstado, setEditEstado] = useState("")
  const [editResponsableId, setEditResponsableId] = useState("")
  const [editProtocoloId, setEditProtocoloId] = useState("")
  const [updatingRisk, setUpdatingRisk] = useState(false)

  // Nuevo estado para mostrar todos los riesgos sin filtrar
  const [showAllWithoutSearch, setShowAllWithoutSearch] = useState(false)

  // Referencias para los PDFs
  const riskPdfRef = useRef<HTMLDivElement>(null)
  const riskListPdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem("usuario")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    cargarDatos()
  }, [])

  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  const cargarDatos = async () => {
    try {
      // Cargar riesgos con protocolos y responsables
      const { data: riesgosData, error: riesgosError } = await supabase
        .from("riesgos")
        .select(`
          *,
          protocolo:protocolos(*),
          responsable:usuarios!riesgos_responsable_id_fkey(*)
        `)
        .order("fecha_creacion", { ascending: false })

      if (riesgosError) throw riesgosError

      // Cargar usuarios activos
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("activo", true)
        .order("nombre_completo")

      if (usuariosError) throw usuariosError

      // Cargar protocolos
      const { data: protocolosData, error: protocolosError } = await supabase
        .from("protocolos")
        .select("*")
        .eq("activo", true)
        .order("titulo")

      if (protocolosError) throw protocolosError

      // Cargar materializaciones
      const { data: materializacionesData, error: materializacionesError } = await supabase
        .from("materializaciones_riesgo")
        .select(`
          *,
          riesgo:riesgos(*),
          protocolo_ejecutado:protocolos(*),
          incidente_generado:incidentes(*),
          usuario_reporta:usuarios!materializaciones_riesgo_usuario_reporta_id_fkey(*),
          usuario_resuelve:usuarios!materializaciones_riesgo_resuelto_por_fkey(*)
        `)
        .order("fecha_materializacion", { ascending: false })

      if (materializacionesError) throw materializacionesError

      setRiesgos(riesgosData || [])
      setUsuarios(usuariosData || [])
      setProtocolos(protocolosData || [])
      setMaterializaciones(materializacionesData || [])
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingRisk(true)
    Logger.operacion("Intento de creación de riesgo", "Informativo", currentUser?.id_usuario)
    if (!isAdmin) {
      alert("Solo los administradores pueden crear riesgos")
      return
    }

    if (!nombre) {
      alert("El nombre del riesgo es obligatorio")
      return
    }
    if (!descripcion) {
      alert("La descripción del riesgo es obligatoria")
      return
    }
    if (!categoria) {
      alert("La categoría del riesgo es obligatoria")
      return
    }
    if (!impacto) {
      alert("El impacto del riesgo es obligatorio")
      return
    }
    if (!probabilidad) {
      alert("La probabilidad del riesgo es obligatoria")
      return
    }
    if (!responsableId) {
      alert("Debe seleccionar un responsable para el riesgo")
      return
    }
    if (!medidas) {
      alert("Las medidas de mitigación son obligatorias")
      return
    }
    if (protocoloId && !protocolos.some((p) => p.id_protocolo === Number.parseInt(protocoloId))) {
      alert("El protocolo seleccionado no es válido")
      return
    }
    if (impacto !== "Crítico" && impacto !== "Alto" && impacto !== "Medio" && impacto !== "Bajo") {
      alert("Impacto debe ser 'Crítico', 'Alto', 'Medio' o 'Bajo'")
      return
    }
    if (probabilidad !== "Alta" && probabilidad !== "Media" && probabilidad !== "Baja") {
      alert("Probabilidad debe ser 'Alta', 'Media' o 'Baja'")
      return
    }
    if (categoria !== "Ambiental" && categoria !== "Seguridad Física" && categoria !== "Operativo" && categoria !== "Digital") {
      alert("Categoría debe ser 'Ambiental', 'Seguridad Física', 'Operativo' o 'Digital'")
      return
    }
    if (medidas.length < 10) {
      alert("Las medidas de mitigación deben tener al menos 10 caracteres")
      return
    }

    try {
      const nuevoRiesgo = {
        nombre,
        descripcion,
        categoria,
        impacto,
        probabilidad,
        estado: "Identificado", // Estado inicial al crear un riesgo
        medidas_mitigacion: medidas,
        responsable_id: Number.parseInt(responsableId),
        protocolo_id: protocoloId ? Number.parseInt(protocoloId) : null,
      }

      const { error } = await supabase.from("riesgos").insert([nuevoRiesgo])

      if (error) {
        Logger.seguridad("Error al crear riesgo", "Crítico", currentUser?.id_usuario)
        throw error
      }
      Logger.operacion(`Riesgo ${nombre} creado exitosamente`, "Informativo", currentUser?.id_usuario)

      setCreateModalOpen(false)
      resetForm()
      cargarDatos()
      alert("Riesgo creado exitosamente")
    } catch (error) {
      Logger.seguridad("Error al crear riesgo", "Crítico", currentUser?.id_usuario)
      console.error("Error creando riesgo:", error)
      alert("Error al crear riesgo")
    } finally {
      setCreatingRisk(false)
    }
  }

  const handleMaterializeRisk = async (e: React.FormEvent) => {
    e.preventDefault()
    Logger.operacion("Intento de materialización de riesgo", "Informativo", currentUser?.id_usuario)

    if (!selectedRisk || !isAdmin) {
      alert("Solo los administradores pueden materializar riesgos")
      return
    }
    

    try {
      const acciones = accionesTomadas
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)

      // Crear materialización
      const { data: materializacionData, error: materializacionError } = await supabase
        .from("materializaciones_riesgo")
        .insert([
          {
            riesgo_id: selectedRisk.id_riesgo,
            descripcion_evento: descripcionEvento,
            severidad_real: severidadReal,
            acciones_tomadas: acciones,
            usuario_reporta_id: currentUser?.id_usuario,
            notas: notasMaterializacion,
          },
        ])
        .select()
        .single()

      if (materializacionError) throw materializacionError

      let incidenteData = null;
      
      // Si hay protocolo asociado, crear incidente automáticamente
      if (selectedRisk.protocolo_id) {
        const { data: incidenteGenerado, error: incidenteError } = await supabase
          .from("incidentes")
          .insert([
            {
              titulo: `Materialización de riesgo: ${selectedRisk.nombre}`,
              descripcion: descripcionEvento,
              categoria: selectedRisk.categoria,
              severidad: severidadReal,
              estado: "Pendiente",
              asignado_a: selectedRisk.responsable?.nombre_completo || "Sin asignar",
              riesgo_id: selectedRisk.id_riesgo,
              protocolo_id: selectedRisk.protocolo_id,
              protocolo_ejecutado: false,
            },
          ])
          .select()
          .single()

        if (incidenteError) {
          Logger.seguridad("Error al crear incidente", "Crítico", currentUser?.id_usuario)
          throw incidenteError
        }
        Logger.operacion(`Incidente generado para riesgo ${selectedRisk.nombre}`, "Informativo", currentUser?.id_usuario) 
        incidenteData = incidenteGenerado;

        // Actualizar materialización con el incidente generado
        await supabase
          .from("materializaciones_riesgo")
          .update({ incidente_generado_id: incidenteData.id_incidente })
          .eq("id_materializacion", materializacionData.id_materializacion)
      }

      // Enviar notificación por correo al responsable
      if (selectedRisk.responsable?.correo) {
        try {
          const emailResponse = await fetch('/api/email/send-risk-materialization', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              riskName: selectedRisk.nombre,
              riskCategory: selectedRisk.categoria,
              eventDescription: descripcionEvento,
              realSeverity: severidadReal,
              reportedBy: currentUser?.nombre_completo || "Usuario del sistema",
              responsibleName: selectedRisk.responsable.nombre_completo,
              responsibleEmail: selectedRisk.responsable.correo,
              protocolName: selectedRisk.protocolo?.titulo || "",
              hasProtocol: !!selectedRisk.protocolo_id
            }),
          });

          if (!emailResponse.ok) {
            console.error('Error al enviar notificación de materialización de riesgo');
          }
        } catch (emailError) {
          console.error('Error en la petición de envío de correo de materialización:', emailError);
          // No interrumpimos el flujo si falla el envío de correo
        }
      }

      setMaterializeModalOpen(false)
      resetMaterializationForm()
      cargarDatos()
      alert(
        selectedRisk.protocolo_id
          ? "Riesgo materializado e incidente creado automáticamente"
          : "Riesgo materializado exitosamente",
      )
    } catch (error) {
      console.error("Error materializando riesgo:", error)
      alert("Error al materializar riesgo")
    }
  }

  const openMaterializeModal = (riesgo: Riesgo) => {
    setSelectedRisk(riesgo)
    setMaterializeModalOpen(true)
  }

  const openDetailsModal = (riesgo: Riesgo) => {
    setSelectedRisk(riesgo)
    setDetailsModalOpen(true)
  }

  const openMaterializationDetails = (materializacion: MaterializacionRiesgo) => {
    setSelectedMaterialization(materializacion)
    setMaterializationDetailsOpen(true)
  }

  const openEditModal = (riesgo: Riesgo) => {
    setSelectedRisk(riesgo)
    // Cargar datos actuales del riesgo en el formulario
    setEditMedidas(riesgo.medidas_mitigacion)
    setEditEstado(riesgo.estado)
    setEditResponsableId(riesgo.responsable_id?.toString() || "")
    setEditProtocoloId(riesgo.protocolo_id?.toString() || "")
    setEditModalOpen(true)
  }

  const handleUpdateRisk = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingRisk(true)
    Logger.operacion("Intento de actualización de riesgo", "Informativo", currentUser?.id_usuario)
    if (!selectedRisk || !isAdmin) {
      alert("Solo los administradores pueden actualizar riesgos")
      setUpdatingRisk(false)
      return
    }

    if (!editEstado) {
      alert("El estado del riesgo es obligatorio")
      setUpdatingRisk(false)
      return
    }

    if (!editResponsableId) {
      alert("Debe seleccionar un responsable para el riesgo")
      setUpdatingRisk(false)
      return
    }

    if (!editMedidas || editMedidas.length < 10) {
      alert("Las medidas de mitigación deben tener al menos 10 caracteres")
      setUpdatingRisk(false)
      return
    }

    try {
      const actualizacionRiesgo = {
        estado: editEstado,
        medidas_mitigacion: editMedidas,
        responsable_id: Number.parseInt(editResponsableId),
        protocolo_id: editProtocoloId ? Number.parseInt(editProtocoloId) : null,
      }

      const { error } = await supabase
        .from("riesgos")
        .update(actualizacionRiesgo)
        .eq("id_riesgo", selectedRisk.id_riesgo)

      if (error) {
        Logger.seguridad("Error al actualizar riesgo", "Crítico", currentUser?.id_usuario)
        throw error
      } 

      Logger.operacion(`Riesgo ${selectedRisk.nombre} actualizado exitosamente`, "Informativo", currentUser?.id_usuario)

      setEditModalOpen(false)
      setDetailsModalOpen(false)
      cargarDatos()
      alert("Riesgo actualizado exitosamente")
    } catch (error) {
      console.error("Error actualizando riesgo:", error)
      alert("Error al actualizar riesgo")
    } finally {
      setUpdatingRisk(false)
    }
  }

  // Función para cambiar solo el estado del riesgo
  const handleChangeRiskState = async (riesgoId: number, nuevoEstado: string) => {
    if (!isAdmin) {
      alert("Solo los administradores pueden cambiar el estado de los riesgos")
      return
    }
    Logger.operacion(`Cambio de estado del riesgo ${riesgoId} a ${nuevoEstado}`, "Informativo", currentUser?.id_usuario)

    try {
      const { error } = await supabase
        .from("riesgos")
        .update({ estado: nuevoEstado })
        .eq("id_riesgo", riesgoId)

      if (error) {
        Logger.seguridad("Error al cambiar estado de riesgo", "Crítico", currentUser?.id_usuario)
        throw error
      }
      Logger.operacion(`Estado del riesgo ${riesgoId} cambiado a ${nuevoEstado}`, "Informativo", currentUser?.id_usuario)
      cargarDatos()
      alert(`Estado del riesgo actualizado a: ${nuevoEstado}`)
    } catch (error) {
      console.error("Error cambiando estado del riesgo:", error)
      alert("Error al cambiar el estado del riesgo")
    }
  }

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setCategoria("")
    setImpacto("")
    setProbabilidad("")
    setMedidas("")
    setResponsableId("")
    setProtocoloId("")
  }

  const resetMaterializationForm = () => {
    setDescripcionEvento("")
    setSeveridadReal("")
    setAccionesTomadas("")
    setNotasMaterializacion("")
  }

  // Modificar la lógica de filtrado para mostrar la tabla vacía hasta que se busque
  const filteredRisks = (searchTerm === "" && !showAllWithoutSearch)
    ? [] 
    : riesgos.filter((riesgo) => {
        const matchesSearch = searchTerm === "" ? showAllWithoutSearch : riesgo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === "Todos" || riesgo.categoria === categoryFilter
        const matchesImpact = impactFilter === "Todos" || riesgo.impacto === impactFilter
        return matchesSearch && matchesCategory && matchesImpact
      })

  const getImpactColor = (impacto: string) => {
    switch (impacto) {
      case "Crítico":
        return "bg-red-100 text-red-800"
      case "Alto":
        return "bg-amber-100 text-amber-800"
      case "Medio":
        return "bg-yellow-100 text-yellow-800"
      case "Bajo":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Activo":
      case "Identificado":
        return "bg-red-100 text-red-800"
      case "Planificado":
      case "En seguimiento":
        return "bg-blue-100 text-blue-800"
      case "Mitigado":
        return "bg-green-100 text-green-800"
      case "Monitoreo":
        return "bg-yellow-100 text-yellow-800" 
      case "Cerrado":
        return "bg-gray-100 text-gray-800"
      case "Reactivado":
        return "bg-purple-100 text-purple-800"
      default:
        return ""
    }
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

  // Función para imprimir un riesgo individual
  const handlePrintRisk = (riesgo: Riesgo) => {
    const options = {
      filename: `riesgo_${riesgo.nombre.replace(/\s+/g, '_')}.pdf`,
      page: { margin: 10 }
    };
    
    if (riskPdfRef.current) {
      toPDF(riskPdfRef, options);
    }
  }

  // Función para imprimir la lista de riesgos
  const handlePrintRiskList = () => {
    const options = {
      filename: `lista_riesgos_${new Date().toISOString().slice(0, 10)}.pdf`,
      page: { margin: 10 }
    };
    
    if (riskListPdfRef.current) {
      toPDF(riskListPdfRef, options);
    }
  }

  // Componente para el PDF de un riesgo individual
  const RiskPDFContent = ({ riesgo }: { riesgo: Riesgo }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={riskPdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Riesgo: {riesgo.nombre}</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Información General:</h3>
          <br />
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>Categoría:</strong> {riesgo.categoria}</li>
            <li><strong>Impacto:</strong> {riesgo.impacto}</li>
            <li><strong>Probabilidad:</strong> {riesgo.probabilidad}</li>
            <li><strong>Estado:</strong> {riesgo.estado}</li>
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Responsable:</h3>
          <br />
          <p>{riesgo.responsable?.nombre_completo || "Sin asignar"}</p>
          <h3>Fecha de Creación:</h3>
          <p>{formatDate(riesgo.fecha_creacion)}</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Descripción:</h3>
        <br />
        <p style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          {riesgo.descripcion}
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Medidas de Mitigación:</h3>
        <br />
        <p style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          {riesgo.medidas_mitigacion}
        </p>
      </div>
      
      {riesgo.protocolo && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Protocolo Vinculado:</h3>
          <br />
          <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <p><strong>Título:</strong> {riesgo.protocolo.titulo}</p>
            <p><strong>Descripción:</strong> {riesgo.protocolo.descripcion}</p>
            <p><strong>Severidad:</strong> {riesgo.protocolo.severidad}</p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <p><strong>Generado por:</strong> {currentUser?.nombre_completo || 'Usuario del sistema'}</p>
        </div>
        <div style={{ width: '45%', textAlign: 'right' }}>
          <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
        <p>Universidad de Costa Rica - Sistema de Gestión de Riesgos</p>
        <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
      </div>
    </div>
  );

  // Componente para el PDF de la lista de riesgos
  const RiskListPDFContent = ({ riesgos }: { riesgos: Riesgo[] }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={riskListPdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Listado de Riesgos</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Filtros aplicados:</h3>
        <ul>
          <li>Categoría: {categoryFilter === 'Todos' ? 'Todas' : categoryFilter}</li>
          <li>Impacto: {impactFilter === 'Todos' ? 'Todos' : impactFilter}</li>
          <li>Búsqueda: {searchTerm || 'Sin término de búsqueda'}</li>
        </ul>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Categoría</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Impacto</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Probabilidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Estado</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {riesgos.length > 0 ? (
            riesgos.map((riesgo) => (
              <tr key={riesgo.id_riesgo}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {riesgo.nombre}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {riesgo.categoria}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      riesgo.impacto === 'Crítico' ? '#ffebeb' : 
                      riesgo.impacto === 'Alto' ? '#fff4e5' : 
                      riesgo.impacto === 'Medio' ? '#fffde7' : '#e9f7ea',
                    color: 
                      riesgo.impacto === 'Crítico' ? '#c41e1e' : 
                      riesgo.impacto === 'Alto' ? '#c76a15' : 
                      riesgo.impacto === 'Medio' ? '#a68a00' : '#1e8f2d'
                  }}>
                    {riesgo.impacto}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {riesgo.probabilidad}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Badge variant="outline" className={getStatusColor(riesgo.estado)}>
                    {riesgo.estado}
                  </Badge>
                  {isAdmin && (
                    <Select 
                      value={riesgo.estado} 
                      onValueChange={(value) => handleChangeRiskState(riesgo.id_riesgo, value)}
                    >
                      <SelectTrigger className="h-7 px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Identificado">Identificado</SelectItem>
                        <SelectItem value="Planificado">Planificado</SelectItem>
                        <SelectItem value="Mitigado">Mitigado</SelectItem>
                        <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                        <SelectItem value="Reactivado">Reactivado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {riesgo.responsable?.nombre_completo || "Sin asignar"}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {riesgo.protocolo ? (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{riesgo.protocolo.titulo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-primary-blue">Sin protocolo</span>
                  )}
                </td>
                <td className="text-right" style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div className="flex justify-end gap-2">
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openDetailsModal(riesgo)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    {isAdmin && (
                      <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openMaterializeModal(riesgo)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Materializar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                No hay riesgos que mostrar con los filtros seleccionados.
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary-blue" />
          <p className="mt-2 text-primary-blue">Cargando riesgos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="riesgos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="riesgos">Gestión de Riesgos</TabsTrigger>
          <TabsTrigger value="materializaciones">Materializaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="riesgos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Riesgos Integrada</CardTitle>
                  <CardDescription>
                    Riesgos vinculados con protocolos de respuesta y usuarios responsables
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Riesgo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Registrar Nuevo Riesgo</DialogTitle>
                        <DialogDescription>
                          Complete la información y vincule con un protocolo de respuesta
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateRisk}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-name">Nombre del Riesgo</Label>
                              <Input
                                id="risk-name"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="risk-category">Categoría</Label>
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
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="risk-description">Descripción</Label>
                            <Textarea
                              id="risk-description"
                              value={descripcion}
                              onChange={(e) => setDescripcion(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-impact">Impacto</Label>
                              <Select value={impacto} onValueChange={setImpacto}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar impacto" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Crítico">Crítico</SelectItem>
                                  <SelectItem value="Alto">Alto</SelectItem>
                                  <SelectItem value="Medio">Medio</SelectItem>
                                  <SelectItem value="Bajo">Bajo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="risk-probability">Probabilidad</Label>
                              <Select value={probabilidad} onValueChange={setProbabilidad}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar probabilidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Alta">Alta</SelectItem>
                                  <SelectItem value="Media">Media</SelectItem>
                                  <SelectItem value="Baja">Baja</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="risk-responsible">Responsable</Label>
                              <Select value={responsableId} onValueChange={setResponsableId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar responsable" />
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
                            <div className="space-y-2">
                              <Label htmlFor="risk-protocol">Protocolo de Respuesta</Label>
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
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="risk-mitigation">Medidas de Mitigación</Label>
                            <Textarea
                              id="risk-mitigation"
                              value={medidas}
                              onChange={(e) => setMedidas(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="border border-primary-blue text-white bg-primary-blue" type="submit" disabled={creatingRisk}>Guardar Riesgo</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 md:flex-row items-start">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-blue" />
                  <Input
                    placeholder="Buscar riesgos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      id="show-all"
                      checked={showAllWithoutSearch}
                      onChange={(e) => setShowAllWithoutSearch(e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <Label htmlFor="show-all" className="text-sm text-primary-blue">
                      Mostrar todos los riesgos
                    </Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary-blue" />
                    <span className="text-sm">Filtros:</span>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos los impactos</SelectItem>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="border border-primary-blue text-white bg-primary-blue" 
                    variant="outline"
                    onClick={handlePrintRiskList}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
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
                    <TableHead>Responsable</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        {searchTerm === "" 
                          ? "Ingrese un término de búsqueda para ver los riesgos" 
                          : "No se encontraron riesgos que coincidan con su búsqueda"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRisks.map((riesgo) => (
                      <TableRow key={riesgo.id_riesgo}>
                        <TableCell className="font-medium">{riesgo.nombre}</TableCell>
                        <TableCell>{riesgo.categoria}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getImpactColor(riesgo.impacto)}>
                            {riesgo.impacto}
                          </Badge>
                        </TableCell>
                        <TableCell>{riesgo.probabilidad}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(riesgo.estado)}>
                            {riesgo.estado}
                          </Badge>
                          {isAdmin && (
                            <Select 
                              value={riesgo.estado} 
                              onValueChange={(value) => handleChangeRiskState(riesgo.id_riesgo, value)}
                            >
                              <SelectTrigger className="h-7 px-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Identificado">Identificado</SelectItem>
                                <SelectItem value="Planificado">Planificado</SelectItem>
                                <SelectItem value="Mitigado">Mitigado</SelectItem>
                                <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                                <SelectItem value="Cerrado">Cerrado</SelectItem>
                                <SelectItem value="Reactivado">Reactivado</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{riesgo.responsable?.nombre_completo || "Sin asignar"}</TableCell>
                        <TableCell>
                          {riesgo.protocolo ? (
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{riesgo.protocolo.titulo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-primary-blue">Sin protocolo</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openDetailsModal(riesgo)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Button>
                            {isAdmin && (
                              <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openMaterializeModal(riesgo)}>
                                <Zap className="mr-2 h-4 w-4" />
                                Materializar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materializaciones">
          <Card>
            <CardHeader>
              <CardTitle>Materializaciones de Riesgos</CardTitle>
              <CardDescription>Registro de riesgos que se han materializado y las acciones tomadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materializaciones.map((materializacion) => (
                  <div
                    key={materializacion.id_materializacion}
                    className="flex items-center justify-between rounded-md border border-primary-blue p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          materializacion.severidad_real === "Crítica"
                            ? "bg-red-100"
                            : materializacion.severidad_real === "Alta"
                              ? "bg-amber-100"
                              : materializacion.severidad_real === "Media"
                                ? "bg-yellow-100"
                                : "bg-green-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            materializacion.severidad_real === "Crítica"
                              ? "text-red-600"
                              : materializacion.severidad_real === "Alta"
                                ? "text-amber-600"
                                : materializacion.severidad_real === "Media"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{materializacion.riesgo?.nombre}</p>
                        <p className="text-sm text-primary-blue">{materializacion.descripcion_evento}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={getImpactColor(materializacion.severidad_real)}>
                            {materializacion.severidad_real}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(materializacion.estado)}>
                            {materializacion.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(materializacion.fecha_materializacion)}</p>
                        <p className="text-xs text-primary-blue">
                          Por: {materializacion.usuario_reporta?.nombre_completo}
                        </p>
                      </div>
                      <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openMaterializationDetails(materializacion)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de materialización */}
      <Dialog open={materializeModalOpen} onOpenChange={setMaterializeModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Materializar Riesgo</DialogTitle>
            <DialogDescription>Registre que el riesgo "{selectedRisk?.nombre}" se ha materializado</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMaterializeRisk}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-description">Descripción del Evento</Label>
                <Textarea
                  id="event-description"
                  placeholder="Describa qué ocurrió exactamente..."
                  value={descripcionEvento}
                  onChange={(e) => setDescripcionEvento(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="real-severity">Severidad Real</Label>
                <Select value={severidadReal} onValueChange={setSeveridadReal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar severidad real" />
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
                <Label htmlFor="actions-taken">Acciones Tomadas (separadas por coma)</Label>
                <Textarea
                  id="actions-taken"
                  placeholder="ej: Evacuación, Contacto con emergencias, Activación de protocolo..."
                  value={accionesTomadas}
                  onChange={(e) => setAccionesTomadas(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialization-notes">Notas Adicionales</Label>
                <Textarea
                  id="materialization-notes"
                  placeholder="Información adicional relevante..."
                  value={notasMaterializacion}
                  onChange={(e) => setNotasMaterializacion(e.target.value)}
                />
              </div>
              {selectedRisk?.protocolo && (
                <div className="rounded-md border border-primary-blue p-3 bg-blue-50">
                  <h4 className="font-medium text-blue-900">Protocolo Automático</h4>
                  <p className="text-sm text-blue-700">
                    Se creará automáticamente un incidente con el protocolo: "{selectedRisk.protocolo.titulo}"
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setMaterializeModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="border border-primary-blue text-white bg-primary-blue" type="submit">Materializar Riesgo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de riesgo */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Riesgo</DialogTitle>
            <DialogDescription>Información completa y acciones de mitigación</DialogDescription>
          </DialogHeader>
          {selectedRisk && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Nombre del Riesgo</h4>
                  <p>{selectedRisk.nombre}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Categoría</h4>
                  <p>{selectedRisk.categoria}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Descripción</h4>
                <p className="text-sm">{selectedRisk.descripcion}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Impacto</h4>
                  <Badge variant="outline" className={getImpactColor(selectedRisk.impacto)}>
                    {selectedRisk.impacto}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Probabilidad</h4>
                  <p>{selectedRisk.probabilidad}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Estado</h4>
                  <Badge variant="outline" className={getStatusColor(selectedRisk.estado)}>
                    {selectedRisk.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Responsable</h4>
                <p>{selectedRisk.responsable?.nombre_completo || "Sin asignar"}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Medidas de Mitigación</h4>
                <p className="text-sm">{selectedRisk.medidas_mitigacion}</p>
              </div>
              {selectedRisk.protocolo && (
                <div>
                  <h4 className="mb-2 font-semibold">Protocolo Vinculado</h4>
                  <div className="rounded-md border border-primary-blue p-3">
                    <p className="font-medium">{selectedRisk.protocolo.titulo}</p>
                    <p className="text-sm text-primary-blue">{selectedRisk.protocolo.descripcion}</p>
                    <Badge variant="outline" className="mt-2">
                      {selectedRisk.protocolo.severidad}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Cerrar
            </Button>
            <Button 
              className="border border-primary-blue text-white bg-primary-blue" 
              variant="outline"
              onClick={() => selectedRisk && handlePrintRisk(selectedRisk)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {isAdmin && selectedRisk && (
              <>
                <Button className="border border-primary-blue text-white bg-primary-blue" onClick={() => openEditModal(selectedRisk)}>
                  Editar
                </Button>
                <Button className="border border-primary-blue text-white bg-primary-blue" onClick={() => openMaterializeModal(selectedRisk)}>
                  <Zap className="mr-2 h-4 w-4" />
                  Materializar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de materialización */}
      <Dialog open={materializationDetailsOpen} onOpenChange={setMaterializationDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Materialización</DialogTitle>
            <DialogDescription>Información completa del evento materializado</DialogDescription>
          </DialogHeader>
          {selectedMaterialization && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Riesgo</h4>
                  <p>{selectedMaterialization.riesgo?.nombre}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Fecha</h4>
                  <p>{formatDate(selectedMaterialization.fecha_materializacion)}</p>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Descripción del Evento</h4>
                <p className="text-sm">{selectedMaterialization.descripcion_evento}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 font-semibold">Severidad Real</h4>
                  <Badge variant="outline" className={getImpactColor(selectedMaterialization.severidad_real)}>
                    {selectedMaterialization.severidad_real}
                  </Badge>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Estado</h4>
                  <Badge variant="outline" className={getStatusColor(selectedMaterialization.estado)}>
                    {selectedMaterialization.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Acciones Tomadas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterialization.acciones_tomadas.map((accion, index) => (
                    <Badge key={index} variant="outline">
                      {accion}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Reportado por</h4>
                <p>{selectedMaterialization.usuario_reporta?.nombre_completo}</p>
              </div>
              {selectedMaterialization.incidente_generado && (
                <div>
                  <h4 className="mb-2 font-semibold">Incidente Generado</h4>
                  <div className="rounded-md border border-primary-blue p-3">
                    <p className="font-medium">{selectedMaterialization.incidente_generado.titulo}</p>
                    <p className="text-sm text-primary-blue">
                      Estado: {selectedMaterialization.incidente_generado.estado}
                    </p>
                  </div>
                </div>
              )}
              {selectedMaterialization.notas && (
                <div>
                  <h4 className="mb-2 font-semibold">Notas</h4>
                  <p className="text-sm">{selectedMaterialization.notas}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" onClick={() => setMaterializationDetailsOpen(false)}>
              Cerrar
            </Button>
            {isAdmin && selectedMaterialization?.incidente_generado && (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Ver Incidente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición de riesgo */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Riesgo</DialogTitle>
            <DialogDescription>Actualice la información no fundamental del riesgo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRisk}>
            <div className="grid gap-4 py-4">
              {selectedRisk && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Nombre del Riesgo</h4>
                      <p className="text-sm text-gray-500">{selectedRisk.nombre}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold">Categoría</h4>
                      <p className="text-sm text-gray-500">{selectedRisk.categoria}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Descripción</h4>
                    <p className="text-sm text-gray-500">{selectedRisk.descripcion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Impacto</h4>
                      <p className="text-sm text-gray-500">{selectedRisk.impacto}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-semibold">Probabilidad</h4>
                      <p className="text-sm text-gray-500">{selectedRisk.probabilidad}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="risk-state">Estado del Riesgo</Label>
                <Select value={editEstado} onValueChange={setEditEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identificado">Identificado</SelectItem>
                    <SelectItem value="Planificado">Planificado</SelectItem>
                    <SelectItem value="Mitigado">Mitigado</SelectItem>
                    <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                    <SelectItem value="Reactivado">Reactivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk-responsible">Responsable</Label>
                  <Select value={editResponsableId} onValueChange={setEditResponsableId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
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
                <div className="space-y-2">
                  <Label htmlFor="risk-protocol">Protocolo de Respuesta</Label>
                  <Select value={editProtocoloId} onValueChange={setEditProtocoloId}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-mitigation">Medidas de Mitigación</Label>
                <Textarea
                  id="risk-mitigation"
                  value={editMedidas}
                  onChange={(e) => setEditMedidas(e.target.value)}
                />
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
                disabled={updatingRisk}
              >
                {updatingRisk ? "Actualizando..." : "Actualizar Riesgo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Componentes ocultos para el PDF */}
      {selectedRisk && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <RiskPDFContent riesgo={selectedRisk} />
        </div>
      )}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <RiskListPDFContent riesgos={filteredRisks} />
      </div>
    </div>
  )
}
