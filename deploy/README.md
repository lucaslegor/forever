## Despliegue sin contenedores (Vercel + VM Ubuntu)

Arquitectura objetivo:

- **Frontend**: `https://cscdforever.com` (Vercel)
- **API**: `https://api.cscdforever.com` (VM Ubuntu)
- **Nginx**: SSL + reverse proxy → Node (PM2) en loopback
- **DB**: Cloud SQL (Postgres) por **IP privada**

### 1) DNS

- En tu DNS (donde administrás `cscdforever.com`):
  - `A` → `api.cscdforever.com` apuntando a la **IP pública** de la VM (ideal: IP estática).
- En Vercel:
  - Conectar `cscdforever.com` (y opcional `www.cscdforever.com`) siguiendo el wizard de Vercel.

### 2) Google Cloud: red y firewall

- **Firewall (VPC / GCE)**:
  - Permitir inbound **TCP 80/443** a la VM.
  - No exponer el puerto interno del backend (ej. `3000`).
- **Cloud SQL**:
  - Habilitar **IP privada** y vincularlo a la VPC.
  - Deshabilitar IP pública (o restringirla fuertemente).

### 3) VM Ubuntu: instalar dependencias

```bash
sudo apt update
sudo apt install -y nginx ufw
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

Node LTS (ejemplo con NodeSource; podés usar otra vía):

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 4) Backend: build + PM2

En la VM (ejemplo):

```bash
cd /opt
sudo git clone <TU_REPO_URL> forever
sudo chown -R $USER:$USER /opt/forever
cd /opt/forever/backend
npm ci
npm run build
```

Copiar/crear `.env` (ver `deploy/env/backend.env.example`).

Levantar con PM2:

```bash
cd /opt/forever/backend
pm2 start ../deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

### 5) Nginx: reverse proxy + SSL

- Copiar `deploy/nginx/api.cscdforever.com.conf` a:
  - `/etc/nginx/sites-available/api.cscdforever.com`
- Habilitar:

```bash
sudo ln -s /etc/nginx/sites-available/api.cscdforever.com /etc/nginx/sites-enabled/api.cscdforever.com
sudo nginx -t
sudo systemctl reload nginx
```

Emitir SSL:

```bash
sudo certbot --nginx -d api.cscdforever.com
sudo certbot renew --dry-run
```

### 6) Vercel: variables del frontend

En Vercel (Project → Settings → Environment Variables):

- `VITE_API_URL=https://api.cscdforever.com/api`
- (si aplica) `VITE_TURNSTILE_SITE_KEY=...`

### 7) Checklist de verificación

- `GET https://api.cscdforever.com/health`
- `GET https://api.cscdforever.com/health/ready`
- Login desde `https://cscdforever.com`:
  - la respuesta de login debe incluir `Set-Cookie` para `api.cscdforever.com` (HttpOnly).
  - las siguientes requests deben enviar cookie (frontend ya usa `withCredentials: true`).

