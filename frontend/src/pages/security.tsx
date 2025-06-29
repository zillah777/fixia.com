import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';

const securityFeatures = [
  {
    icon: ShieldCheckIcon,
    title: 'Verificación de Identidad',
    description: 'Todos los Ases deben verificar su identidad con documento oficial',
    emoji: '🆔',
    details: [
      'Validación de DNI, Pasaporte o Cédula',
      'Verificación facial en tiempo real',
      'Validación de datos con registros oficiales',
      'Badge de verificado para Ases autenticados'
    ],
    status: 'active'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Verificación Profesional',
    description: 'Validamos títulos, certificaciones y matrículas profesionales',
    emoji: '🎓',
    details: [
      'Validación de títulos universitarios',
      'Verificación de matrículas profesionales',
      'Certificaciones de organismos oficiales',
      'Antecedentes penales para servicios sensibles'
    ],
    status: 'active'
  },
  {
    icon: PhoneIcon,
    title: 'Contacto Verificado',
    description: 'Todos los números de teléfono y emails son verificados',
    emoji: '📱',
    details: [
      'Verificación por SMS de números telefónicos',
      'Confirmación de email con doble verificación',
      'Monitoreo de contactos duplicados o fraudulentos',
      'Sistema de reputación basado en interacciones'
    ],
    status: 'active'
  },
  {
    icon: LockClosedIcon,
    title: 'Protección de Datos',
    description: 'Tus datos están protegidos con encriptación de nivel bancario',
    emoji: '🔐',
    details: [
      'Encriptación SSL/TLS en todas las comunicaciones',
      'Almacenamiento seguro con AES-256',
      'Cumplimiento con normativas de privacidad',
      'Auditorías de seguridad regulares'
    ],
    status: 'active'
  },
  {
    icon: EyeSlashIcon,
    title: 'Privacidad Garantizada',
    description: 'Control total sobre qué información compartir y con quién',
    emoji: '👁️',
    details: [
      'Configuración granular de privacidad',
      'Opción de perfil público o privado',
      'Control sobre visibilidad de datos personales',
      'Derecho al olvido y eliminación de datos'
    ],
    status: 'active'
  },
  {
    icon: BellIcon,
    title: 'Sistema de Reportes',
    description: 'Reporta comportamientos sospechosos o inapropiados fácilmente',
    emoji: '🚨',
    details: [
      'Botón de reporte en cada perfil y conversación',
      'Investigación inmediata de reportes',
      'Equipo especializado en seguridad 24/7',
      'Medidas disciplinarias efectivas'
    ],
    status: 'active'
  }
];

const safetyTips = [
  {
    title: 'Para Exploradores',
    emoji: '🧭',
    tips: [
      'Siempre verifica que el As tenga badge de verificado',
      'Lee las reseñas y calificaciones antes de contratar',
      'Comunícate a través de la plataforma inicialmente',
      'Nunca pagues por adelantado el 100% del servicio',
      'Reporta cualquier comportamiento sospechoso',
      'Confía en tu instinto - si algo no se siente bien, cancela'
    ]
  },
  {
    title: 'Para Ases',
    emoji: '⭐',
    tips: [
      'Completa tu verificación de identidad al 100%',
      'Sube fotos reales de tu trabajo y perfil',
      'Responde mensajes de forma profesional y clara',
      'Establece precios y condiciones claras desde el inicio',
      'Nunca solicites pagos fuera de lo acordado',
      'Mantén evidencia de trabajos realizados (fotos, facturas)'
    ]
  }
];

const reportReasons = [
  {
    icon: ExclamationTriangleIcon,
    title: 'Comportamiento Inapropiado',
    description: 'Lenguaje ofensivo, acoso o discriminación',
    color: 'red'
  },
  {
    icon: CreditCardIcon,
    title: 'Fraude o Estafa',
    description: 'Solicitudes de dinero sospechosas o servicios falsos',
    color: 'green'
  },
  {
    icon: UserGroupIcon,
    title: 'Perfil Falso',
    description: 'Información falsa o suplantación de identidad',
    color: 'yellow'
  },
  {
    icon: LockClosedIcon,
    title: 'Problema de Seguridad',
    description: 'Vulnerabilidades o problemas técnicos de seguridad',
    color: 'purple'
  }
];

