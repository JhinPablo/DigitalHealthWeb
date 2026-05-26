# Despliegue en DigitalOcean por IP publica

Esta guia deja la demo funcionando por `http://IP_PUBLICA` con Docker Compose y Nginx en puerto 80. HTTPS, dominio y Cloudflare quedan como fase 2.

## 1. Crear Droplet

- Imagen: Ubuntu 22.04 LTS o 24.04 LTS.
- Tamano recomendado: 2 vCPU, 4 GB RAM, 50 GB SSD.
- Autenticacion: SSH key.
- Firewall DigitalOcean: permitir `22/tcp`, `80/tcp`; restringir `22/tcp` a tu IP si es posible.

## 2. Preparar servidor

```bash
ssh root@IP_PUBLICA
apt update && apt upgrade -y
apt install -y ca-certificates curl git ufw

ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable
```

Instalar Docker:

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker compose version
```

Crear usuario de despliegue:

```bash
adduser salud
usermod -aG docker salud
rsync --archive --chown=salud:salud ~/.ssh /home/salud
su - salud
```

## 3. Subir codigo y configurar variables

```bash
git clone https://github.com/jfgarzonv/proyecto-fhir-salud-digital.git
cd proyecto-fhir-salud-digital
cp .env.example .env.docker
nano .env.docker
```

En `.env.docker`, reemplazar todos los `CHANGE_ME_*`, poner `ALLOWED_ORIGINS=http://IP_PUBLICA` y mantener URLs internas Docker como `postgres`, `minio`, `ml-service`, `dl-service` y `orchestrator`.

## 4. Levantar la demo

```bash
docker compose up -d --build
docker compose ps
docker compose exec backend python seed_db.py
```

Smoke tests en el VPS:

```bash
curl -f http://localhost/health
curl -f http://localhost/openapi.json >/dev/null
docker compose logs --tail=80 backend
```

Smoke tests desde tu computador:

```bash
curl -f http://IP_PUBLICA/health
```

Luego abrir `http://IP_PUBLICA` e iniciar sesion con las credenciales seed del README.

## 5. Operacion basica

Comandos utiles:

```bash
docker compose ps
docker compose logs -f nginx backend frontend
docker compose restart
docker compose down
docker compose up -d --build
```

Los datos persisten en volumenes Docker nombrados: `postgres_data` y `minio_data`. No usar `docker compose down -v` salvo que quieras borrar la base de datos y las imagenes.

## 6. Siguiente fase

Para sustentacion con seguridad completa, agregar dominio, certificado TLS, Cloudflare proxy/WAF y modo SSL Full Strict. Ese endurecimiento no forma parte de esta demo por IP publica.
