"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isLoading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }
  useEffect(() => {
    router.push("/dashboard")
  }, [])
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gray-50">
      <header className="flex h-20 items-center px-4 bg-primary-blue shadow-md">
          <img src="/firma-tipografica-ucr.svg" alt="Logo UCR" className="h-10 " />
      </header>
      <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md shadow-lg space-y-4">
          <form onSubmit={handleSubmit} >
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl font-bold">Iniciar sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 ">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-normal">Correo electrónico</Label>
                <Input
                  className="text-sm font-normal"
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button variant="link" className="p-0 h-auto text-sm font-normal" type="button" aria-label="Olvidaste tu contraseña?">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal m' cursor-pointer">
                  Recordarme
                </Label>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary-button text-slate-50" type="submit" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="flex items-center justify-between border-t h-20 p-4 bg-gray">
        <div className="flex items-center gap-2">
          <img src="firma-tipografica-ucr.svg" alt="Logo UCR" className="h-8" />
          <h6 className="text-sm text-white">Sistema de Gestión de Riesgos - Cuarto de Comunicaciones</h6>
        </div>
      </footer>
    </div>
  )
}
