# 🚀 Guía de Deploy para Serviplay

## 1. Deploy del Backend en Railway

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub
3. Conecta tu repositorio

### Paso 2: Configurar el Backend
1. Haz click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Elige tu repositorio de Serviplay
4. Railway detectará automáticamente el backend

### Paso 3: Variables de Entorno en Railway
Agrega estas variables en el dashboard de Railway:

```env
NODE_ENV=production
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
REFRESH_TOKEN_SECRET=tu-refresh-token-secret-aqui
SESSION_SECRET=tu-session-secret-aqui
CORS_ORIGIN=https://serviplay.vercel.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Paso 4: Agregar PostgreSQL
1. En Railway, ve a la pestaña "Add services"
2. Selecciona "PostgreSQL"
3. Railway configurará automáticamente `DATABASE_URL`

### Paso 5: Configurar Build
Railway debería detectar automáticamente:
- Build Command: `npm run build`
- Start Command: `npm run start`
- Root Directory: `backend`

## 2. Deploy del Frontend en Vercel

### Paso 1: Instalar Vercel CLI (opcional)
```bash
npm i -g vercel
```

### Paso 2: Deploy desde Dashboard
1. Ve a [vercel.com](https://vercel.com)
2. Conecta con GitHub
3. Importa tu repositorio
4. Configura:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Paso 3: Variables de Entorno en Vercel
En el dashboard de Vercel, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend-railway.railway.app
NEXT_PUBLIC_API_BASE_URL=https://tu-backend-railway.railway.app/api
NEXT_PUBLIC_APP_NAME=Serviplay
NEXT_PUBLIC_APP_URL=https://tu-frontend.vercel.app
NODE_ENV=production
```

## 3. Deploy Alternativo usando CLI

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
# Instalar Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

## 4. Verificación del Deploy

### Checks Backend
- [ ] ✅ https://tu-backend.railway.app/health responde
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos conectada
- [ ] ✅ CORS configurado para el frontend

### Checks Frontend  
- [ ] ✅ https://tu-frontend.vercel.app carga
- [ ] ✅ PWA funciona (installable)
- [ ] ✅ API calls funcionan
- [ ] ✅ Responsive design

## 5. URLs Finales

Una vez deployado:
- **Frontend**: https://serviplay.vercel.app
- **Backend**: https://serviplay-backend.railway.app
- **API Health**: https://serviplay-backend.railway.app/health

## 6. Próximos Pasos

### Dominio Personalizado (Opcional)
1. Comprar dominio (ej: serviplay.com)
2. Configurar en Vercel: serviplay.com → frontend
3. Configurar en Railway: api.serviplay.com → backend

### Monitoreo
- Railway: Logs automáticos
- Vercel: Analytics integrado
- Agregar Sentry para error tracking

## 7. Comandos Útiles

```bash
# Ver logs del backend
railway logs

# Ver logs del frontend  
vercel logs

# Deploy rápido
cd frontend && vercel --prod
cd backend && railway up
```

---

¡Tu aplicación estará lista para usar en aproximadamente 10-15 minutos! 🎉