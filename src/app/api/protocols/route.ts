import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const protocolos = await prisma.protocolo.findMany()
            res.status(200).json(protocolos)
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error al obtener protocolos:", error.message)
            }
            res.status(500).json({ error: "Error al obtener protocolos" })
        }
    } else {
        res.status(405).json({ error: "Método no permitido" })
    }
}