const faqSecurity = [
  {
    question: '¿Cómo verifica Serviplay la identidad de los Ases?',
    answer: 'Utilizamos un proceso de verificación en múltiples etapas que incluye validación de documento oficial con tecnología de reconocimiento facial, verificación de datos con registros públicos, y validación de contacto por SMS y email. Solo los Ases que pasan todas las verificaciones reciben el badge de verificado.'
  },
  {
    question: '¿Qué hago si tengo un problema con un As o Explorador?',
    answer: 'Puedes reportar cualquier problema usando el botón de reporte disponible en cada perfil y conversación. Nuestro equipo de seguridad investiga todos los reportes en menos de 24 horas y toma las medidas necesarias, que pueden incluir advertencias, suspensión temporal o eliminación permanente de la plataforma.'
  },
  {
    question: '¿Mis datos personales están seguros?',
    answer: 'Sí, protegemos tus datos con encriptación de nivel bancario (AES-256), cumplimos con todas las normativas de privacidad, y realizamos auditorías de seguridad regulares. Además, tienes control total sobre qué información compartir y puedes configurar tu privacidad en cualquier momento.'
  },
  {
    question: '¿Serviplay garantiza la calidad de los servicios?',
    answer: 'Serviplay facilita la conexión entre Ases y Exploradores, pero no garantiza la calidad del servicio ya que somos una plataforma de conexión. Sin embargo, tenemos sistemas de calificaciones, verificación de identidad, y un equipo de soporte para resolver disputas y mantener estándares de calidad.'
  },
  {
    question: '¿Qué medidas hay contra perfiles falsos?',
    answer: 'Tenemos múltiples sistemas anti-fraude: verificación obligatoria de identidad, validación de teléfono y email, detección automática de perfiles duplicados, monitoreo de comportamientos sospechosos, y un sistema de reportes comunitario. Los perfiles falsos son eliminados inmediatamente.'
  },
  {
    question: '¿Cómo maneja Serviplay los pagos de forma segura?',
    answer: 'Los pagos se realizan directamente entre As y Explorador, Serviplay no procesa pagos de servicios. Los Ases solo pagan una suscripción mensual para acceder a la plataforma. Recomendamos usar métodos de pago seguros como transferencias bancarias o efectivo contra entrega.'
  }
];

export default function Security() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [reportFormOpen, setReportFormOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Seguridad - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Conoce todas las medidas de seguridad y protección que implementamos en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-display text-2xl font-bold text-gray-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/help" className="px-5 py-2.5 text-gray-600 hover:text-primary-blue transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Centro de Ayuda
                </Link>
                <Link href="/pricing" className="px-5 py-2.5 text-gray-600 hover:text-purple-600 transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Planes
                </Link>
                <Link href="/contact" className="px-5 py-2.5 text-gray-600 hover:text-secondary-green transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Contacto
                </Link>
                <Link href="/auth/register" className="px-8 py-3 bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white rounded-full font-semibold hover:shadow-xl hover:shadow-primary-blue/25 transition-all duration-300 transform hover:scale-105">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-green-100 border border-green-200 rounded-full px-6 py-3 mb-8">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Plataforma Segura y Verificada</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Tu <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Seguridad</span> es Nuestra Prioridad
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Implementamos las medidas de seguridad más avanzadas para proteger a nuestra comunidad de 
              <strong> {BRAND_TERMS.ASES} y {BRAND_TERMS.EXPLORADORES}</strong>. Tu tranquilidad es nuestro compromiso.
            </p>

            {/* Security Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">99.8%</div>
                <div className="text-sm text-gray-600">Ases verificados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Monitoreo de seguridad</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">&lt;1h</div>
                <div className="text-sm text-gray-600">Respuesta a reportes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">0%</div>
                <div className="text-sm text-gray-600">Tolerancia a fraudes</div>
              </div>
            </div>
          </motion.div>

          {/* Security Features */}
          <div className="mb-24">
            <h2 className="font-display text-4xl font-bold text-center text-gray-900 mb-16">
              Nuestras Medidas de <span className="text-green-600">Seguridad</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 border border-gray-100"
                >
                  <div className="text-4xl mb-6">{feature.emoji}</div>
                  
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Activo</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-display text-4xl font-bold text-center text-gray-900 mb-16">
              Consejos de <span className="text-blue-600">Seguridad</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {safetyTips.map((section, index) => (
                <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="text-3xl">{section.emoji}</div>
                    <h3 className="font-display text-2xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {section.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">{idx + 1}</span>
                        </div>
                        <span className="text-gray-700 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Report System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24 bg-gradient-to-r from-primary-blue to-secondary-green rounded-3xl p-12 text-white"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold mb-6">
                Sistema de Reportes 🚨
              </h2>
              <p className="text-xl text-red-100 max-w-3xl mx-auto">
                Si encuentras algo sospechoso o inapropiado, repórtalo inmediatamente. 
                Nuestro equipo actúa rápido para mantener la plataforma segura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {reportReasons.map((reason, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <reason.icon className="w-8 h-8 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{reason.title}</h3>
                  <p className="text-sm text-red-100">{reason.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                onClick={() => setReportFormOpen(true)}
                className="px-10 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg hover:bg-red-50 transition-colors shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Reportar Problema
              </motion.button>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-center text-gray-900 mb-16">
              Preguntas Frecuentes sobre <span className="text-purple-600">Seguridad</span>
            </h2>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqSecurity.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                    <span className="text-gray-400 text-2xl">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pb-6"
                    >
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center bg-gray-900 rounded-3xl p-12 text-white"
          >
            <AnimatedStatus 
              emoji="🆘" 
              text="¿Emergencia de Seguridad?"
              subtext="Contáctanos inmediatamente si encuentras una situación que requiere atención urgente"
            />
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
              <Link
                href="/contact"
                className="px-10 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors"
              >
                Contacto de Emergencia
              </Link>
              <Link
                href="mailto:security@serviplay.com"
                className="px-10 py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white hover:text-gray-900 transition-colors"
              >
                security@serviplay.com
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © 2024 {APP_CONFIG.NAME} - Mmata. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}