# Deploy del frontend en Vercel – Paso a paso

El frontend (React + Vite) está listo para desplegarse en Vercel. Solo tenés que conectar el repo, configurar la variable de entorno de la API y desplegar.

---

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com) (gratis con GitHub/GitLab/Bitbucket).
- El código del frontend en un repositorio Git (GitHub recomendado).
- Backend desplegado en alguna URL (Railway, Render, etc.) para poner en `VITE_API_URL`.

---

## Paso 1: Subir el código a GitHub (si aún no está)

1. Creá un repositorio en GitHub (ej. `forever-app`).
2. Si todo el proyecto (backend + frontend) está en una carpeta:
   ```bash
   cd c:\Proyectos\For Ever\forever
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU-USUARIO/forever-app.git
   git push -u origin main
   ```
3. Si solo querés desplegar el frontend, podés tener un repo solo con la carpeta `frontend` o usar el mismo repo y en Vercel indicar la carpeta raíz del frontend (Paso 3).

---

## Paso 2: Entrar a Vercel e importar el proyecto

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (con GitHub).
2. Clic en **“Add New…”** → **“Project”**.
3. Si no ves el repo, clic en **“Import Git Repository”** y autorizá a Vercel para acceder a tu cuenta de GitHub.
4. Seleccioná el repositorio del proyecto (ej. `forever-app`).
5. Clic en **“Import”**.

---

## Paso 3: Configurar el proyecto (Root Directory)

Si en el repo la raíz es la carpeta del proyecto y el frontend está en `frontend/`:

1. En **“Configure Project”**, en **“Root Directory”**, clic en **“Edit”**.
2. Escribí: **`frontend`** y confirmá.
3. Así Vercel usará solo la carpeta del frontend para build y deploy.

Si el repositorio es **solo** el frontend (sin carpeta `frontend`), dejá **Root Directory** en blanco.

---

## Paso 4: Build y output (verificación)

Vercel suele detectar Vite y rellenar esto solo. Comprobá que figure:

| Campo | Valor |
|-------|--------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` (o `vite build`) |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Si algo no coincide, configuralo así a mano.

---

## Paso 5: Variable de entorno (API)

1. En la misma pantalla, expandí **“Environment Variables”**.
2. Agregá una variable:
   - **Name:** `VITE_API_URL`
   - **Value:** la URL base de tu API **con** `/api` al final.  
     Ejemplos:
   - `https://tu-api.railway.app/api`
   - `https://tu-api.onrender.com/api`
   - `https://api.tudominio.com/api`
3. Dejá marcado **Production** (y si querés también Preview).
4. Clic en **“Deploy”**.

El frontend usa `VITE_API_URL` en `src/config/api.ts`; en producción todas las llamadas irán a esa URL.

---

## Paso 6: Esperar el deploy

1. Vercel va a instalar dependencias, ejecutar `npm run build` y publicar la carpeta `dist`.
2. Si el build termina bien, te da una URL tipo:  
   `https://forever-app-xxx.vercel.app`.
3. Abrí esa URL: deberías ver la app (login). Si el backend está en la URL que pusiste en `VITE_API_URL`, login y datos deberían funcionar.

---

## Paso 7: (Opcional) Dominio propio

1. En el proyecto en Vercel, entrá a **“Settings”** → **“Domains”**.
2. Agregá tu dominio (ej. `app.tudominio.com`).
3. Seguí las instrucciones para configurar DNS (registro CNAME o A según indique Vercel).

---

## Resumen de archivos que dejaron listo el frontend para Vercel

- **`vercel.json`**: rewrites para que todas las rutas de la SPA (dashboard, admin, noticias, etc.) sirvan `index.html` y React Router funcione bien.
- **`.env.example`**: recordatorio de que en producción hay que definir `VITE_API_URL`.

---

## Si algo falla

- **Build falla:** Revisá la pestaña “Building” en Vercel; suele ser un error de TypeScript o de dependencias. Probá `npm run build` en local dentro de `frontend`.
- **404 al recargar en una ruta:** Confirmá que exista `vercel.json` con los rewrites en la raíz del frontend (o que Root Directory sea `frontend` y ese archivo esté en `frontend/vercel.json`).
- **Error de red / CORS al llamar a la API:** La URL que pusiste en `VITE_API_URL` debe ser la del backend real y el backend debe tener en CORS permitido el origen de tu front en Vercel (ej. `https://tu-app.vercel.app`). En el backend, en `FRONTEND_URL` o en la config de CORS, agregá la URL de Vercel.

Con esto tenés todo listo para deployear el frontend en Vercel y el paso a paso para hacerlo.
