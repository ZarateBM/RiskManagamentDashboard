"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell, Droplets, FileText, Lock, Server, Shield, Thermometer, Waves, Zap } from "lucide-react"
import RiskManagement from "@/components/risk-management"
import IncidentTracking from "@/components/incident-tracking"
import EnvironmentalMonitoring from "@/components/environmental-monitoring"
import ReportsAnalytics from "@/components/reports-analytics"
import ProtocolsProcedures from "@/components/protocols-procedures"
import UserManagement from "@/components/user-management"

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Server className="h-6 w-6" />
            <span>Sistema de Gestión de Riesgos - Cuarto de Comunicaciones</span>
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
              <TabsTrigger value="monitoring">Monitoreo Ambiental</TabsTrigger>
              <TabsTrigger value="reports">Reportes y Análisis</TabsTrigger>
              <TabsTrigger value="protocols">Protocolos</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Riesgos Activos</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">3 críticos, 5 altos, 4 medios</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incidentes Abiertos</CardTitle>
                    <FileText className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">2 en proceso, 2 pendientes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                    <Thermometer className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">22.5°C</div>
                    <p className="text-xs text-muted-foreground">Dentro del rango óptimo</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Humedad</CardTitle>
                    <Droplets className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">65%</div>
                    <p className="text-xs text-muted-foreground">Ligeramente elevada</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Resumen de Riesgos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Waves className="mr-2 h-5 w-5 text-blue-500" />
                          <span>Ambientales</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-red-100">
                            2 Críticos
                          </Badge>
                          <Badge variant="outline" className="bg-amber-100">
                            1 Alto
                          </Badge>
                          <Badge variant="outline" className="bg-green-100">
                            1 Medio
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lock className="mr-2 h-5 w-5 text-purple-500" />
                          <span>Seguridad Física</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-red-100">
                            0 Críticos
                          </Badge>
                          <Badge variant="outline" className="bg-amber-100">
                            2 Altos
                          </Badge>
                          <Badge variant="outline" className="bg-green-100">
                            1 Medio
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Server className="mr-2 h-5 w-5 text-orange-500" />
                          <span>Operativos</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-red-100">
                            1 Crítico
                          </Badge>
                          <Badge variant="outline" className="bg-amber-100">
                            1 Alto
                          </Badge>
                          <Badge variant="outline" className="bg-green-100">
                            1 Medio
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-green-500" />
                          <span>Digitales</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-red-100">
                            0 Críticos
                          </Badge>
                          <Badge variant="outline" className="bg-amber-100">
                            1 Alto
                          </Badge>
                          <Badge variant="outline" className="bg-green-100">
                            1 Medio
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Alertas Recientes</CardTitle>
                    <CardDescription>Últimas 24 horas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="border-amber-500">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="ml-2">Humedad elevada</AlertTitle>
                        <AlertDescription className="ml-6">
                          La humedad ha superado el 60% durante las últimas 3 horas.
                        </AlertDescription>
                      </Alert>
                      <Alert className="border-red-500">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="ml-2">Intento de acceso no autorizado</AlertTitle>
                        <AlertDescription className="ml-6">
                          Se detectó un intento de acceso con credenciales inválidas.
                        </AlertDescription>
                      </Alert>
                      <Alert className="border-green-500">
                        <Zap className="h-4 w-4 text-green-500" />
                        <AlertTitle className="ml-2">UPS activado</AlertTitle>
                        <AlertDescription className="ml-6">
                          Fluctuación de energía detectada, UPS funcionando correctamente.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Próximas Acciones</CardTitle>
                    <CardDescription>Mantenimientos y revisiones programadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-primary-blue pb-2">
                        <div>
                          <p className="font-medium">Mantenimiento preventivo UPS</p>
                          <p className="text-sm text-muted-foreground">Responsable: Ing. Eléctrico</p>
                        </div>
                        <Badge>25/03/2025</Badge>
                      </div>
                      <div className="flex items-center justify-between border-b border-primary-blue pb-2">
                        <div>
                          <p className="font-medium">Revisión de sellos anti-humedad</p>
                          <p className="text-sm text-muted-foreground">Responsable: Mantenimiento</p>
                        </div>
                        <Badge>28/03/2025</Badge>
                      </div>
                      <div className="flex items-center justify-between border-b border-primary-blue pb-2">
                        <div>
                          <p className="font-medium">Actualización de firmware</p>
                          <p className="text-sm text-muted-foreground">Responsable: TI</p>
                        </div>
                        <Badge>02/04/2025</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Simulacro de contingencia</p>
                          <p className="text-sm text-muted-foreground">Responsable: Seguridad</p>
                        </div>
                        <Badge>10/04/2025</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Estadísticas de Incidentes</CardTitle>
                    <CardDescription>Últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <div className="flex h-[180px] w-full items-end gap-2">
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
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="risks">
              <RiskManagement />
            </TabsContent>
            <TabsContent value="incidents">
              <IncidentTracking />
            </TabsContent>
            <TabsContent value="monitoring">
              <EnvironmentalMonitoring />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsAnalytics />
            </TabsContent>
            <TabsContent value="protocols">
              <ProtocolsProcedures />
            </TabsContent>
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
