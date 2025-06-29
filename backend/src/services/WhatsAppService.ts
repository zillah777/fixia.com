export class WhatsAppService {

  static generarMensaje(match: any): string {
    const esServicio = !!match.servicio_titulo;
    const asNombre = match.as_nombre || 'As';
    const exploradorNombre = match.explorador_nombre || 'Explorador';
    
    if (esServicio) {
      return `¡Hola ${asNombre}! 👋

Soy ${exploradorNombre} y me interesa tu servicio "${match.servicio_titulo}".

Vi tu publicación en Serviplay y me gustaría conocer más detalles.

¿Podrías contarme sobre:
- Disponibilidad
- Precio final
- Tiempo estimado

¡Gracias! 😊

_Mensaje enviado desde Serviplay_ 🚀`;
    } else {
      return `¡Hola ${asNombre}! 👋

Soy ${exploradorNombre} y creo que podrías ayudarme con lo que necesito.

Publiqué una búsqueda en Serviplay: "${match.busqueda_titulo}"

${match.busqueda_descripcion}

¿Te interesa? ¡Me gustaría conversar!

Saludos 😊

_Mensaje enviado desde Serviplay_ 🚀`;
    }
  }

  static generarLink(match: any): string {
    const as = match.servicio?.as || match.as;
    const busqueda = match.busqueda;
    const asNombre = as?.nombre || match.as_nombre;
    const telefono = as?.telefono || match.as_telefono;
    
    if (!telefono) {
      throw new Error('Número de teléfono no disponible');
    }
    
    const mensaje = `¡Hola ${asNombre}! 👋

Vi tu servicio de "${match.servicio?.titulo || match.servicio_titulo}" en Serviplay y me interesa.

📋 Lo que necesito: ${busqueda?.titulo || match.busqueda_titulo}
📍 Ubicación: ${busqueda?.direccion_trabajo || match.direccion || 'A coordinar'}
💰 Presupuesto: $${busqueda?.presupuesto_minimo || 0}-${busqueda?.presupuesto_maximo || 'A convenir'}
📅 Para: ${busqueda?.fecha_necesaria ? this.formatearFecha(busqueda.fecha_necesaria) : 'A coordinar'}

¿Podrías ayudarme? ¡Gracias!

_Mensaje enviado desde Serviplay_ 🚀`;
    
    // Limpiar y formatear número
    const numeroLimpio = telefono.replace(/\D/g, '');
    const numeroCompleto = numeroLimpio.startsWith('54') ? numeroLimpio : `54${numeroLimpio}`;
    
    return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje)}`;
  }

  private static formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'A coordinar';
    }
  }

  static generarMensajeProfesional(match: any, mensaje_personalizado?: string): string {
    const base = this.generarMensaje(match);
    
    if (mensaje_personalizado) {
      return `${base}

---
Mensaje personalizado:
${mensaje_personalizado}`;
    }
    
    return base;
  }

  static validarNumeroArgentino(telefono: string): boolean {
    // Regex para números argentinos
    const regex = /^(\+54|54)?[\s\-]?(?:\(?11\)?|[2-9]\d{1,3})[\s\-]?\d{3,4}[\s\-]?\d{4}$/;
    return regex.test(telefono);
  }

  static formatearNumero(telefono: string): string {
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    if (numeroLimpio.length === 10) {
      // Formato: AAAA-NNNNNN (área + número)
      return `${numeroLimpio.slice(0, 4)}-${numeroLimpio.slice(4)}`;
    } else if (numeroLimpio.length === 11 && numeroLimpio.startsWith('11')) {
      // Formato CABA: 11-NNNN-NNNN
      return `${numeroLimpio.slice(0, 2)}-${numeroLimpio.slice(2, 6)}-${numeroLimpio.slice(6)}`;
    }
    
    return telefono; // Devolver original si no coincide con formatos conocidos
  }
}