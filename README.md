### **Guía de Instalación del Sistema de Gestión de Riesgos**  
#### **Tecnologías Clave Utilizadas**  
1. **Next.js**  
   - *Qué es:* Framework de React para aplicaciones web híbridas (SSR/SSG).  
   - *Por qué se usa:* Permite renderizado del lado del servidor, API routes integradas y optimización automática. Ideal para monolitos modernos.  

2. **Prisma**  
   - *Qué es:* ORM (Mapeo Objeto-Relacional) para TypeScript/Node.js.  
   - *Por qué se usa:* Simplifica la conexión con PostgreSQL y ejecuta migraciones/seeding de forma controlada.  

3. **PostgreSQL**  
   - *Qué es:* Base de datos relacional open-source.  
   - *Por qué se usa:* Escalabilidad, ACID compliance y soporte para JSONB (flexibilidad en gestión de riesgos).  

4. **Dokploy/Coolify**  
   - *Qué es:* Herramientas de despliegue autohosted tipo "Heroku alternativo".  
   - *Por qué se usa:* Automatizan builds, despliegues, actualizaciones y manejo de entornos.  

5. **AWS S3/Cloudflare R2**  
   - *Qué es:* Almacenamiento en la nube para backups.  
   - *Por qué se usa:* Durabilidad, accesibilidad y costos bajos para respaldos críticos.  

---

### **Proceso de Instalación (Priorizando Dokploy/Coolify)**  

#### **1. Configuración del VPS (Requisitos Mínimos)**  
- **SO:** Ubuntu 22.04 LTS.  
- **Especificaciones:** 2 CPUs, 4 GB RAM, 50 GB SSD.  
- **Proveedores Recomendados:** DigitalOcean, Linode, Hetzner,Hostinger.
- **Recomendamos Hostinger** (Capacidad de desplegar Dokploy y Coolify preinstalado)

**Pasos Iniciales:**  

#### **1. Opción Principal: Despliegue con Dokploy/Coolify**  
**Elección de Herramienta:**  
- **Dokploy:** Ideal para equipos pequeños.  
- **Coolify:** Mejor para múltiples proyectos y entornos .


(Solo en el caso de no haber escogido Hostinger)
bash
# Actualizar sistema y habilitar firewall  
sudo apt update && sudo apt upgrade -y  
sudo ufw allow ssh  
sudo ufw allow http  
sudo ufw allow https  
sudo ufw enable  

# Instalar Docker y Docker Compose  
sudo apt install -y docker.io docker-compose git  

**Instalación de Dokploy:**  
```bash  
git clone https://github.com/dokploy/dokploy.git  
cd dokploy  
docker-compose up -d  # Acceder via http://<IP_VPS>:3000  
```  

**Instalación de Coolify:**  
```bash  
docker run -d \  
  -p 3000:3000 \  
  -v /var/run/docker.sock:/var/run/docker.sock \  
  -v coolify-data:/data \  
  --name coolify \  
  coolify/coolify  
```  

**Configuración Común (Post-Instalación):**  
1. Accede a `http://<IP_VPS>:3000` y crea una cuenta de administrador.  
2. Conecta tu cuenta de GitHub/GitLab.  
3. Selecciona el repositorio del proyecto (rama `master`).  
4. Agrega variables de entorno (**Settings > Environment Variables**):  
   ```env  
   DATABASE_URL="postgresql://admin_risk:TU_CONTRASEÑA@db-host:5432/risk_management"  
   NEXTAUTH_SECRET="clave-secreta-32-caracteres"  
   ```  
5. Dokploy/Coolify detectará automáticamente el Dockerfile y desplegará el proyecto.  

---

#### **3. Configuración de PostgreSQL (Desde Dokploy/Coolify)**  
1. **Crear servicio de base de datos:**  
   - En Dokploy/Coolify, agrega un nuevo servicio "PostgreSQL".  
   - Define usuario, contraseña y nombre de la base de datos.  

2. **Conectar con Next.js:**  
   - Usa la URL generada por Dokploy/Coolify en el `.env` del proyecto:  
     ```env  
     DATABASE_URL="postgresql://usuario:contraseña@postgres:5432/nombre_db"  
     ```  

3. **Ejecutar migraciones y seeding:**  
   ```bash  
   # Si usas Dockerfile, añade estos comandos al build:  
   RUN npx prisma migrate deploy  
   RUN npx prisma db seed  
   ```  

---

#### **4. Alternativa: Despliegue Manual con Docker (Solo si Dokploy/Coolify no es viable)**  
```bash  
git clone -b master https://github.com/tu-repositorio/proyecto.git  
cd proyecto  

# Construir imagen  
docker build -t risk-management .  

# Ejecutar contenedor (apuntando a la DB)  
docker run -d \  
  -p 3000:3000 \  
  --env-file .env \  
  --name risk-management-app \  
  risk-management  
```  

---

#### **5. Respaldo Automático (S3/R2)**  
**Configuración en Coolify:**  
1. Dirígete a **Settings > Storage** y conecta tu bucket de S3/R2.  
2. Programa backups diarios desde la interfaz (Coolify soporta integración nativa).  

**Configuración Manual (Cron Jobs):**  
```bash  
# Ejemplo para Cloudflare R2  
0 3 * * * pg_dump -U usuario_db nombre_db | gzip | ./wrangler r2 object put r2://bucket/backup-$(date +\%F).sql.gz  
```  

---

### **Recomendaciones Finales**  
1. **Cambiar credenciales iniciales:**  
   ```sql  
   ALTER USER adminriskmanagement@ucr.ac.cr WITH PASSWORD 'nueva_contraseña_COMPLEJA';  
   ```  
2. **Seguridad en VPS:**  
   - Usa Certbot para HTTPS:  
     ```bash  
     sudo apt install certbot -y && sudo certbot certonly --nginx  
     ```  
3. **Monitoreo:** Instala Uptime Kuma para alertas de disponibilidad:  
   ```bash  
   docker run -d -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma  
   ```  

---

### **Notas Adicionales**  
- **Vercel:** Solo recomendado para el frontend (usar Serverless Functions para lógica crítica).  
- **Dokploy vs Coolify:** Si priorizas simplicidad, elige Dokploy; si necesitas entornos múltiples, Coolify.  

¡Listo! Con esto tendrás un sistema escalable, respaldado y fácil de gestionar. ¿Necesitas ajustar algo más? 😊
