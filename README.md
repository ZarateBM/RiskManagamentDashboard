# 🛠️ **Guía de Instalación del Sistema de Gestión de Riesgos (Hostinger + Coolify o Dokploy)**

> ✅ **Stack basado en Next.js + PostgreSQL + Docker**
> 🧩 Compatible con cualquier VPS o plataforma que permita contenedores (Coolify / Dokploy / Vercel)
> ⚠️ **Se requiere un Ingeniero DevOps para realizar la instalación del sistema.**
> Este proceso implica gestión avanzada de VPS, despliegue vía Docker, configuración de bases de datos públicas y variables de entorno sensibles.


---

## 🔧 **Tecnologías Utilizadas**

| Tecnología            | Rol                                                          |
| --------------------- | ------------------------------------------------------------ |
| **Next.js**           | Frontend + API Routes (SSR/SSG)                              |
| **Prisma**            | ORM para manejar PostgreSQL                                  |
| **Coolify / Dokploy** | Plataformas de despliegue automático (GitHub + Docker + SSL) |
| **PostgreSQL**        | Base de datos principal                                      |
| **S3/R2**             | Respaldo externo de base de datos                            |

---

## 🚀 **Pasos Completos en Hostinger**

### 🔹 **1. Crear tu VPS**

1. **Selecciona la Región más Cercana**
   *(Ej. United States – Boston)*

2. **Escoge tu Sistema Operativo con Panel**

   * Ir a **OS with Panel**
   * Elige **Coolify** o **Dokploy** según preferencia:

     * **Coolify**: Ideal si deseas una interfaz muy visual y completa.
     * **Dokploy**: Más minimalista, excelente para flujos CI/CD rápidos.
   * Ambos instalan:

     * Docker
     * PostgreSQL
     * Certificados SSL
     * Panel web de administración

3. **Define tu contraseña root**

4. *(Opcional)* **Agrega llave SSH**

5. *(Opcional)* Activa extras:

   * Malware scanner (Gratis)
   * Backups diarios (Pago, útil si no usarás S3/R2)

6. **Selecciona Plan VPS**

   * Recomendado mínimo: **KVM 2**

     * 2 vCPU, 8 GB RAM, 100 GB NVMe SSD

---

## 🧩 **2 Opciones de Plataforma: Coolify o Dokploy**

### 🌿 Opción A: **Coolify**

1. **Accede a Coolify**

   * `https://<IP_VPS>:3000`
   * Cambia la contraseña admin inicial.

2. **Crea Base de Datos PostgreSQL**

   * En **Resources > Add New > Database**
   * Nombre: `risk_management`
   * ✅ Hacerla **pública**
   * Guarda usuario/contraseña

3. **Conecta GitHub**

   * **Applications > Add New > Git Repository**
   * Autoriza tu cuenta y selecciona el repositorio `RiskManagamentDashboard`
   * Solicita acceso si es privado: `brandonzaratem2603@gmail.com`

4. **Configura Variables de Entorno**

   ```env
   DATABASE_URL="postgresql://admin:<PASS>@<HOST>:5432/risk_management"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   ```

5. **Despliegue**

   * Coolify detecta automáticamente el `Dockerfile` y realiza:

     * Build
     * Migraciones (`prisma migrate deploy`)
     * Seed (`prisma db seed`)
   * Se configura HTTPS automáticamente si se añade dominio.

6. **Backup con S3/R2**

   * Ve a **Settings > Storage**
   * Agrega bucket de S3/R2 y activa copias automáticas.

---

### ⚙️ Opción B: **Dokploy**

1. **Accede a Dokploy**

   * `https://<IP_VPS>:3000`
   * Cambia la contraseña del panel inicial.

2. **Base de Datos**

   * Ve a **Services > PostgreSQL**
   * Crea instancia con nombre `risk_management`
   * ✅ Asegúrate de marcarla como accesible públicamente
   * Guarda usuario y host

3. **Vincula Repositorio GitHub**

   * **Applications > New Project > GitHub**
   * Selecciona `RiskManagamentDashboard`
   * Activa “Auto-deploy on Push” si deseas CI/CD

4. **Configura las Variables de Entorno**

   ```env
   DATABASE_URL="postgresql://admin:<PASS>@<HOST>:5432/risk_management"
   NEXTAUTH_SECRET="<clave>"
   ```

5. **Despliegue**

   * Dokploy también detectará automáticamente el `Dockerfile`
   * Despliega y ejecuta migraciones/seed

6. **Backup con S3/R2**

   * Ve a **Settings > Storage Providers**
   * Integra tu bucket y programa respaldos diarios

---

## **Credenciales Iniciales del Sistema**

Después del primer despliegue, tendrás:

* Usuario: `adminriskmanagement@ucr.ac.cr`
* Contraseña: definida en el Seeder

> Puedes cambiarla desde PostgreSQL:

```sql
ALTER USER adminriskmanagement@ucr.ac.cr WITH PASSWORD 'tu_nueva_contraseña_segura';
```

---
## ** Recursos**
- [Documentación oficial de Coolify](https://coolify.io/docs)
- [Soporte técnico de Hostinger](https://www.hostinger.com/support)


