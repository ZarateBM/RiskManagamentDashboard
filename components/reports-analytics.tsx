"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Calendar, Download, FileText, Printer, Share2 } from "lucide-react"

export default function ReportsAnalytics() {
  const [reportPeriod, setReportPeriod] = useState("month")

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reportes y Análisis</h2>
          <p className="text-primary-blue">Generación de informes y análisis de tendencias</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Este mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="risks">Riesgos</TabsTrigger>
          <TabsTrigger value="environmental">Ambiental</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Incidentes</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-primary-blue">+2 comparado con el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio Resolución</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5h</div>
                <p className="text-xs text-primary-blue">-1.2h comparado con el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgos Mitigados</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-primary-blue">+2 comparado con el período anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ambientales</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-primary-blue">-3 comparado con el período anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Tendencia de Incidentes</CardTitle>
                <CardDescription>Número de incidentes por semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex h-[250px] items-end gap-2 pb-6">
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[30%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 1</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[45%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 2</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[60%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 3</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[40%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 4</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-2">
                      <div className="h-[1px] w-full border-t border-border"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
                <CardDescription>Incidentes por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[250px] items-center justify-center">
                  <div className="relative h-40 w-40 rounded-full border-8 border-primary">
                    <div
                      className="absolute left-0 top-0 h-full w-full rounded-full border-8 border-l-transparent border-r-transparent border-t-transparent border-amber-500"
                      style={{ transform: "rotate(45deg)" }}
                    ></div>
                    <div
                      className="absolute left-0 top-0 h-full w-full rounded-full border-8 border-b-transparent border-l-transparent border-r-transparent border-green-500"
                      style={{ transform: "rotate(270deg)" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-2 flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-xs">Ambiental (50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs">Seguridad (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Operativo (25%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informes Disponibles</CardTitle>
              <CardDescription>Informes generados automáticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Informe Mensual de Incidentes</p>
                      <p className="text-sm text-primary-blue">Resumen de todos los incidentes del mes</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Análisis de Riesgos Trimestral</p>
                      <p className="text-sm text-primary-blue">Evaluación de riesgos y medidas de mitigación</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-primary-blue p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Reporte de Condiciones Ambientales</p>
                      <p className="text-sm text-primary-blue">Análisis de temperatura, humedad y energía</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="border border-primary-blue text-white bg-primary-blue">Generar Nuevo Informe</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Incidentes</CardTitle>
              <CardDescription>Estadísticas detalladas de incidentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tiempo de Resolución por Categoría</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ambiental</span>
                      <span className="text-sm font-medium">6.5h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[65%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Seguridad Física</span>
                      <span className="text-sm font-medium">4.2h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[42%] rounded-full bg-amber-500"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Operativo</span>
                      <span className="text-sm font-medium">12.8h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[85%] rounded-full bg-red-500"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Digital</span>
                      <span className="text-sm font-medium">8.3h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[55%] rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Incidentes por Severidad</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">2</div>
                    <div className="text-sm font-medium">Crítica</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-amber-500">5</div>
                    <div className="text-sm font-medium">Alta</div>
                  </div>
                  <div className="rounded-lg border  p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500">3</div>
                    <div className="text-sm font-medium">Media</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">2</div>
                    <div className="text-sm font-medium">Baja</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tendencia de Incidentes por Semana</h3>
                <div className="h-[250px]">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex h-[200px] items-end gap-2 pb-6">
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[30%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 1</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[45%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 2</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[60%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 3</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[40%] w-10 rounded-t bg-primary"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 4</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-2">
                      <div className="h-[1px] w-full border-t border-border"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Riesgos</CardTitle>
              <CardDescription>Estadísticas detalladas de riesgos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Distribución de Riesgos por Categoría</h3>
                <div className="flex h-[250px] items-center justify-center">
                  <div className="relative h-40 w-40 rounded-full border-8 border-primary">
                    <div
                      className="absolute left-0 top-0 h-full w-full rounded-full border-8 border-l-transparent border-r-transparent border-t-transparent border-amber-500"
                      style={{ transform: "rotate(120deg)" }}
                    ></div>
                    <div
                      className="absolute left-0 top-0 h-full w-full rounded-full border-8 border-b-transparent border-l-transparent border-t-transparent border-green-500"
                      style={{ transform: "rotate(300deg)" }}
                    ></div>
                  </div>
                </div>
                <div className="mt-2 flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-xs">Ambiental (40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs">Seguridad (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Operativo/Digital (30%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Riesgos por Nivel de Impacto</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">3</div>
                    <div className="text-sm font-medium">Crítico</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-amber-500">5</div>
                    <div className="text-sm font-medium">Alto</div>
                  </div>
                  <div className="rounded-lg border  p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500">4</div>
                    <div className="text-sm font-medium">Medio</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">2</div>
                    <div className="text-sm font-medium">Bajo</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Estado de Mitigación de Riesgos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
                    <div>
                      <p className="font-medium">Riesgos Mitigados</p>
                      <p className="text-sm text-primary-blue">Riesgos con medidas implementadas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">5</p>
                      <p className="text-sm text-green-600">36% del total</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
                    <div>
                      <p className="font-medium">Riesgos en Proceso</p>
                      <p className="text-sm text-primary-blue">Medidas en implementación</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">7</p>
                      <p className="text-sm text-amber-600">50% del total</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
                    <div>
                      <p className="font-medium">Riesgos Pendientes</p>
                      <p className="text-sm text-primary-blue">Sin medidas implementadas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">2</p>
                      <p className="text-sm text-red-600">14% del total</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Ambiental</CardTitle>
              <CardDescription>Estadísticas de condiciones ambientales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Temperatura Promedio por Semana</h3>
                <div className="h-[250px]">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex h-[200px] items-end gap-2 pb-6">
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[60%] w-10 rounded-t bg-orange-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 1</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[65%] w-10 rounded-t bg-orange-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 2</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[70%] w-10 rounded-t bg-orange-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 3</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[62%] w-10 rounded-t bg-orange-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 4</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-2">
                      <div className="h-[1px] w-full border-t border-border"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-primary-blue">
                  <span>Mínima: 20.5°C</span>
                  <span>Promedio: 22.1°C</span>
                  <span>Máxima: 23.5°C</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Humedad Promedio por Semana</h3>
                <div className="h-[250px]">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex h-[200px] items-end gap-2 pb-6">
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[55%] w-10 rounded-t bg-blue-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 1</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[60%] w-10 rounded-t bg-blue-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 2</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[65%] w-10 rounded-t bg-blue-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 3</span>
                      </div>
                      <div className="relative flex h-full w-full flex-col items-center">
                        <div className="absolute bottom-0 h-[62%] w-10 rounded-t bg-blue-500"></div>
                        <span className="absolute -bottom-6 text-xs">Sem 4</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-2">
                      <div className="h-[1px] w-full border-t border-border"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-primary-blue">
                  <span>Mínima: 55%</span>
                  <span>Promedio: 62%</span>
                  <span>Máxima: 67%</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alertas Ambientales por Tipo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">3</div>
                    <div className="text-sm font-medium">Temperatura</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">4</div>
                    <div className="text-sm font-medium">Humedad</div>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500">1</div>
                    <div className="text-sm font-medium">Energía</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
