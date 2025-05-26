// hooks/useSession.ts
import { useEffect, useState } from 'react'
import { User } from '@/types/User'

export function useSession(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('userData') || sessionStorage.getItem('userData')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setUser(null)
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('userData') || sessionStorage.getItem('userData')
      if (updatedUser) {
        setUser(JSON.parse(updatedUser))
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return user
}
