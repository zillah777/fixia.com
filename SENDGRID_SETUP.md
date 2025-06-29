# Configuración de SendGrid para Fixialo

## 📧 Guía Completa de Configuración

### 1. Crear Cuenta en SendGrid

1. Ve a [https://sendgrid.com/](https://sendgrid.com/)
2. Crea una cuenta gratuita (100 emails/día gratis)
3. Verifica tu email y completa el onboarding

### 2. Obtener API Key

1. **Navega a API Keys**
   ```
   Dashboard → Settings → API Keys
   ```

2. **Crear Nueva API Key**
   - Haz clic en "Create API Key"
   - Nombre: `Fixialo Production` (o `Fixialo Development`)
   - Tipo: **Full Access** (recomendado) o **Restricted Access**

3. **Si eliges Restricted Access, habilita:**
   - Mail Send: **Full Access**
   - Email Activity: **Read Access** (opcional)
   - Suppressions: **Full Access** (opcional)

4. **Copiar la API Key**
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **IMPORTANTE**: Solo se muestra una vez, guárdala segura.

### 3. Configurar Variables de Entorno

#### Para Desarrollo Local:
```bash
# En tu archivo .env
SENDGRID_API_KEY=SG.tu-api-key-aqui
EMAIL_FROM=noreply@fixialo.com
FRONTEND_URL=http://localhost:3000
```

#### Para Producción (Railway):
```bash
# Variables de entorno en Railway
SENDGRID_API_KEY=SG.tu-api-key-aqui
EMAIL_FROM=noreply@tudominio.com
FRONTEND_URL=https://fixialo.vercel.app
```

### 4. Verificar Dominio (Opcional pero Recomendado)

#### Para Mejor Deliverability:

1. **Single Sender Verification** (Básico)
   ```
   Settings → Sender Authentication → Single Sender Verification
   ```
   - Agregar email: `noreply@tudominio.com`
   - Verificar el email

2. **Domain Authentication** (Avanzado)
   ```
   Settings → Sender Authentication → Authenticate Your Domain
   ```
   - Agregar tu dominio
   - Configurar DNS records (CNAME)

### 5. Testing

#### Probar la Configuración:
```bash
# En el backend
npm run dev

# Registrar un usuario nuevo para probar email de verificación
# Revisar logs del servidor para confirmar envío
```

#### Logs Esperados:
```bash
✅ EmailService configurado con SendGrid
✅ Email enviado con SendGrid a usuario@test.com: Verificá tu email - Fixialo
```

### 6. Monitoreo

#### Dashboard de SendGrid:
- **Activity Feed**: Ver todos los emails enviados
- **Statistics**: Métricas de entrega, apertura, etc.
- **Suppressions**: Emails bounced/spam

### 7. Límites del Plan Gratuito

- **100 emails/día** gratis
- **Sin límite de tiempo**
- **Todas las funciones básicas**

#### Para Más Emails:
- **Essentials**: $14.95/mes → 50,000 emails/mes
- **Pro**: $89.95/mes → 100,000 emails/mes

### 8. Mejores Prácticas

1. **Usar dominio propio** en EMAIL_FROM
2. **Verificar dominio** para mejor deliverability
3. **Monitorear métricas** regularmente
4. **Manejar bounces** y unsubscribes
5. **Usar templates** para emails complejos

### 9. Troubleshooting

#### Errores Comunes:

**API Key Inválida:**
```bash
❌ Error enviando email: The provided authorization grant is invalid, expired, or revoked
```
- Verificar que la API key sea correcta
- Confirmar que tenga permisos de Mail Send

**From Email No Verificado:**
```bash
❌ Error enviando email: The from address does not match a verified Sender Identity
```
- Verificar single sender o dominio en SendGrid

**Rate Limit:**
```bash
❌ Error enviando email: Rate limit exceeded
```
- Plan gratuito: máximo 100 emails/día

### 10. Fallback SMTP

Si SendGrid falla, el sistema automáticamente usa SMTP como fallback:

```env
# En .env como respaldo
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🚀 Estado Actual

- ✅ SendGrid integrado en EmailService
- ✅ Fallback automático a SMTP
- ✅ No interrumpe registro si falla email
- ✅ Logs detallados para debugging
- ✅ Templates HTML profesionales

**Próximo paso**: Configurar tu API Key de SendGrid en las variables de entorno.