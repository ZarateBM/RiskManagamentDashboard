"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@/types/User"

type AuthContextType = {
  user: User | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("userData") || sessionStorage.getItem("userData")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      // Aquí deberías validar el usuario real desde una API
      const fakeUser: User = {
        id: "1",
        nombre: "Juan Pérez",
        correo: email,
        rol: "ADMINISTRADOR",
      }

      // Simular éxito
      if (email && password) {
        if (rememberMe) {
          localStorage.setItem("userData", JSON.stringify(fakeUser))
        } else {
          sessionStorage.setItem("userData", JSON.stringify(fakeUser))
        }
        setUser(fakeUser)
        router.push("/dashboard")
      } else {
        throw new Error("Credenciales inválidas")
      }
    } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("userData")
    sessionStorage.removeItem("userData")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return context
}
