import { useState, useEffect } from "react"
import axios from "axios"

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/users")
        setUsers(res.data)
      } catch (error) {
        console.error("Error al obtener usuarios:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { users, loading }
}