import axios from "axios"

interface CreateUserData {
  nombreCompleto: string
  correo: string
  contraseña: string
  rol: string
}

export function useCreateUser() {
  const createUser = async (data: CreateUserData) => {
    try {
      const res = await axios.post("/api/users", data)
      return res.data
    } catch (error) {
      console.error("Error al crear usuario:", error)
      throw error
    }
  }

  return { createUser }
}