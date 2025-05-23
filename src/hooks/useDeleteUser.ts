import { useState } from "react"

export function useDeleteUser() {
  const [deleting, setDeleting] = useState(false)

  const deleteUser = async (id: number) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Error al eliminar usuario")
      }
      return await res.json()
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      throw error
    } finally {
      setDeleting(false)
    }
  }

  return { deleteUser, deleting }
}