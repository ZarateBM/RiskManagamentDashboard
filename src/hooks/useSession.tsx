import { User } from "@/types/User"
import { useEffect, useState } from "react"

export function useSession() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const localData = localStorage.getItem('userData')
    const sessionData = sessionStorage.getItem('userData')
    const data = localData || sessionData

    if (data) {
      try {
        setUser(JSON.parse(data))
      } catch (e) {
        console.error("Invalid session data", e)
        setUser(null)
      }
    }
  }, [])

  return user
}
