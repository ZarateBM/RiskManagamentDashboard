"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Bell,
  Droplets,
  FileText,
  Server,
  Thermometer,
  Waves,
  Zap,
  Plus
} from "lucide-react"

import {useRisk} from "@/hooks/useRisk"
import { useIncidents } from "@/hooks/useIncidents"

import RiskManagement from "@/components/risk-management"
import IncidentTracking from "@/components/incident-tracking"
import EnvironmentalMonitoring from "@/components/environmental-monitoring"
import ReportsAnalytics from "@/components/reports-analytics"
import ProtocolsProcedures from "@/components/protocols-procedures"

export default function DashboardOverview() {
  // —— Hooks —— 
  const {
    riskData,
    loading: loadingRisks,
    error: errorRisks,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    getFilteredRisks,
    getUniqueCategories,
  } = useRisk()

  const {
    incidents,
    loading: loadingIncidents,
    error: errorIncidents,
  } = useIncidents()

  const loading = loadingRisks || loadingIncidents
  const error   = errorRisks ?? errorIncidents

  // —— Sensor simulation —— 
  const [temperature, setTemperature] = useState(22.5)
  const [humidity, setHumidity]       = useState(65)
  useEffect(() => {
    const iv = setInterval(() => {
      setTemperature(prev => Math.min(30, Math.max(20, parseFloat((prev + (Math.random()-0.5)*0.1).toFixed(1)))))
      setHumidity(prev => Math.min(70, Math.max(60, parseFloat((prev + (Math.random()-0.5)*0.1).toFixed(1)))))
    }, 10000)
    return () => clearInterval(iv)
  }, [])

  // —— Métricas —— 
  const totalRisks    = useMemo(() => riskData.length, [riskData])
  const criticalRisks = useMemo(() => riskData.filter(r => r.impacto === "Crítico").length, [riskData])
  const highRisks     = useMemo(() => riskData.filter(r => r.impacto === "Alto").length, [riskData])
  const mediumRisks   = useMemo(() => riskData.filter(r => r.impacto === "Medio").length, [riskData])

  const openIncidents    = useMemo(() => incidents.filter(i => i.estadoIncidente === "Abierto").length, [incidents])
  const pendingIncidents = useMemo(() => incidents.filter(i => i.estadoIncidente === "Pendiente").length, [incidents])
  const closedIncidents  = useMemo(() => incidents.filter(i => i.estadoIncidente === "Cerrado").length, [incidents])

  // —— Expandibles —— 
  const [showRisks, setShowRisks]     = useState(false)
  const [showAlerts, setShowAlerts]   = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showStats, setShowStats]     = useState(false)

  // —— Tab activo —— 
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="grid grid-rows-[auto_1fr_auto] grid-areas-layout">
      {/* HEADER */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 bg-dark-blue">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Server className="h-6 w-6" />
            <h6>Sistema de Gestión de Riesgos - Cuarto de Comunicaciones</h6>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button className="text-white" variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" /> Notificaciones
            </Button>
          </div>
        </div>
      </div>

      {/* CUERPO */}
      <div className="grid flex-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="risks">Gestión de Riesgos</TabsTrigger>
              <TabsTrigger value="incidents">Seguimiento de Incidentes</TabsTrigger>
              <TabsTrigger value="reports">Reportes y Análisis</TabsTrigger>
              <TabsTrigger value="protocols">Protocolos</TabsTrigger>
            </TabsList>

            {/* — Overview — */}
            <TabsContent value="overview" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Métricas o skeleton */}
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-24 rounded-md" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Riesgos Activos */}
                  <Card>
                    <CardHeader className="flex justify-between items-center pb-2">
                      <CardTitle className="text-sm font-medium">Riesgos Activos</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalRisks}</div>
                      <p className="text-xs text-muted-foreground">
                        {criticalRisks} críticos, {highRisks} altos, {mediumRisks} medios
                      </p>
                    </CardContent>
                  </Card>

                  {/* Incidentes Abiertos */}
                  <Card>
                    <CardHeader className="flex justify-between items-center pb-2">
                      <CardTitle className="text-sm font-medium">Incidentes Abiertos</CardTitle>
                      <FileText className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{openIncidents}</div>
                      <p className="text-xs text-muted-foreground">
                        {pendingIncidents} en proceso, {pendingIncidents} pendientes
                      </p>
                    </CardContent>
                  </Card>

                  {/* Temperatura */}
                  <Card>
                    <CardHeader className="flex justify-between items-center pb-2">
                      <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                      <Thermometer className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{temperature}°C</div>
                      <p className="text-xs text-muted-foreground">Sensor - Puntarenas, CR</p>
                    </CardContent>
                  </Card>

                  {/* Humedad */}
                  <Card>
                    <CardHeader className="flex justify-between items-center pb-2">
                      <CardTitle className="text-sm font-medium">Humedad</CardTitle>
                      <Droplets className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{humidity}%</div>
                      <p className="text-xs text-muted-foreground">Sensor - Puntarenas, CR</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Resumen de categorías */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => setShowRisks(v => !v)}
                  >
                    <CardTitle>Resumen de Riesgos por Categoría</CardTitle>
                    <Plus className="h-5 w-5 transition-transform" style={{ transform: showRisks ? "rotate(45deg)" : "rotate(0deg)" }} />
                  </CardHeader>
                  {showRisks && (
                    <CardContent className="space-y-3">
                      {getUniqueCategories().map(cat => {
                        const arr = riskData.filter(r => r.categoria.nombre === cat)
                        const c = arr.filter(r => r.impacto==="Crítico").length
                        const h = arr.filter(r => r.impacto==="Alto").length
                        const m = arr.filter(r => r.impacto==="Medio").length
                        return (
                          <div key={cat} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Waves className="h-5 w-5 text-blue-500" />
                              <span>{cat}</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-red-100">{c} Críticos</Badge>
                              <Badge variant="outline" className="bg-amber-100">{h} Altos</Badge>
                              <Badge variant="outline" className="bg-green-100">{m} Medios</Badge>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  )}
                </Card>

                {/* Alertas Recientes */}
                <Card className="col-span-3">
                  <CardHeader
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => setShowAlerts(v => !v)}
                  >
                    <div>
                      <CardTitle>Alertas Recientes</CardTitle>
                      <CardDescription>Últimas 24 horas</CardDescription>
                    </div>
                    <Plus className="h-5 w-5 transition-transform" style={{ transform: showAlerts ? "rotate(45deg)" : "rotate(0deg)" }} />
                  </CardHeader>
                  {showAlerts && (
                    <CardContent className="space-y-2">
                      <Alert className="border-amber-500">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="ml-2">Humedad elevada</AlertTitle>
                        <AlertDescription className="ml-6">La humedad superó 60% 3h.</AlertDescription>
                      </Alert>
                      <Alert className="border-red-500">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="ml-2">Acceso no autorizado</AlertTitle>
                        <AlertDescription className="ml-6">Credenciales inválidas detectadas.</AlertDescription>
                      </Alert>
                      <Alert className="border-green-500">
                        <Zap className="h-4 w-4 text-green-500" />
                        <AlertTitle className="ml-2">UPS activado</AlertTitle>
                        <AlertDescription className="ml-6">UPS funcionando correctamente.</AlertDescription>
                      </Alert>
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Próximas Acciones */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => setShowActions(v => !v)}
                  >
                    <div>
                      <CardTitle>Próximas Acciones</CardTitle>
                      <CardDescription>Mantenimientos y revisiones programadas</CardDescription>
                    </div>
                    <Plus className="h-5 w-5 transition-transform" style={{ transform: showActions ? "rotate(45deg)" : "rotate(0deg)" }} />
                  </CardHeader>
                  {showActions && (
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">Mantenimiento preventivo UPS</p>
                          <p className="text-sm text-muted-foreground">Responsable: Ing. Eléctrico</p>
                        </div>
                        <Badge>25/03/2025</Badge>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">Revisión sellos anti-humedad</p>
                          <p className="text-sm text-muted-foreground">Responsable: Mantenimiento</p>
                        </div>
                        <Badge>28/03/2025</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Simulacro de contingencia</p>
                          <p className="text-sm text-muted-foreground">Responsable: Seguridad</p>
                        </div>
                        <Badge>10/04/2025</Badge>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Estadísticas de Incidentes */}
                <Card className="col-span-3">
                  <CardHeader
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => setShowStats(v => !v)}
                  >
                    <div>
                      <CardTitle>Estadísticas de Incidentes</CardTitle>
                      <CardDescription>Últimos 30 días</CardDescription>
                    </div>
                    <Plus className="h-5 w-5 transition-transform" style={{ transform: showStats ? "rotate(45deg)" : "rotate(0deg)" }} />
                  </CardHeader>
                  {showStats && (
                    <CardContent className="flex items-center justify-center">
                      <div className="flex h-[180px] w-full items-end gap-2">
                        {/* Aquí podrías mapear tus propias estadísticas */}
                        <div className="relative flex h-40 w-full flex-col items-center">
                          <div className="absolute bottom-0 h-[15%] w-6 rounded-t bg-green-500"></div>
                          <span className="mt-2 text-xs">Sem 1</span>
                        </div>
                        <div className="relative flex h-40 w-full flex-col items-center">
                          <div className="absolute bottom-0 h-[35%] w-6 rounded-t bg-amber-500"></div>
                          <span className="mt-2 text-xs">Sem 2</span>
                        </div>
                        <div className="relative flex h-40 w-full flex-col items-center">
                          <div className="absolute bottom-0 h-[25%] w-6 rounded-t bg-amber-500"></div>
                          <span className="mt-2 text-xs">Sem 3</span>
                        </div>
                        <div className="relative flex h-40 w-full flex-col items-center">
                          <div className="absolute bottom-0 h-[10%] w-6 rounded-t bg-green-500"></div>
                          <span className="mt-2 text-xs">Sem 4</span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </TabsContent>

            {/* — Gestión de Riesgos — */}
            <TabsContent value="risks">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Buscar riesgo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border px-2 py-1 rounded-md flex-1"
                />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="border px-2 py-1 rounded-md"
                >
                  <option>Todos</option>
                  {getUniqueCategories().map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <RiskManagement />
            </TabsContent>

            {/* — Seguimiento de Incidentes — */}
            <TabsContent value="incidents">
              <IncidentTracking />
            </TabsContent>

            <TabsContent value="monitoring"><EnvironmentalMonitoring/></TabsContent>
            <TabsContent value="reports"><ReportsAnalytics/></TabsContent>
            <TabsContent value="protocols"><ProtocolsProcedures/></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
