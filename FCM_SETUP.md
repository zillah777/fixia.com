# 📱 Sistema de Notificaciones Push FCM - Serviplay

Este documento explica cómo configurar y usar el sistema completo de notificaciones push con Firebase Cloud Messaging (FCM) en Serviplay.

## 🚀 Características del Sistema

### ✅ Funcionalidades Implementadas

- **📲 Push Notifications Completas**: Notificaciones nativas para Android, iOS y Web
- **🔄 Integración Automática**: Se envían automáticamente con cada notificación in-app
- **💰 Notificaciones de Pago**: Estados de pago de MercadoPago (aprobado, rechazado, pendiente)
- **🎯 Alertas de Proximidad**: Trabajos cerca de los Ases
- **🌟 Notificaciones de Match**: Cuando hay coincidencias entre Ases y Exploradores  
- **💬 Mensajes de Chat**: Notificaciones de nuevos mensajes
- **⭐ Calificaciones**: Notificaciones de nuevas calificaciones recibidas
- **📊 Estadísticas Detalladas**: Seguimiento de entrega y éxito de notificaciones
- **🧹 Limpieza Automática**: Eliminación de tokens inválidos
- **📢 Notificaciones Masivas**: Para administradores (mantenimiento, anuncios)

### 🔧 Servicios Implementados

1. **FCMService**: Servicio principal de Firebase Cloud Messaging
2. **NotificationService**: Servicio integrado para notificaciones in-app y push
3. **ChatNotificationService**: Notificaciones específicas de chat
4. **RatingNotificationService**: Notificaciones de calificaciones y hitos
5. **NotificationManager**: Gestor centralizado de todos los servicios

## 📋 Configuración Inicial

### 1. Configurar Firebase Project

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Cloud Messaging en el proyecto
4. Ve a **Configuración del proyecto** > **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Descarga el archivo JSON

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y completa las variables de FCM:

```bash
# Firebase Cloud Messaging (FCM)
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto-firebase.iam.gserviceaccount.com
```

⚠️ **Importante**: La `FIREBASE_PRIVATE_KEY` debe incluir los saltos de línea como `\n`

### 3. Instalar Dependencias

```bash
cd backend
npm install firebase-admin
```

### 4. Ejecutar Migraciones

```bash
# Ejecutar la migración de estadísticas de push notifications
psql -d serviplay -f migrations/007_create_push_notification_stats.sql
```

## 🔌 Integración en el Backend

### Inicializar el Sistema

En tu archivo `server.ts` o `app.ts`:

```typescript
import { NotificationManager } from '@/services/NotificationManager';

// Inicializar sistema de notificaciones
await NotificationManager.initialize();
```

### Registrar Rutas

En tu archivo de rutas principal:

```typescript
import notificationsRouter from '@/routes/notifications';

app.use('/api/notifications', notificationsRouter);
```

## 📱 Integración en el Frontend

### 1. Configurar Firebase en el Frontend

```bash
cd frontend
npm install firebase
```

### 2. Configurar Firebase Config

```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  projectId: "tu-proyecto-firebase",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

### 3. Solicitar Permisos y Registrar Token

```javascript
// notificationService.js
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase-config';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'tu-vapid-key'
      });
      
      // Enviar token al backend
      await fetch('/api/notifications/fcm/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ fcm_token: token })
      });
      
      return token;
    }
  } catch (error) {
    console.error('Error obteniendo token FCM:', error);
  }
}
```

### 4. Manejar Notificaciones en Primer Plano

```javascript
// En tu componente principal
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase-config';

useEffect(() => {
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Notificación recibida:', payload);
    
    // Mostrar notificación in-app
    showInAppNotification(payload.notification);
  });

  return () => unsubscribe();
}, []);
```

## 🛠️ API Endpoints

### Notificaciones Básicas

```bash
# Obtener notificaciones del usuario
GET /api/notifications

# Contar notificaciones no leídas  
GET /api/notifications/unread-count

# Marcar como leída
PUT /api/notifications/:id/read

# Marcar todas como leídas
PUT /api/notifications/mark-all-read

# Eliminar notificación
DELETE /api/notifications/:id
```

### FCM Push Notifications

```bash
# Registrar token FCM
POST /api/notifications/fcm/register
{
  "fcm_token": "token_firebase_aqui"
}

# Eliminar token FCM
DELETE /api/notifications/fcm/unregister

# Estado del servicio FCM
GET /api/notifications/fcm/status
```

### Administración

```bash
# Estadísticas FCM
GET /api/notifications/admin/stats

