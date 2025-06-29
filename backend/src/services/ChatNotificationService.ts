import { query } from '@/config/database';
import { FCMService } from './FCMService';
import { NotificationService } from './NotificationService';

export class ChatNotificationService {
  /**
   * Notificar nuevo mensaje en chat
   */
  static async notificarNuevoMensaje(chatId: string, senderId: string, message: string) {
    try {
      console.log(`💬 Notificando nuevo mensaje en chat ${chatId}`);

      // Obtener participantes del chat excepto el remitente
      const participantsResult = await query(`
        SELECT 
          u.id as usuario_id,
          u.nombre,
          u.apellido
        FROM chat_participants cp
        INNER JOIN usuarios u ON cp.usuario_id = u.id
        WHERE cp.chat_id = $1 AND cp.usuario_id != $2
      `, [chatId, senderId]);

      if (participantsResult.rows.length === 0) {
        console.log(`⚠️  No hay participantes para notificar en chat ${chatId}`);
        return;
      }

      // Obtener datos del remitente
      const senderResult = await query(`
        SELECT nombre, apellido FROM usuarios WHERE id = $1
      `, [senderId]);

      if (senderResult.rows.length === 0) {
        console.log(`⚠️  Remitente ${senderId} no encontrado`);
        return;
      }

      const sender = senderResult.rows[0];
      const senderName = `${sender.nombre} ${sender.apellido}`;

      // Notificar a cada participante
      for (const participant of participantsResult.rows) {
        try {
          // Crear notificación en app
          await NotificationService.crearNotificacion({
            usuario_id: participant.usuario_id,
            tipo: 'mensaje',
            titulo: `💬 Nuevo mensaje`,
            mensaje: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
            datos_extra: {
              chat_id: chatId,
              sender_id: senderId,
              sender_name: senderName,
              message_preview: message.substring(0, 100)
            }
          });

          // Enviar push notification
          await FCMService.sendChatNotification(participant.usuario_id, {
            chat_id: chatId,
            sender_id: senderId,
            sender_name: senderName,
            content: message
          });

        } catch (error) {
          console.error(`Error notificando a usuario ${participant.usuario_id}:`, error);
        }
      }

      console.log(`✅ Notificaciones de chat enviadas para ${participantsResult.rows.length} participantes`);

    } catch (error) {
      console.error('Error notificando nuevo mensaje:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando alguien se une al chat
   */
  static async notificarNuevoParticipante(chatId: string, newUserId: string, addedByUserId: string) {
    try {
      console.log(`👥 Notificando nuevo participante en chat ${chatId}`);

      // Obtener datos del nuevo usuario y quien lo agregó
      const usersResult = await query(`
        SELECT 
          id,
          nombre,
          apellido
        FROM usuarios 
        WHERE id IN ($1, $2)
      `, [newUserId, addedByUserId]);

      if (usersResult.rows.length !== 2) {
        console.log(`⚠️  No se encontraron datos de usuarios para notificación`);
        return;
      }

      const users = usersResult.rows;
      const newUser = users.find(u => u.id === newUserId);
      const addedByUser = users.find(u => u.id === addedByUserId);

      if (!newUser || !addedByUser) {
        console.log(`⚠️  Error identificando usuarios en notificación`);
        return;
      }

      // Obtener otros participantes del chat
      const participantsResult = await query(`
        SELECT 
          u.id as usuario_id,
          u.nombre,
          u.apellido
        FROM chat_participants cp
        INNER JOIN usuarios u ON cp.usuario_id = u.id
        WHERE cp.chat_id = $1 AND cp.usuario_id NOT IN ($2, $3)
      `, [chatId, newUserId, addedByUserId]);

      // Notificar a los participantes existentes
      for (const participant of participantsResult.rows) {
        try {
          await NotificationService.crearNotificacion({
            usuario_id: participant.usuario_id,
            tipo: 'mensaje',
            titulo: `👥 Nuevo participante`,
            mensaje: `${addedByUser.nombre} agregó a ${newUser.nombre} ${newUser.apellido} al chat`,
            datos_extra: {
              chat_id: chatId,
              new_user_id: newUserId,
              new_user_name: `${newUser.nombre} ${newUser.apellido}`,
              added_by_id: addedByUserId,
              added_by_name: `${addedByUser.nombre} ${addedByUser.apellido}`
            }
          });

        } catch (error) {
          console.error(`Error notificando nuevo participante a usuario ${participant.usuario_id}:`, error);
        }
      }

      console.log(`✅ Notificaciones de nuevo participante enviadas`);

    } catch (error) {
      console.error('Error notificando nuevo participante:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando alguien abandona el chat
   */
  static async notificarParticipanteSalio(chatId: string, leftUserId: string) {
    try {
      console.log(`👋 Notificando participante que abandonó chat ${chatId}`);

      // Obtener datos del usuario que se fue
      const leftUserResult = await query(`
        SELECT nombre, apellido FROM usuarios WHERE id = $1
      `, [leftUserId]);

      if (leftUserResult.rows.length === 0) {
        console.log(`⚠️  Usuario ${leftUserId} no encontrado`);
        return;
      }

      const leftUser = leftUserResult.rows[0];

      // Obtener participantes restantes del chat
      const participantsResult = await query(`
        SELECT 
          u.id as usuario_id,
          u.nombre,
          u.apellido
        FROM chat_participants cp
        INNER JOIN usuarios u ON cp.usuario_id = u.id
        WHERE cp.chat_id = $1 AND cp.usuario_id != $2
      `, [chatId, leftUserId]);

      // Notificar a los participantes restantes
      for (const participant of participantsResult.rows) {
        try {
          await NotificationService.crearNotificacion({
            usuario_id: participant.usuario_id,
            tipo: 'mensaje',
            titulo: `👋 Participante salió`,
            mensaje: `${leftUser.nombre} ${leftUser.apellido} abandonó el chat`,
            datos_extra: {
              chat_id: chatId,
              left_user_id: leftUserId,
              left_user_name: `${leftUser.nombre} ${leftUser.apellido}`
            }
          });

        } catch (error) {
          console.error(`Error notificando salida a usuario ${participant.usuario_id}:`, error);
        }
      }

      console.log(`✅ Notificaciones de participante salió enviadas`);

    } catch (error) {
      console.error('Error notificando participante que salió:', error);
      throw error;
    }
  }

  /**
   * Notificar cuando se crea un nuevo chat para un match
   */
  static async notificarNuevoChatMatch(matchId: string, chatId: string) {
    try {
      console.log(`🎯 Notificando nuevo chat para match ${matchId}`);

      // Obtener datos del match
      const matchResult = await query(`
        SELECT 
          m.*,
          pe.usuario_id as explorador_usuario_id,
          pe.nombre as explorador_nombre,
          pe.apellido as explorador_apellido,
          pa.usuario_id as as_usuario_id,
          pa.nombre as as_nombre,
          pa.apellido as as_apellido,
          s.titulo as servicio_titulo
        FROM matches m
        INNER JOIN perfiles_exploradores pe ON m.explorador_id = pe.id
        INNER JOIN perfiles_ases pa ON m.as_id = pa.id
        LEFT JOIN servicios s ON m.servicio_id = s.id
        WHERE m.id = $1
      `, [matchId]);

      if (matchResult.rows.length === 0) {
        console.log(`⚠️  Match ${matchId} no encontrado`);
        return;
      }

      const match = matchResult.rows[0];

      // Notificar al As
      await NotificationService.crearNotificacion({
        usuario_id: match.as_usuario_id,
        tipo: 'mensaje',
        titulo: `💬 Nuevo chat disponible`,
        mensaje: `Podés chatear con ${match.explorador_nombre} sobre tu servicio`,
        datos_extra: {
          chat_id: chatId,
          match_id: matchId,
          other_user_id: match.explorador_usuario_id,
          other_user_name: `${match.explorador_nombre} ${match.explorador_apellido}`,
          servicio_titulo: match.servicio_titulo
        }
      });

      // Notificar al Explorador
      await NotificationService.crearNotificacion({
        usuario_id: match.explorador_usuario_id,
        tipo: 'mensaje',
        titulo: `💬 Nuevo chat disponible`,
        mensaje: `Podés chatear con ${match.as_nombre} ${match.as_apellido}`,
        datos_extra: {
          chat_id: chatId,
          match_id: matchId,
          other_user_id: match.as_usuario_id,
          other_user_name: `${match.as_nombre} ${match.as_apellido}`,
          servicio_titulo: match.servicio_titulo
        }
      });

      console.log(`✅ Notificaciones de nuevo chat enviadas para match ${matchId}`);

    } catch (error) {
      console.error('Error notificando nuevo chat de match:', error);
      throw error;
    }
  }

  /**
   * Notificar mensaje no leído después de cierto tiempo
   */
  static async notificarMensajesNoLeidos() {
    try {
      console.log(`📬 Verificando mensajes no leídos...`);

      // Buscar mensajes no leídos de hace más de 1 hora
      const unreadResult = await query(`
        SELECT 
          cm.id as message_id,
          cm.chat_id,
          cm.sender_id,
          cm.content,
          cm.created_at,
          cp.usuario_id as recipient_id,
          u_sender.nombre as sender_nombre,
          u_sender.apellido as sender_apellido,
          COUNT(*) OVER (PARTITION BY cm.chat_id, cp.usuario_id) as unread_count
        FROM chat_messages cm
        INNER JOIN chat_participants cp ON cm.chat_id = cp.chat_id
        INNER JOIN usuarios u_sender ON cm.sender_id = u_sender.id
        WHERE cp.usuario_id != cm.sender_id
        AND cm.created_at > NOW() - INTERVAL '1 hour'
        AND cm.created_at < NOW() - INTERVAL '5 minutes'
        AND NOT EXISTS (
          SELECT 1 FROM message_reads mr 
          WHERE mr.message_id = cm.id AND mr.user_id = cp.usuario_id
        )
        ORDER BY cm.created_at DESC
      `);

      const processedChats = new Set();

      for (const unread of unreadResult.rows) {
        const chatKey = `${unread.chat_id}-${unread.recipient_id}`;
        
        if (processedChats.has(chatKey)) {
          continue;
        }

        processedChats.add(chatKey);

        try {
          await NotificationService.crearNotificacion({
            usuario_id: unread.recipient_id,
            tipo: 'mensaje',
            titulo: `📬 Mensajes pendientes`,
            mensaje: `Tenés ${unread.unread_count} mensajes sin leer de ${unread.sender_nombre}`,
            datos_extra: {
              chat_id: unread.chat_id,
              unread_count: unread.unread_count,
              sender_name: `${unread.sender_nombre} ${unread.sender_apellido}`
            }
          });

        } catch (error) {
          console.error(`Error notificando mensajes no leídos a usuario ${unread.recipient_id}:`, error);
        }
      }

      console.log(`✅ Verificación de mensajes no leídos completada: ${processedChats.size} chats procesados`);

    } catch (error) {
      console.error('Error verificando mensajes no leídos:', error);
    }
  }

  /**
   * Programar verificación periódica de mensajes no leídos
   */
  static iniciarVerificacionPeriodica() {
    // Ejecutar cada 30 minutos
    setInterval(() => {
      this.notificarMensajesNoLeidos().catch(error => {
        console.error('Error en verificación periódica de mensajes:', error);
      });
    }, 30 * 60 * 1000);

    console.log('📬 Verificación periódica de mensajes no leídos iniciada (cada 30 minutos)');
  }
}