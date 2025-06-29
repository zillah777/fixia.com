import { PaymentService } from './PaymentService';

interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  baseUrl: string;
}

interface MercadoPagoPaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_approved: string | null;
  date_created: string;
  payment_method_id: string;
  payment_type_id: string;
  payer: {
    id: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata: Record<string, any>;
  notification_url: string;
  external_reference: string;
}

interface MercadoPagoPreferenceRequest {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
    description?: string;
  }>;
  payer: {
    email: string;
    name?: string;
    surname?: string;
    phone?: {
      area_code: string;
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
  external_reference: string;
  metadata: Record<string, any>;
  auto_return: 'approved' | 'all';
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export class MercadoPagoService {
  private static config: MercadoPagoConfig = {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
    baseUrl: process.env.MERCADOPAGO_BASE_URL || 'https://api.mercadopago.com'
  };

  /**
   * Crear preferencia de pago en MercadoPago
   */
  static async crearPreferencia(preferenceData: MercadoPagoPreferenceRequest) {
    try {
      console.log('💳 Creando preferencia en MercadoPago:', preferenceData.external_reference);

      // TODO: Implementar llamada real a MercadoPago API
      if (!this.config.accessToken) {
        console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN no configurado, usando mock');
        return this.createMockPreference(preferenceData);
      }

      // Configurar headers para la API
      const headers = {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${preferenceData.external_reference}-${Date.now()}`
      };

      // TODO: Descomentar cuando se configure MercadoPago real
      /*
      const response = await fetch(`${this.config.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers,
        body: JSON.stringify(preferenceData)
      });

      if (!response.ok) {
        throw new Error(`MercadoPago API error: ${response.status} ${response.statusText}`);
      }

      const preference = await response.json();
      console.log('✅ Preferencia creada en MercadoPago:', preference.id);
      
      return {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      };
      */

      // Por ahora, usar mock
      return this.createMockPreference(preferenceData);

    } catch (error) {
      console.error('Error creando preferencia en MercadoPago:', error);
      throw error;
    }
  }

  /**
   * Obtener información de un pago
   */
  static async obtenerPago(paymentId: string): Promise<MercadoPagoPaymentResponse | null> {
    try {
      console.log(`🔍 Consultando pago ${paymentId} en MercadoPago`);

      if (!this.config.accessToken) {
        console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN no configurado, usando mock');
        return this.createMockPayment(paymentId);
      }

      // TODO: Implementar llamada real a MercadoPago API
      /*
      const response = await fetch(`${this.config.baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`❌ Pago ${paymentId} no encontrado en MercadoPago`);
          return null;
        }
        throw new Error(`MercadoPago API error: ${response.status} ${response.statusText}`);
      }

      const payment = await response.json();
      console.log(`✅ Pago ${paymentId} obtenido:`, payment.status);
      
      return payment;
      */

      // Por ahora, usar mock
      return this.createMockPayment(paymentId);

    } catch (error) {
      console.error(`Error obteniendo pago ${paymentId} de MercadoPago:`, error);
      return null;
    }
  }

  /**
   * Procesar webhook de MercadoPago
   */
  static async procesarWebhook(paymentId: string) {
    try {
      console.log(`📦 Procesando webhook para pago: ${paymentId}`);

      // Obtener información del pago
      const payment = await this.obtenerPago(paymentId);
      
      if (!payment) {
        console.log(`⚠️  No se pudo obtener información del pago ${paymentId}`);
        return { processed: false, reason: 'payment_not_found' };
      }

      // Mapear estado de MercadoPago a nuestro sistema
      const ourStatus = this.mapearEstadoPago(payment.status);

      // Procesar con nuestro PaymentService
      const result = await PaymentService.procesarWebhookMercadoPago(paymentId, ourStatus);

      console.log(`✅ Webhook procesado para pago ${paymentId}: ${ourStatus}`);
      return result;

    } catch (error) {
      console.error(`Error procesando webhook para pago ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Mapear estados de MercadoPago a nuestros estados internos
   */
  private static mapearEstadoPago(mercadoPagoStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'approved': 'approved',
      'pending': 'pending',
      'authorized': 'pending',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'rejected'
    };

    return statusMap[mercadoPagoStatus] || 'pending';
  }

  /**
   * Validar webhook signature (seguridad)
   */
  static validarWebhookSignature(signature: string, requestBody: string): boolean {
    try {
      if (!this.config.webhookSecret) {
        console.warn('⚠️  MERCADOPAGO_WEBHOOK_SECRET no configurado, saltando validación');
        return true; // En desarrollo, permitir sin validación
      }

      // TODO: Implementar validación real de firma
      // const expectedSignature = this.generateWebhookSignature(requestBody);
      // return signature === expectedSignature;

      return true; // Por ahora, siempre válido

    } catch (error) {
      console.error('Error validando signature de webhook:', error);
      return false;
    }
  }

  /**
   * Crear preferencia mock para desarrollo
   */
  private static createMockPreference(preferenceData: MercadoPagoPreferenceRequest) {
    const mockId = `mock_pref_${Date.now()}`;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      id: mockId,
      init_point: `${baseUrl}/mock-payment?preference_id=${mockId}&amount=${preferenceData.items[0].unit_price}`,
      sandbox_init_point: `${baseUrl}/mock-payment?preference_id=${mockId}&amount=${preferenceData.items[0].unit_price}&sandbox=true`,
      external_reference: preferenceData.external_reference,
      metadata: preferenceData.metadata
    };
  }

  /**
   * Crear pago mock para desarrollo
   */
  private static createMockPayment(paymentId: string): MercadoPagoPaymentResponse {
    // Simular diferentes estados para testing
    const mockStatuses = ['approved', 'pending', 'rejected'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return {
      id: paymentId,
      status: randomStatus,
      status_detail: randomStatus === 'approved' ? 'accredited' : 'pending_waiting_payment',
      transaction_amount: 2999,
      currency_id: 'ARS',
      date_approved: randomStatus === 'approved' ? new Date().toISOString() : null,
      date_created: new Date().toISOString(),
      payment_method_id: 'visa',
      payment_type_id: 'credit_card',
      payer: {
        id: 'mock_payer_123',
        email: 'test@ejemplo.com',
        identification: {
          type: 'DNI',
          number: '12345678'
        }
      },
      metadata: {
        usuario_id: 'mock_user_123',
        plan_id: 'profesional'
      },
      notification_url: `${process.env.API_URL}/api/webhooks/mercadopago`,
      external_reference: `subscription_${Date.now()}`
    };
  }

  /**
   * Crear suscripción recurrente
   */
  static async crearSuscripcion(subscriptionData: any) {
    try {
      console.log('📅 Creando suscripción recurrente en MercadoPago');

      // TODO: Implementar suscripciones recurrentes con MercadoPago
      if (!this.config.accessToken) {
        console.warn('⚠️  Suscripciones recurrentes requieren configuración de MercadoPago');
        return null;
      }

      // Placeholder para suscripciones recurrentes
      return {
        id: `mock_subscription_${Date.now()}`,
        status: 'active',
        frequency: 1,
        frequency_type: 'months'
      };

    } catch (error) {
      console.error('Error creando suscripción en MercadoPago:', error);
      throw error;
    }
  }

  /**
   * Cancelar suscripción recurrente
   */
  static async cancelarSuscripcion(subscriptionId: string) {
    try {
      console.log(`🚫 Cancelando suscripción ${subscriptionId} en MercadoPago`);

      // TODO: Implementar cancelación de suscripciones
      return { success: true, cancelled_at: new Date().toISOString() };

    } catch (error) {
      console.error('Error cancelando suscripción en MercadoPago:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración actual
   */
  static obtenerConfiguracion() {
    return {
      configured: !!this.config.accessToken,
      has_public_key: !!this.config.publicKey,
      has_webhook_secret: !!this.config.webhookSecret,
      base_url: this.config.baseUrl,
      environment: this.config.accessToken.includes('TEST') ? 'sandbox' : 'production'
    };
  }

  /**
   * Actualizar configuración
   */
  static actualizarConfiguracion(newConfig: Partial<MercadoPagoConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️  Configuración de MercadoPago actualizada');
  }
}