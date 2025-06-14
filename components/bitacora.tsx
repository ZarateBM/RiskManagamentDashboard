"use client"

import { useState, useEffect, useRef } from "react"
import { supabase, type Bitacora as BitacoraType, type Usuario } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BookText, PlusCircle, Search, FileDown } from "lucide-react"
import toPDF from 'react-to-pdf';

export default function Bitacora() {
  const [entradas, setEntradas] = useState<BitacoraType[]>([])
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [nuevaEntrada, setNuevaEntrada] = useState({
    descripcion: "",
    severidad: "Informativo" as BitacoraType["severidad"],
  })
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    severidad: "todas",
    fecha: "",
  })
  
  // Referencia para el PDF
  const pdfRef = useRef(null);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData))
    }
    fetchEntradas()
  }, [])

  const fetchEntradas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("bitacora")
        .select("*, usuario:usuarios(nombre_completo)")
        .order("fecha_hora", { ascending: false })

      if (filtros.tipo !== "todos") {
        query = query.eq("tipo_evento", filtros.tipo)
      }
      if (filtros.severidad !== "todas") {
        query = query.eq("severidad", filtros.severidad)
      }
      if (filtros.fecha) {
        query = query.gte("fecha_hora", `${filtros.fecha}T00:00:00Z`).lte("fecha_hora", `${filtros.fecha}T23:59:59Z`)
      }

      const { data, error } = await query
      if (error) throw error
      setEntradas(data || [])
    } catch (error) {
      console.error("Error cargando la bitácora:", error)
      alert("No se pudo cargar la bitácora.")
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarEntrada = async () => {
    if (!usuario || usuario.rol !== "ADMINISTRADOR") {
      alert("No tienes permiso para realizar esta acción.")
      return
    }
    if (!nuevaEntrada.descripcion.trim()) {
      alert("La descripción no puede estar vacía.")
      return
    }

    try {
      const { error } = await supabase.from("bitacora").insert({
        descripcion: nuevaEntrada.descripcion,
        severidad: nuevaEntrada.severidad,
        tipo_evento: "Manual",
        usuario_id: usuario.id_usuario,
      })
      if (error) throw error
      alert("Entrada agregada correctamente.")
      setNuevaEntrada({ descripcion: "", severidad: "Informativo" })
      fetchEntradas() // Recargar
    } catch (error) {
      console.error("Error agregando entrada:", error)
      alert("No se pudo agregar la entrada.")
    }
  }

  const getSeverityBadge = (severity: BitacoraType["severidad"]) => {
    switch (severity) {
      case "Crítico":
        return "destructive"
      case "Advertencia":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Función para exportar a PDF
  const handleExportPDF = () => {
    const options = {
      filename: `bitacora_${new Date().toISOString().split('T')[0]}.pdf`,
      page: { margin: 10 }
    };
    
    if (pdfRef.current) {
      toPDF(pdfRef, options);
    }
  };

  // Componente para el contenido del PDF
  const PDFContent = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }} ref={pdfRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#004080' }}>Bitácora de Novedades</h1>
        <p>Sistema de Gestión de Riesgos - Fecha: {new Date().toLocaleDateString()}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Filtros aplicados:</h3>
        <ul>
          <li>Tipo de evento: {filtros.tipo === 'todos' ? 'Todos' : filtros.tipo}</li>
          <li>Severidad: {filtros.severidad === 'todas' ? 'Todas' : filtros.severidad}</li>
          <li>Fecha: {filtros.fecha || 'Sin filtro de fecha'}</li>
        </ul>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha y Hora</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Tipo</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Severidad</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descripción</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {entradas.length > 0 ? (
            entradas.map((entrada) => (
              <tr key={entrada.id_entrada}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(entrada.fecha_hora).toLocaleString()}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {entrada.tipo_evento}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: entrada.severidad === 'Crítico' ? '#ffebeb' : 
                                    entrada.severidad === 'Advertencia' ? '#fff4e5' : '#e9f7ea',
                    color: entrada.severidad === 'Crítico' ? '#c41e1e' : 
                          entrada.severidad === 'Advertencia' ? '#c76a15' : '#1e8f2d'
                  }}>
                    {entrada.severidad}
                  </span>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{entrada.descripcion}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {entrada.usuario?.nombre_completo || "Sistema"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                No hay entradas que mostrar.
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-primary-blue">
            <BookText className="h-6 w-6 text-primary-blue" />
            Bitácora de Novedades
          </CardTitle>
          <Button className="border border-primary-blue text-white bg-primary-blue"  variant="outline" onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
        <CardDescription>Registro centralizado de todos los eventos importantes del sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Tipo de Evento</label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Seguridad">Seguridad</SelectItem>
                  <SelectItem value="Operación">Operación</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Severidad</label>
              <Select value={filtros.severidad} onValueChange={(value) => setFiltros({ ...filtros, severidad: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Informativo">Informativo</SelectItem>
                  <SelectItem value="Advertencia">Advertencia</SelectItem>
                  <SelectItem value="Crítico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
              />
            </div>
            <Button className="border border-primary-blue text-white bg-primary-blue"  onClick={fetchEntradas}>
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>

          {/* Agregar Nueva Entrada (Solo Admins) */}
          {usuario?.rol === "ADMINISTRADOR" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Agregar Entrada Manual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Describe el evento o la novedad..."
                    value={nuevaEntrada.descripcion}
                    onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    value={nuevaEntrada.severidad}
                    onValueChange={(value) =>
                      setNuevaEntrada({ ...nuevaEntrada, severidad: value as BitacoraType["severidad"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Informativo">Informativo</SelectItem>
                      <SelectItem value="Advertencia">Advertencia</SelectItem>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="border border-primary-blue text-white bg-primary-blue w-full" onClick={handleAgregarEntrada}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Entrada
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Entradas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : entradas.length > 0 ? (
                  entradas.map((entrada) => (
                    <TableRow key={entrada.id_entrada}>
                      <TableCell>{new Date(entrada.fecha_hora).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entrada.tipo_evento}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadge(entrada.severidad)}>{entrada.severidad}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">{entrada.descripcion}</TableCell>
                      <TableCell>{entrada.usuario?.nombre_completo || "Sistema"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay entradas que mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      
      {/* Componente oculto para el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PDFContent />
    </div>

    </Card>
  )
}