# Notificación masiva
POST /api/notifications/admin/broadcast
{
  "title": "Mantenimiento programado",
  "body": "El sistema estará en mantenimiento...",
  "user_type": "as", // opcional: "as", "explorador" o todos
  "data": {
    "maintenance_id": "123"
  }
}
```

### Desarrollo

```bash
# Notificación de prueba (solo desarrollo)
POST /api/notifications/test
{
  "title": "Prueba",
  "body": "Esta es una notificación de prueba",
  "type": "sistema"
}

# Información de desarrollo
GET /api/notifications/dev/info
```

## 🎯 Tipos de Notificaciones

### 1. Alertas de Proximidad
Se envían automáticamente cuando hay trabajos cerca del As:

```typescript
await FCMService.sendProximityAlert(asId, busqueda);
```

### 2. Notificaciones de Match
Cuando se crea un nuevo match:

```typescript
await FCMService.sendMatchNotification(userId, match);
```

### 3. Notificaciones de Pago
Estados de pago de MercadoPago:

```typescript
await FCMService.sendPaymentNotification(userId, {
  id: paymentId,
  status: 'approved', // 'approved', 'rejected', 'pending'
  plan_id: 'profesional',
  amount: 2999
});
```

### 4. Notificaciones de Chat
Nuevos mensajes en chat:

```typescript
await FCMService.sendChatNotification(userId, {
  chat_id: chatId,
  sender_id: senderId,
  sender_name: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?'
});
```

### 5. Notificaciones de Calificaciones
Nuevas calificaciones recibidas:

```typescript
await FCMService.sendRatingNotification(userId, {
  id: ratingId,
  puntuacion: 5,
  reviewer_name: 'María González',
  comentario: 'Excelente trabajo'
});
```

## 📊 Monitoreo y Estadísticas

### Verificar Estado del Sistema

```bash
curl http://localhost:3001/api/notifications/fcm/status
```

### Obtener Estadísticas

```bash
curl http://localhost:3001/api/notifications/admin/stats
```

### Verificar Salud del Sistema

```typescript
const health = await NotificationManager.verificarSalud();
console.log(health);
```

## 🔄 Servicios Periódicos

El sistema incluye servicios automáticos que se ejecutan periódicamente:

### 1. Verificación de Mensajes No Leídos
- **Frecuencia**: Cada 30 minutos
- **Función**: Notifica mensajes no leídos después de 1 hora

### 2. Recordatorios de Calificación  
- **Frecuencia**: Cada 6 horas
- **Función**: Recuerda calificar trabajos completados

### 3. Verificación de Suscripciones
- **Frecuencia**: Cada 24 horas  
- **Función**: Verifica y notifica suscripciones vencidas

## 🛡️ Seguridad y Buenas Prácticas

### Rate Limiting
- **FCM Registration**: 10 requests por 5 minutos
- **Notificaciones generales**: 100 requests por 15 minutos
- **Broadcast**: 5 requests por hora

### Validación
- Tokens FCM validados antes del registro
- Sanitización de todos los inputs
- Validación de UUIDs en parámetros

### Limpieza Automática
- Tokens inválidos se eliminan automáticamente
- Cache de tokens se actualiza dinámicamente
- Estadísticas se mantienen por eficiencia

## 🐛 Troubleshooting

### Problema: Notificaciones no se envían

1. **Verificar configuración**:
```bash
curl http://localhost:3001/api/notifications/fcm/status
```

2. **Verificar variables de entorno**:
```bash
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
```

3. **Verificar logs**:
```bash
# Buscar errores FCM en logs
grep "FCM" logs/app.log
```

### Problema: Token no se registra

1. **Verificar permisos**:
```javascript
console.log(Notification.permission);
```

2. **Verificar token válido**:
```javascript
console.log('Token length:', token.length);
// Debe ser > 20 caracteres
```

### Problema: Notificaciones duplicadas

- El sistema previene duplicados con verificación de `notification_id`
- Los servicios periódicos incluyen verificación de procesamiento previo

## 📚 Recursos Adicionales

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://web.dev/push-notifications/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎉 ¡Listo!

El sistema de notificaciones push está completamente configurado y listo para usar. Las notificaciones se enviarán automáticamente cuando:

- ✅ Se creen notificaciones in-app
- ✅ Haya pagos de MercadoPago
- ✅ Se encuentren matches
- ✅ Lleguen nuevos mensajes
- ✅ Se reciban calificaciones

¡Disfruta del sistema de notificaciones más completo para tu plataforma de servicios! 🚀