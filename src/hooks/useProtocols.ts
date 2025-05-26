import { useState, useEffect } from "react"
import { Protocol } from "@/types/Protocol"
import axios from "axios"

export function useProtocols() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const res = await axios.get("/api/protocols")
        setProtocols(res.data)
      } catch (error) {
        console.error("Error fetching protocols:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProtocols()
  }, [])

  return { protocols, loading }
}