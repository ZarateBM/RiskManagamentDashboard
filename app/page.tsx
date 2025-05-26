import type { Metadata } from "next"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sistema de Gestión de Riesgos - Cuarto de Comunicaciones",
  description: "Dashboard para monitoreo y gestión de riesgos en el cuarto de comunicaciones",
}

export default function Home() {
  return (
    <div className="flex min-h-screen h-full w-full flex-col">
      <main className="flex-1">
        <LoginForm />
        {/* <DashboardOverview /> */}
      </main>
    </div>
  )
}
