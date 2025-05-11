# 🛠️ **Guía de Instalación del Sistema de Gestión de Riesgos (Hostinger + Coolify/Dokploy)**

> **Compatible también con Vercel o cualquier VPS que soporte Docker y Next.js**

---

## 🔧 **Tecnologías Utilizadas**

| Tecnología     | Rol                                                         |
| -------------- | ----------------------------------------------------------- |
| **Next.js**    | Frontend + API Routes (SSR/SSG)                             |
| **Prisma**     | ORM para manejar PostgreSQL                                 |
| **Coolify**    | Plataforma de despliegue automática (Docker + GitHub + SSL) |
| **PostgreSQL** | Base de datos principal                                     |
| **S3/R2**      | Sistema de respaldo externo                                 |

---

## 🚀 **Pasos Completos de Instalación en Hostinger VPS**

### 🔹 **1. Crear tu VPS en Hostinger**

1. **Selecciona la Región más Cercana**:

   * Ejemplo: `United States - Boston` (ver imagen).
   * Esto optimiza la latencia y el rendimiento.

2. **Escoge el Sistema Operativo con Panel**:

   * Ve a la pestaña **OS with Panel**.
   * Selecciona **Coolify**  o **Dokploy** (recomendado).
   * Ambas opciones ya incluyen Docker, PostgreSQL, SSL con Let’s Encrypt, etc.

3. **Establece tu Contraseña Root**

   * Este será tu acceso principal por SSH.

4. *(Opcional)* **Agrega una llave SSH**

   * Recomendado para conexiones más seguras y sin contraseña.

5. *(Opcional)* **Activa Extras**

   * **Malware Scanner**: Gratis.
   * **Backups diarios**: Pago (útil, pero opcional si usarás S3/R2).

6. **Elige tu Plan VPS**
   Recomendado mínimo:

   * **Plan KVM 2 o superior** (2 vCPU, 8GB RAM, 100GB NVMe).
   * Este plan asegura fluidez con PostgreSQL, Coolify y el stack Next.js.

---

### 🔹 **2. Configurar Coolify y la Base de Datos**

1. **Accede a Coolify**:

   * URL: `https://<IP_VPS>:3000`
   * Usa las credenciales dadas en el panel.

2. **Crear una nueva base de datos PostgreSQL** desde Coolify:

   * Ve a **Resources > Database > Add New**.
   * Crea una base llamada `risk_management`.
   * **Marca la opción "Publicly Accessible"** (requerida para Prisma y despliegue remoto).
   * Guarda el usuario y contraseña generados.

3. **Configura Backup Automático con S3/R2** *(opcional pero recomendado)*:

   * Ve a **Settings > Storage**.
   * Agrega credenciales de tu bucket en AWS S3 o Cloudflare R2.
   * Programa **backups automáticos diarios**.

---

### 🔹 **3. Desplegar el Proyecto desde GitHub**

1. **Conecta tu cuenta de GitHub en Coolify**

   * Ve a **Applications > Add New > Git Repository**.
   * Autoriza Coolify a tu cuenta.
   * Solicita acceso al repositorio privado [RiskManagamentDashboard](https://github.com/ZarateBM/RiskManagamentDashboard):

     * Correo: `brandonzaratem2603@gmail.com`

2. **Configura las Variables de Entorno (.env)**:

   ```env
   DATABASE_URL="postgresql://admin_risk:<PASSWORD>@<HOST>:5432/risk_management"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   ```

   * Sustituye `<PASSWORD>` y `<HOST>` con los datos del paso anterior.
   * Estas variables se configuran en la sección **Environment Variables** de la app en Coolify.

3. **Iniciar el despliegue automático**

   * Coolify detectará el `Dockerfile` y realizará:

     * Instalación de dependencias.
     * Migraciones de base de datos (`prisma migrate deploy`).
     * Carga inicial (`prisma db seed`).

---

### 🔹 **4. Credenciales Iniciales del Sistema**

El `seeder` crea un usuario administrador por defecto:

```bash
Correo: adminriskmanagement@ucr.ac.cr
Contraseña: Generada automáticamente o definida en el seeder
```

**Cambia la contraseña** al primer inicio de sesión o desde PostgreSQL:

```sql
ALTER USER adminriskmanagement@ucr.ac.cr WITH PASSWORD 'nueva_contraseña_segura';
```

---

## ✅ **Notas Finales y Recomendaciones**

* Si usas dominio propio:
  Ve a **Settings > Domains** en Coolify para agregar tu dominio y activar HTTPS con Let's Encrypt.

* **Actualizaciones**:
  Al estar conectado a GitHub, cada push al branch configurado desencadenará un nuevo despliegue automático.

* **Monitorización**:
  Coolify ofrece métricas básicas de CPU, RAM y errores del contenedor.

