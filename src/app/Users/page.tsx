"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUsers } from "@/hooks/useGetUser"
import { useCreateUser } from "@/hooks/useCreateUser"
import { Plus } from "lucide-react"

interface Usuario {
  idUsuario: number
  nombreCompleto: string
  correo: string
  rol: string
}

export default function Users() {
  const { users: usuarios, loading } = useUsers()
  const { createUser } = useCreateUser()
  const [modalOpen, setModalOpen] = useState(false)

  // Campos para nuevo usuario
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [contador, setContador] = useState(0)
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [rol, setRol] = useState("LECTOR")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto || !correo || !contraseña) {
      alert("Por favor completa todos los campos")
      return
    }
    try {
      await createUser({
        nombreCompleto,
        correo,
        contraseña,
        rol
      })
      alert("Usuario creado exitosamente")
      setModalOpen(false)
      // Reset fields
      setNombreCompleto("")
      setCorreo("")
      setContraseña("")
      setRol("LECTOR")
      window.location.reload()
    }catch (error) {
      console.error("Error al crear usuario:", error)
      alert("Error al crear usuario")
      setModalOpen(false)
    }
  }
    
  

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-screen">
      <Card className="col-span-full">
         {
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
            <p>Bienvenido a la gestión de usuarios</p>
            <button
              className="text-blue-500 underline"
              onClick={() => {
                setContador(contador + 1)
              }
            }
            >
              aumenta contador
            </button>
            <p>{contador}</p>
          </div>
        }
        <div className="flex flex-row items-center justify-between mb-4"></div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administra los usuarios registrados</CardDescription>
          </div>
          <Plus
            onClick={() => setModalOpen(true)}
            className="h-5 w-5 transition-transform duration-200 hover:scale-125 text-blue-500"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <table className="min-w-full border border-gray-200 mt-4">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Correo</th>
                  <th className="px-4 py-2">Rol</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u: Usuario) => (
                  <tr key={u.idUsuario} className="border-b border-gray-200">
                    <td className="px-4 py-2">{u.nombreCompleto}</td>
                    <td className="px-4 py-2">{u.correo}</td>
                    <td className="px-4 py-2">{u.rol}</td>
                    <td className="px-4 py-2">
                      <Button variant="outline" className="mr-2">
                        Editar
                      </Button>
                      <Button variant="destructive">Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="modal bg-white p-4 border rounded shadow-lg fixed inset-0 m-auto w-1/2 h-1/2 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Nombre Completo</label>
              <input
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="border px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="border px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Contraseña</label>
              <input
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="border px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="border px-2 py-1 w-full"
              >
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="EDITOR">EDITOR</option>
                <option value="LECTOR">LECTOR</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}