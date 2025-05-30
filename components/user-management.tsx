"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Filter, Plus, Search, Trash2, User, UserCheck, Users } from "lucide-react"
import { supabase, type Usuario } from "@/lib/supabase"

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Campos para formulario
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [rol, setRol] = useState("LECTOR")

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem("usuario")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("activo", true)
        .order("fecha_creacion", { ascending: false })

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario actual es administrador
  const isAdmin = currentUser?.rol === "ADMINISTRADOR"

  // Filtrar usuarios según los criterios
  const filteredUsers = usuarios.filter((user: Usuario) => {
    const matchesSearch =
      user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "Todos" || user.rol === roleFilter

    return matchesSearch && matchesRole
  })

  // Función para obtener el color del badge según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMINISTRADOR":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "LECTOR":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Función para obtener el icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMINISTRADOR":
        return <UserCheck className="h-4 w-4 text-red-500" />
      case "LECTOR":
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto || !correo || !contraseña) {
      alert("Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("usuarios").insert([
        {
          nombre_completo: nombreCompleto,
          correo,
          contraseña, // En producción, esto debería estar hasheado
          rol,
          activo: true,
        },
      ])

      if (error) throw error

      setCreateModalOpen(false)
      resetForm()
      cargarUsuarios()
      alert("Usuario creado exitosamente")
    } catch (error) {
      console.error("Error creando usuario:", error)
      alert("Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !nombreCompleto || !correo) {
      alert("Por favor completa todos los campos")
      return
    }

    setLoading(true)

    try {
      const updateData: any = {
        nombre_completo: nombreCompleto,
        correo,
        rol,
      }

      // Solo actualizar contraseña si se proporcionó una nueva
      if (contraseña) {
        updateData.contraseña = contraseña
      }

      const { error } = await supabase.from("usuarios").update(updateData).eq("id_usuario", selectedUser.id_usuario)

      if (error) throw error

      setEditModalOpen(false)
      resetForm()
      setSelectedUser(null)
      cargarUsuarios()
      alert("Usuario actualizado exitosamente")
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      alert("Error al actualizar usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    setLoading(true)

    try {
      const { error } = await supabase.from("usuarios").update({ activo: false }).eq("id_usuario", userId)

      if (error) throw error

      cargarUsuarios()
      alert("Usuario desactivado exitosamente")
    } catch (error) {
      console.error("Error desactivando usuario:", error)
      alert("Error al desactivar usuario")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNombreCompleto("")
    setCorreo("")
    setContraseña("")
    setRol("LECTOR")
  }

  const openEditModal = (user: Usuario) => {
    setSelectedUser(user)
    setNombreCompleto(user.nombre_completo)
    setCorreo(user.correo)
    setRol(user.rol)
    setContraseña("")
    setEditModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Nunca") return "Nunca"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Si no es administrador, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserCheck className="mx-auto h-12 w-12 text-primary-blue" />
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>Solo los administradores pueden gestionar usuarios</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios del sistema y sus permisos</CardDescription>
            </div>
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo usuario en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Nombre Completo</Label>
                        <Input
                          id="user-name"
                          placeholder="Ej: Juan Pérez García"
                          value={nombreCompleto}
                          onChange={(e) => setNombreCompleto(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Correo Electrónico</Label>
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="usuario@empresa.com"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-password">Contraseña</Label>
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="Contraseña segura"
                          value={contraseña}
                          onChange={(e) => setContraseña(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Rol</Label>
                        <Select value={rol} onValueChange={setRol}>
                          <SelectTrigger id="user-role">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                            <SelectItem value="LECTOR">Lector</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="border border-primary-blue text-white bg-primary-blue" type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Usuario"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary-blue" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary-blue" />
                <span className="text-sm">Filtros:</span>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los roles</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="LECTOR">Lector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-primary-blue" />
                <p className="mt-2 text-primary-blue">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: Usuario) => (
                  <TableRow key={user.id_usuario}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.rol)}
                        {user.nombre_completo}
                      </div>
                    </TableCell>
                    <TableCell>{user.correo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.rol)}>
                        {user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.ultimo_acceso || "")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                          <DialogTrigger asChild>
                            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm" onClick={() => openEditModal(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Editar Usuario</DialogTitle>
                              <DialogDescription>Modifica la información del usuario seleccionado.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEditUser}>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-user-name">Nombre Completo</Label>
                                    <Input
                                      id="edit-user-name"
                                      value={nombreCompleto}
                                      onChange={(e) => setNombreCompleto(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-user-email">Correo Electrónico</Label>
                                    <Input
                                      id="edit-user-email"
                                      type="email"
                                      value={correo}
                                      onChange={(e) => setCorreo(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-user-password">Nueva Contraseña (opcional)</Label>
                                    <Input
                                      id="edit-user-password"
                                      type="password"
                                      placeholder="Dejar vacío para mantener actual"
                                      value={contraseña}
                                      onChange={(e) => setContraseña(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-user-role">Rol</Label>
                                    <Select value={rol} onValueChange={setRol}>
                                      <SelectTrigger id="edit-user-role">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                                        <SelectItem value="LECTOR">Lector</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button className="border border-primary-blue text-white bg-primary-blue" type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button className="border border-primary-blue text-white bg-primary-blue" type="submit" disabled={loading}>
                                  {loading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción desactivará permanentemente el usuario{" "}
                                <strong>{user.nombre_completo}</strong> del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id_usuario)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={loading}
                              >
                                {loading ? "Eliminando..." : "Desactivar Usuario"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-primary-blue">
            Mostrando {filteredUsers.length} de {usuarios.length} usuarios
          </div>
          <div className="flex gap-2">
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
              Exportar
            </Button>
            <Button className="border border-primary-blue text-white bg-primary-blue" variant="outline" size="sm">
              Imprimir
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
