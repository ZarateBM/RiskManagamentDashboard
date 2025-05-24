"use client"
import { LogOut, UserCog } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { User } from "@/types/User"
import { useRouter} from 'next/navigation'

export const Nav = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isClient, setIsClient] = useState(false) 

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('userData')
      const sessionData = sessionStorage.getItem('userData')
      const data = localData ?? sessionData

      if (!data || data === "undefined") {
        router.push('/')
        return
      }

      try {
        const parsedUser = JSON.parse(data)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error al parsear userData:", error)
        router.push('/')
      }
    }
  }, [router])

  if (!isClient) {
    return null // Evita el renderizado en el servidor
  }

  return (
    <div className="flex flex-row justify-between h-16 items-center px-4 bg-primary-blue">
      <img src="firma-tipografica-ucr.svg" alt="Logo UCR" />
      <div className="flex flex-row items-center gap-2">
        <h2>{user?.nombre}</h2>
        {user?.rol == 'ADMINISTRADOR' && (
          <Link className="ml-auto text-white" href="/users">
            <UserCog className="h-6 w-6" />
          </Link>
        )}
        <LogOut className="ml-auto text-white" onClick={() => {
          localStorage.removeItem('userData')
          sessionStorage.removeItem('userData')
          router.push('/')
        }}/>
      </div>
    </div>
  )
}
