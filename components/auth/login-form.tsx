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

export default function LoginForm() {
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Verificar credenciales en la base de datos
      const { data: usuario, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("contraseña", contraseña) // En un entorno real, nunca debes almacenar contraseñas en texto plano
        .eq("activo", true)
        .single()

      if (dbError || !usuario) {
        setError("Credenciales inválidas")
        setLoading(false)
        return
      }

      // Actualizar último acceso
      await supabase
        .from("usuarios")
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq("id_usuario", usuario.id_usuario)

      // Guardar sesión en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario))

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error en login:", error)
      setError("Error al iniciar sesión")
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <strong>Admin:</strong> admin@empresa.com
              </p>
              <p>
                <strong>Editor:</strong> juan.perez@empresa.com
              </p>
              <p>
                <strong>Lector:</strong> carlos.rodriguez@empresa.com
              </p>
              <p className="text-gray-500 mt-2">Contraseña: cualquier texto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
