"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell, Server, LogOut, FileText, Users, BookOpen } from "lucide-react"
import { supabase, type Usuario } from "@/lib/supabase"
import RiskManagementIntegrated from "@/components/risk-management-integrated"
import IncidentTrackingIntegrated from "@/components/incident-tracking-integrated"
import ProtocolsProcedures from "@/components/protocols-procedures"
import UserManagement from "@/components/user-management"

export default function DashboardIntegrated() {
  const [activeTab, setActiveTab] = useState("overview")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [stats, setStats] = useState({
    riesgosActivos: 0,
    incidentesAbiertos: 0,
    protocolosDisponibles: 0,
    usuariosActivos: 0,
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/")
      return
    }

    const user = JSON.parse(usuarioData)
    setUsuario(user)
    cargarEstadisticas()
  }, [router])

  const cargarEstadisticas = async () => {
    try {
      // Contar riesgos activos
      const { count: riesgosCount } = await supabase
        .from("riesgos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Activo")

      // Contar incidentes abiertos
      const { count: incidentesCount } = await supabase
        .from("incidentes")
        .select("*", { count: "exact", head: true })
        .in("estado", ["Pendiente", "En proceso"])

      // Contar protocolos disponibles
      const { count: protocolosCount } = await supabase
        .from("protocolos")
        .select("*", { count: "exact", head: true })
        .eq("activo", true)

      // Contar usuarios activos
      const { count: usuariosCount } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("activo", true)

      setStats({
        riesgosActivos: riesgosCount || 0,
        incidentesAbiertos: incidentesCount || 0,
        protocolosDisponibles: protocolosCount || 0,
        usuariosActivos: usuariosCount || 0,
      })
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    router.push("/")
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Server className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-semibold text-primary-blue">
            <Server className="h-6 w-6" />
            <span>Sistema de Gestión de Riesgos</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bienvenido,</span>
              <span className="font-medium">{usuario.nombre_completo}</span>
              <Badge variant="outline">{usuario.rol}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="risks">Gestión de Riesgos</TabsTrigger>
              <TabsTrigger value="incidents">Seguimiento de Incidentes</TabsTrigger>
              <TabsTrigger value="protocols">Protocolos</TabsTrigger>
              {usuario.rol === "ADMINISTRADOR" && <TabsTrigger value="users">Usuarios</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Riesgos Activos</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.riesgosActivos}</div>
                    <p className="text-xs text-muted-foreground">Requieren atención</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incidentes Abiertos</CardTitle>
                    <FileText className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.incidentesAbiertos}</div>
                    <p className="text-xs text-muted-foreground">En proceso o pendientes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Protocolos</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.protocolosDisponibles}</div>
                    <p className="text-xs text-muted-foreground">Disponibles para uso</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.usuariosActivos}</div>
                    <p className="text-xs text-muted-foreground">En el sistema</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bienvenido al Sistema Integrado</CardTitle>
                  <CardDescription>Sistema completo de gestión de riesgos con protocolos vinculados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="font-medium">Funcionalidades Principales:</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Gestión de riesgos vinculados a protocolos</li>
                          <li>• Seguimiento de incidentes con ejecución de protocolos</li>
                          <li>• Protocolos paso a paso con seguimiento de progreso</li>
                          <li>• Sistema de usuarios con roles y permisos</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Flujo de Trabajo:</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>1. Identificar y registrar riesgos</li>
                          <li>2. Vincular protocolos de respuesta</li>
                          <li>3. Reportar incidentes relacionados</li>
                          <li>4. Ejecutar protocolos automáticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks">
              <RiskManagementIntegrated />
            </TabsContent>

            <TabsContent value="incidents">
              <IncidentTrackingIntegrated />
            </TabsContent>

            <TabsContent value="protocols">
              <ProtocolsProcedures />
            </TabsContent>

            {usuario.rol === "ADMINISTRADOR" && (
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
