"use client"

import type React from "react"

import { useState } from "react"
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
import { useUsers } from "@/hooks/useGetUser"
import { useCreateUser } from "@/hooks/useCreateUser"
import { useDeleteUser } from "@/hooks/useDeleteUser"
import { useSession } from "@/hooks/useSession"

interface Usuario {
  idUsuario: number
  nombreCompleto: string
  correo: string
  rol: string
}

export default function UserManagement() {
  const { users: usuarios, loading } = useUsers()
  const { createUser } = useCreateUser()
  const { deleteUser } = useDeleteUser()

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const userSession = useSession()

  // Campos para formulario
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [correo, setCorreo] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [rol, setRol] = useState("LECTOR")

  // Filtrar usuarios según los criterios
  const filteredUsers = usuarios.filter((user: Usuario) => {
    const matchesSearch =
      user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "Todos" || user.rol === roleFilter

    return matchesSearch && matchesRole
  })

  // Función para obtener el color del badge según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMINISTRADOR":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "EDITOR":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
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
      case "EDITOR":
        return <Edit className="h-4 w-4 text-amber-500" />
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
    try {
      await createUser({
        nombreCompleto,
        correo,
        contraseña,
        rol,
      })
      alert("Usuario creado exitosamente")
      setCreateModalOpen(false)
      resetForm()
      window.location.reload()
    } catch (error) {
      console.error("Error al crear usuario:", error)
      alert("Error al crear usuario")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      alert("Usuario eliminado exitosamente")
      window.location.reload()
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      alert("Error al eliminar usuario")
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
    setNombreCompleto(user.nombreCompleto)
    setCorreo(user.correo)
    setRol(user.rol)
    setContraseña("")
    setEditModalOpen(true)
  }

  const handlePrint = () => {
    // Crear una hoja de estilo para impresión
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
      @media print {
        .card-content, .card-content * {
          visibility: visible;
        }
        .hidden-to-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Imprimir
    window.print();
    
    // Eliminar la hoja de estilo después de imprimir
    document.head.removeChild(printStyles);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle >Gestión de Usuarios</CardTitle>
              <CardDescription className="hidden-to-print">Administra los usuarios del sistema y sus permisos</CardDescription>
            </div>
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                {userSession != null && userSession.rol === "ADMINISTRADOR" && (
                  <Button>
                    <Plus className="mr-2 h-4 w-4 hidden-to-print" />
                    Nuevo Usuario
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] margin-0" style={{}}>
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo usuario en el sistema.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="p-4">
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
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="LECTOR">Lector</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar Usuario</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="card-content">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1 hidden-to-print">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 hidden-to-print">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filtros:</span>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los roles</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="LECTOR">Lector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  {userSession != null && userSession.rol === "ADMINISTRADOR" && (
                    <TableHead className="text-right hidden-to-print">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: Usuario) => (
                  <TableRow key={user.idUsuario}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.rol)} 
                        {user.nombreCompleto}
                        {user.idUsuario}
                      </div>
                    </TableCell>
                    <TableCell>{user.correo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.rol)}>
                        {user.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    </TableCell >
                    {userSession != null && userSession.rol === "ADMINISTRADOR" && (
                      <TableCell className="text-right hidden-to-print">
                        <div className="flex justify-end gap-2">
                          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] margin-0">
                              <DialogHeader>
                              <DialogTitle>Editar Usuario</DialogTitle>
                              <DialogDescription>Modifica la información del usuario seleccionado.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-user-name">Nombre Completo</Label>
                                  <Input
                                    id="edit-user-name"
                                    value={nombreCompleto}
                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-user-email">Correo Electrónico</Label>
                                  <Input
                                    id="edit-user-email"
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
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
                                      <SelectItem value="EDITOR">Editor</SelectItem>
                                      <SelectItem value="LECTOR">Lector</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="flex justify-end p-4">
                              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                                Cancelar
                              </Button>
                              <Button>Guardar Cambios</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent style={{backgroundColor: "#f8f9fa"}}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                                <strong>{user.nombreCompleto}</strong> del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.idUsuario)}
                                className="bg-red-600 hover:bg-red-700 text-white "
                                style={{ color: "#fff" , fontWeight: "bold" }}
                              >
                                Eliminar Usuario
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground hidden-to-print">
            Mostrando {filteredUsers.length} de {usuarios.length} usuarios
          </div>
          <div className="flex gap-2 hidden-to-print">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Imprimir
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
