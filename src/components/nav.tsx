"use client"
import { LogOut, UserCog, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useSession } from '@/hooks/useSession'
import { useRouter, usePathname } from 'next/navigation'


export const Nav = () => {
  const router = useRouter()
  const pathname = usePathname()
  const sessionUser = useSession()

  const handleLogout = () => {
    localStorage.removeItem('userData')
    sessionStorage.removeItem('userData')
    router.push('/')
  }

  if (!sessionUser) {
    return (
      <div className="flex flex-row justify-between h-16 items-center px-4 bg-primary-blue">
        <Link href="/">
          <img src="firma-tipografica-ucr.svg" alt="Logo UCR" />
        </Link>
        <div className="flex flex-row items-center gap-2">
          <LogOut className="ml-auto text-white" onClick={handleLogout}/>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-row justify-between h-16 items-center px-4 bg-primary-blue">
      <Link href="/dashboard">
        <img src="firma-tipografica-ucr.svg" alt="Logo UCR" />
      </Link>
      <div className="flex flex-row items-center gap-2">
        <h2 className='text-white'>Bienvenido {sessionUser.nombre}</h2>
        {sessionUser.rol === 'ADMINISTRADOR' && (
          pathname === '/users' ? (
            <Link className="ml-auto text-white" href="/dashboard">
              <LayoutDashboard className="h-6 w-6" />
            </Link>
          ) : (
            <Link className="ml-auto text-white" href="/users">
              <UserCog className="h-6 w-6" />
            </Link>
          )
        )}
        <LogOut className="ml-auto text-white" onClick={handleLogout}/>
      </div>
    </div>
  )
}
