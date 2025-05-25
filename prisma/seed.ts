import { PrismaClient, Rol } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // Verificar o crear usuario dummy para la relación
    let usuario = await prisma.usuario.findFirst({
        where: { correo: "admin@example.com" }
    })

    if (!usuario) {
        usuario = await prisma.usuario.create({
            data: {
                nombreCompleto: "Admin User",
                correo: "admin@example.com",
                contraseña: "hashedpassword", // Recuerda almacenar contraseñas hasheadas en producción.
                rol: Rol.ADMINISTRADOR,
                mitigador: false
            }
        })
    }

    // Crear protocolos de ejemplo
    await prisma.protocolo.createMany({
        data: [
            {
                nombre: "Protocolo de Inicio",
                descripcion: "Descripción del protocolo de inicio",
                fechaPublicacion: new Date(),
                idUsuarioPublicador: usuario.idUsuario,
                registroEstado: true
            },
            {
                nombre: "Protocolo de Emergencia",
                descripcion: "Descripción del protocolo de emergencia",
                fechaPublicacion: new Date(),
                idUsuarioPublicador: usuario.idUsuario,
                registroEstado: true
            }
        ]
    })

    console.log("Seed de protocolos realizado")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })