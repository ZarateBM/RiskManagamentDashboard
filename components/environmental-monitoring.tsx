"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Battery,
  Calendar,
  Check,
  Droplets,
  Download,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react"

export default function EnvironmentalMonitoring() {
  const [timeRange, setTimeRange] = useState("24h")

  // Datos simulados para las gráficas
  const temperatureData = [
    { time: "00:00", value: 21.5 },
    { time: "02:00", value: 21.2 },
    { time: "04:00", value: 20.8 },
    { time: "06:00", value: 20.5 },
    { time: "08:00", value: 21.0 },
    { time: "10:00", value: 22.3 },
    { time: "12:00", value: 23.1 },
    { time: "14:00", value: 23.5 },
    { time: "16:00", value: 23.2 },
    { time: "18:00", value: 22.8 },
    { time: "20:00", value: 22.5 },
    { time: "22:00", value: 22.0 },
    { time: "00:00", value: 21.7 },
  ]

  const humidityData = [
    { time: "00:00", value: 55 },
    { time: "02:00", value: 56 },
    { time: "04:00", value: 58 },
    { time: "06:00", value: 60 },
    { time: "08:00", value: 62 },
    { time: "10:00", value: 63 },
    { time: "12:00", value: 65 },
    { time: "14:00", value: 67 },
    { time: "16:00", value: 66 },
    { time: "18:00", value: 64 },
    { time: "20:00", value: 62 },
    { time: "22:00", value: 60 },
    { time: "00:00", value: 58 },
  ]

  const powerData = [
    { time: "00:00", value: 220 },
    { time: "02:00", value: 219 },
    { time: "04:00", value: 221 },
    { time: "06:00", value: 220 },
    { time: "08:00", value: 218 },
    { time: "10:00", value: 217 },
    { time: "12:00", value: 215 },
    { time: "14:00", value: 210 },
    { time: "16:00", value: 212 },
    { time: "18:00", value: 216 },
    { time: "20:00", value: 219 },
    { time: "22:00", value: 220 },
    { time: "00:00", value: 221 },
  ]

  // Función para renderizar una gráfica simple
  const renderChart = (
    data: { time: string; value: number }[],
    color: string,
    unit: string,
    min: number,
    max: number,
  ) => {
    const range = max - min

    return (
      <div className="h-[200px] w-full">
        <div className="flex h-full items-end">
          {data.map((point, index) => {
            const height = ((point.value - min) / range) * 100

            return (
              <div key={index} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                  {point.value}
                  {unit}
                </div>
                <div className={`w-full max-w-[20px] rounded-t ${color}`} style={{ height: `${height}%` }}></div>
                <div className="mt-2 text-[8px] text-primary-blue sm:text-xs">{point.time}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monitoreo Ambiental</h2>
          <p className="text-primary-blue">
            Seguimiento en tiempo real de las condiciones ambientales del cuarto de comunicaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Últimas 24 horas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Últimas 6 horas</SelectItem>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base">Temperatura</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Normal
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">22.5°C</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowDown className="h-4 w-4" />
                  <span>0.3°C desde ayer</span>
                </div>
              </div>
              <div className="rounded-md border border-primary-blue p-2 text-center">
                <div className="text-xs text-primary-blue">Rango óptimo</div>
                <div className="text-sm font-medium">18°C - 24°C</div>
              </div>
            </div>
            {renderChart(temperatureData, "bg-orange-500", "°C", 18, 26)}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex w-full justify-between text-xs text-primary-blue">
              <span>Mínima: 20.5°C</span>
              <span>Promedio: 22.1°C</span>
              <span>Máxima: 23.5°C</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">Humedad</CardTitle>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                Elevada
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">65%</div>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <ArrowUp className="h-4 w-4" />
                  <span>5% desde ayer</span>
                </div>
              </div>
              <div className="rounded-md border border-primary-blue p-2 text-center">
                <div className="text-xs text-primary-blue">Rango óptimo</div>
                <div className="text-sm font-medium">40% - 60%</div>
              </div>
            </div>
            {renderChart(humidityData, "bg-blue-500", "%", 40, 70)}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex w-full justify-between text-xs text-primary-blue">
              <span>Mínima: 55%</span>
              <span>Promedio: 62%</span>
              <span>Máxima: 67%</span>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-base">Energía</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Estable
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">220V</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Dentro del rango</span>
                </div>
              </div>
              <div className="rounded-md border border-primary-blue p-2 text-center">
                <div className="text-xs text-primary-blue">UPS</div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Battery className="h-4 w-4 text-green-500" />
                  <span>100%</span>
                </div>
              </div>
            </div>
            {renderChart(powerData, "bg-yellow-500", "V", 200, 230)}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex w-full justify-between text-xs text-primary-blue">
              <span>Mínima: 210V</span>
              <span>Promedio: 218V</span>
              <span>Máxima: 221V</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Alertas Ambientales</CardTitle>
          <CardDescription>Registro de alertas detectadas por los sensores</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="temperature">Temperatura</TabsTrigger>
              <TabsTrigger value="humidity">Humedad</TabsTrigger>
              <TabsTrigger value="power">Energía</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Humedad elevada</p>
                      <p className="text-sm text-primary-blue">La humedad superó el 65% durante más de 3 horas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">20/03/2025</p>
                    <p className="text-xs text-primary-blue">10:30 AM</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Fluctuación de energía</p>
                      <p className="text-sm text-primary-blue">Caída de voltaje detectada, UPS activado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">15/03/2025</p>
                    <p className="text-xs text-primary-blue">22:10 PM</p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Temperatura elevada</p>
                      <p className="text-sm text-primary-blue">La temperatura superó los 24°C durante 1 hora</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">10/03/2025</p>
                    <p className="text-xs text-primary-blue">14:45 PM</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="temperature" className="space-y-4">
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Temperatura elevada</p>
                      <p className="text-sm text-primary-blue">La temperatura superó los 24°C durante 1 hora</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">10/03/2025</p>
                    <p className="text-xs text-primary-blue">14:45 PM</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="humidity" className="space-y-4">
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Humedad elevada</p>
                      <p className="text-sm text-primary-blue">La humedad superó el 65% durante más de 3 horas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">20/03/2025</p>
                    <p className="text-xs text-primary-blue">10:30 AM</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="power" className="space-y-4">
              <div className="rounded-md border border-primary-blue p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Fluctuación de energía</p>
                      <p className="text-sm text-primary-blue">Caída de voltaje detectada, UPS activado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">15/03/2025</p>
                    <p className="text-xs text-primary-blue">22:10 PM</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
            Ver historial completo
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Alertas</CardTitle>
            <CardDescription>Umbrales para la generación de alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Temperatura</p>
                  <p className="text-sm text-primary-blue">Alerta cuando esté fuera de rango</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">18°C - 24°C</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Humedad</p>
                  <p className="text-sm text-primary-blue">Alerta cuando esté fuera de rango</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">40% - 60%</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Voltaje</p>
                  <p className="text-sm text-primary-blue">Alerta cuando esté fuera de rango</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">210V - 230V</p>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Activo
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" >
              Configurar Alertas
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Sensores</CardTitle>
            <CardDescription>Monitoreo de dispositivos de medición</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Sensor de Temperatura #1</p>
                  <p className="text-sm text-primary-blue">Ubicación: Rack Principal</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Operativo
                </Badge>
                <p className="text-xs text-primary-blue">Última calibración: 01/01/2025</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Sensor de Humedad #1</p>
                  <p className="text-sm text-primary-blue">Ubicación: Rack Principal</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Operativo
                </Badge>
                <p className="text-xs text-primary-blue">Última calibración: 01/01/2025</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Detector de Inundación</p>
                  <p className="text-sm text-primary-blue">Ubicación: Piso del cuarto</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Operativo
                </Badge>
                <p className="text-xs text-primary-blue">Última prueba: 15/02/2025</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-primary-blue p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Monitor de Energía</p>
                  <p className="text-sm text-primary-blue">Ubicación: Panel eléctrico</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Operativo
                </Badge>
                <p className="text-xs text-primary-blue">Última prueba: 10/03/2025</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
              Programar Mantenimiento
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
