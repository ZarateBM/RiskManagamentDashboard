import DashboardOverview from "@/components/dashboard-overview";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <DashboardOverview />
      </main>
    </div>
  )
}

