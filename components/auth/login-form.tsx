"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Logger from "@/lib/logger"

export default function LoginForm() {
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Función asíncrona para enviar notificación de inicio de sesión
  const enviarNotificacionLogin = async (nombre: string, email: string) => {
    try {
      const emailResponse = await fetch('/api/email/send-login-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: nombre,
          userEmail: email,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Error al enviar notificación de inicio de sesión');
      }
    } catch (emailError) {
      console.error('Error en la petición de envío de correo de inicio de sesión:', emailError);
      // No interrumpimos el flujo de login si falla el envío de correo
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      Logger.operacion("Intento de inicio de sesión", "Informativo")
      // Verificar credenciales en la base de datos
      const { data: usuario, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("contraseña", contraseña) 
        .eq("activo", true)
        .single()

      if (dbError || !usuario) {
        Logger.seguridad("Credenciales inválidas o usuario no encontrado", "Crítico")
        setError("Credenciales inválidas")
        setContraseña("") // Limpiar el campo de contraseña cuando las credenciales son inválidas
        setLoading(false)
        return
      }
      Logger.operacion(`Usuario ${usuario.nombre_completo} ha iniciado sesión`, "Informativo", usuario.id_usuario)

      // Actualizar último acceso
      await supabase
        .from("usuarios")
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq("id_usuario", usuario.id_usuario)

      // Guardar sesión en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario))

      // Enviar notificación de inicio de sesión (llamada a la función asíncrona)
      enviarNotificacionLogin(usuario.nombre_completo, usuario.correo);

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      Logger.seguridad("Error al iniciar sesión", "Crítico")
      console.error("Error en login:", error)
      setError("Error al iniciar sesión")
      setContraseña("") // Limpiar el campo de contraseña en caso de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Server className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sistema de Gestión de Riesgos</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="usuario@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <div className="relative">
                <Input
                  id="contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="border border-primary-blue text-white bg-primary-blue" type="submit" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
