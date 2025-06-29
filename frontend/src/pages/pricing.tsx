import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';

const plans = [
  {
    id: 'basico',
    name: 'Plan Básico',
    emoji: '🚀',
    price: 2900,
    period: 'por mes',
    description: 'Plan mínimo requerido para publicar servicios en Serviplay',
    color: 'blue',
    popular: true,
    required: true,
    features: [
      { text: 'Hasta 5 servicios publicados', included: true },
      { text: 'Perfil profesional completo', included: true },
      { text: 'Contacto directo con Exploradores', included: true },
      { text: 'Sistema de calificaciones', included: true },
      { text: 'Soporte por email', included: true },
      { text: 'Notificaciones en tiempo real', included: true },
      { text: 'Estadísticas básicas', included: true },
      { text: 'Sin comisiones por servicios', included: true },
      { text: 'Servicios destacados', included: false },
      { text: 'Análisis avanzados', included: false }
    ],
    benefits: [
      'Acceso completo a la plataforma',
      'Sin comisiones adicionales',
      'Conexión directa con clientes'
    ],
    ctaText: 'Comenzar con Plan Básico',
    ctaAction: '/auth/register?tipo=as&plan=basico'
  },
  {
    id: 'profesional',
    name: 'Plan Profesional',
    emoji: '💎',
    price: 4900,
    period: 'por mes',
    description: 'Para Ases que quieren destacar y crecer su negocio',
    color: 'purple',
    popular: false,
    features: [
      { text: 'Todo lo del Plan Básico', included: true },
      { text: 'Servicios ilimitados', included: true },
      { text: 'Perfil destacado en búsquedas', included: true },
      { text: 'Badge de As Profesional', included: true },
      { text: '3 servicios destacados incluidos', included: true },
      { text: 'Estadísticas detalladas', included: true },
      { text: 'Notificaciones prioritarias', included: true },
      { text: 'Aparición en búsquedas prioritarias', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Herramientas de marketing', included: true }
    ],
    benefits: [
      '3x más visibilidad',
      'Herramientas profesionales',
      'Soporte prioritario'
    ],
    ctaText: 'Elegir Plan Profesional',
    ctaAction: '/auth/register?tipo=as&plan=profesional'
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    emoji: '👑',
    price: 7900,
    period: 'por mes',
    description: 'Para Ases establecidos que buscan dominar su mercado',
    color: 'gold',
    popular: false,
    features: [
      { text: 'Todo lo del Plan Profesional', included: true },
      { text: 'Servicios destacados ilimitados', included: true },
      { text: 'Badge de As Premium', included: true },
      { text: 'Análisis de competencia', included: true },
      { text: 'Consultor personal asignado', included: true },
      { text: 'Promociones especiales', included: true },
      { text: 'Acceso anticipado a nuevas funciones', included: true },
      { text: 'Certificación Serviplay', included: true },
      { text: 'Networking exclusivo', included: true },
      { text: 'Revenue insights', included: true }
    ],
    benefits: [
      '5x más visibilidad',
      'Consultor personal',
      'Acceso VIP exclusivo'
    ],
    ctaText: 'Elegir Plan Premium',
    ctaAction: '/auth/register?tipo=as&plan=premium'
  }
];

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes hacer upgrade o downgrade de tu plan cuando quieras. Los cambios se aplican inmediatamente y se ajusta la facturación proporcionalmente.'
  },
  {
    question: '¿Qué pasa si cancelo mi suscripción?',
    answer: 'Si cancelas, mantienes el acceso hasta el final del período pagado. Después, no podrás publicar nuevos servicios hasta renovar la suscripción.'
  },
  {
    question: '¿Hay descuentos por pago anual?',
    answer: 'Sí, ofrecemos 2 meses gratis al pagar anualmente. Esto representa un 15% de descuento en todos los planes pagos.'
  },
  {
    question: '¿Los Exploradores también pagan?',
    answer: 'No, Serviplay es completamente gratuito para los Exploradores. Los Ases requieren una suscripción mensual mínima de $2900 para publicar servicios.'
  },
  {
    question: '¿Puedo facturar mis servicios a través de Serviplay?',
    answer: 'Los pagos se realizan directamente entre As y Explorador. Serviplay facilita el contacto pero no procesa pagos de servicios.'
  }
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPlanPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return billingPeriod === 'yearly' ? Math.round(basePrice * 10) : basePrice;
  };

  const getPlanColor = (color: string) => {
    const colors = {
      neutral: 'border-neutral-200 hover:border-neutral-300',
      blue: 'border-primary-blue shadow-lg shadow-primary-blue/25',
      gold: 'border-yellow-400 shadow-lg shadow-yellow-400/25'
    };
    return colors[color as keyof typeof colors] || colors.neutral;
  };

  const getPlanBadge = (plan: any) => {
    if (plan.popular) {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-semibold">
            ⭐ Más Popular
          </span>
        </div>
      );
    }
    if (plan.id === 'premium') {
      return (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            👑 Premium
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>Precios - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Planes y precios para Ases en Serviplay. Desde gratis hasta premium." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="px-6 py-2 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition-colors">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Planes para {BRAND_TERMS.ASES}
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Para publicar servicios en Serviplay, los {BRAND_TERMS.ASES} requieren una suscripción mensual. 
              Sin comisiones adicionales, solo el costo de anunciar en la plataforma 🚀
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                Mensual
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-primary-blue' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                Anual
              </span>
              {billingPeriod === 'yearly' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  🎉 2 meses gratis!
                </span>
              )}
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl border-2 p-8 ${getPlanColor(plan.color)} transition-all hover:scale-105`}
              >
                {getPlanBadge(plan)}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">{plan.emoji}</div>
                  <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-neutral-900">Gratis</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-neutral-900">
                          ${getPlanPrice(plan.price).toLocaleString()}
                        </span>
                        <span className="text-neutral-600 ml-2">
                          {billingPeriod === 'yearly' ? 'por año' : plan.period}
                        </span>
                      </div>
                    )}
                  </div>

                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Ahorras ${(plan.price * 2).toLocaleString()} al año
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      {feature.included ? (
                        <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-neutral-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-neutral-700' : 'text-neutral-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Benefits Highlights */}
                {plan.benefits && (
                  <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-neutral-900 mb-2">✨ Beneficios clave:</h4>
                    <ul className="space-y-1">
                      {plan.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-sm text-neutral-600">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {/* CTA Button */}
                <Link
                  href={plan.ctaAction}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-primary-blue text-white hover:bg-primary-blue-dark'
                      : plan.id === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enterprise Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white mb-16"
          >
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="font-display text-2xl font-bold mb-4">
              ¿Tienes una empresa o equipo grande?
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Ofrecemos planes empresariales personalizados con descuentos por volumen, 
              gestión centralizada y soporte dedicado para equipos de 10+ Ases.
            </p>
            <Link
              href="/contact?subject=enterprise"
              className="inline-block bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Contactar Ventas Enterprise
            </Link>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              Preguntas Frecuentes 🤔
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg border border-neutral-200">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">{faq.question}</span>
                    <span className="text-neutral-400">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-neutral-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center bg-white rounded-2xl p-12 shadow-xl"
          >
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              ¿Listo para comenzar? 🚀
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Únete a miles de {BRAND_TERMS.ASES} que ya están creciendo con {APP_CONFIG.NAME}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register?tipo=as"
                className="px-8 py-4 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors"
              >
                Comenzar con Plan Básico
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                Ver Cómo Funciona
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 {APP_CONFIG.NAME} - Mmata. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}