import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';

const steps = [
  {
    id: 1,
    title: 'Creá tu cuenta',
    description: 'Registrate como Explorador para buscar servicios o como As para ofrecerlos',
    emoji: '👤',
    details: [
      'Registro rápido y gratuito',
      'Verificación de email',
      'Perfil personalizable',
      'Sin costos ocultos'
    ],
    forExplorers: 'Los Exploradores siempre usan Serviplay gratis',
    forAses: 'Los Ases pueden comenzar con plan gratuito',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 2,
    title: 'Buscá o Publicá',
    description: 'Explorá servicios disponibles o publicá los tuyos propios',
    emoji: '🔍',
    details: [
      'Filtros por ubicación y categoría',
      'Búsqueda inteligente',
      'Servicios verificados',
      'Precios transparentes'
    ],
    forExplorers: 'Buscá por categoría, ubicación y presupuesto',
    forAses: 'Publicá tus servicios con fotos y descripción detallada',
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 3,
    title: 'Conectá Directo',
    description: 'Contactá directamente sin intermediarios ni comisiones',
    emoji: '🤝',
    details: [
      'Chat directo en la plataforma',
      'Intercambio de contactos',
      'Sin comisiones en pagos',
      'Acuerdo directo de precios'
    ],
    forExplorers: 'Chateá con varios Ases para comparar y elegir',
    forAses: 'Recibí consultas directamente de Exploradores interesados',
    color: 'from-secondary-green to-primary-blue'
  },
  {
    id: 4,
    title: 'Calificá la Experiencia',
    description: 'Dejá tu reseña para ayudar a la comunidad',
    emoji: '⭐',
    details: [
      'Sistema de calificaciones honesto',
      'Reseñas verificadas',
      'Mejora continua del servicio',
      'Construcción de reputación'
    ],
    forExplorers: 'Tu opinión ayuda a otros Exploradores a elegir mejor',
    forAses: 'Las buenas reseñas aumentan tu visibilidad',
    color: 'from-primary-blue to-secondary-green'
  }
];

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Ases Verificados',
    description: 'Todos los Ases pasan por un proceso de verificación',
    emoji: '🛡️',
    benefits: ['Identidad verificada', 'Documentación validada', 'Historial limpio']
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Sin Comisiones',
    description: 'El pago se hace directamente entre As y Explorador',
    emoji: '💸',
    benefits: ['0% de comisión', 'Precios justos', 'Acuerdo directo']
  },
  {
    icon: ClockIcon,
    title: 'Disponibilidad 24/7',
    description: 'Servicios disponibles todos los días, incluso urgencias',
    emoji: '⏰',
    benefits: ['Servicios de emergencia', 'Horarios flexibles', 'Respuesta rápida']
  },
  {
    icon: UserGroupIcon,
    title: 'Comunidad Activa',
    description: 'Miles de Ases y Exploradores conectando diariamente',
    emoji: '👥',
    benefits: ['Red amplia', 'Variedad de servicios', 'Confianza mutua']
  }
];

const faqs = [
  {
    question: '¿Serviplay cobra comisiones?',
    answer: 'No, Serviplay es completamente gratuito para Exploradores. Los Ases pueden usar el plan básico gratis o elegir planes premium para mayor visibilidad. No cobramos comisiones sobre los pagos.'
  },
  {
    question: '¿Cómo funciona el sistema de verificación?',
    answer: 'Todos los Ases deben verificar su identidad con documento oficial. Además, validamos números de teléfono y emails. Los Ases con matrículas profesionales pueden mostrar sus credenciales.'
  },
  {
    question: '¿Puedo contratar servicios fuera de mi ciudad?',
    answer: 'Sí, muchos servicios como programación, diseño, consultoría, etc. se pueden realizar de forma remota. Los servicios presenciales dependen de la zona de cobertura del As.'
  },
  {
    question: '¿Qué pasa si hay un problema con el servicio?',
    answer: 'Tenemos un sistema de mediación y soporte. Podés reportar problemas a través de nuestro Centro de Ayuda. Las calificaciones y reseñas ayudan a mantener la calidad.'
  },
  {
    question: '¿Los precios son fijos?',
    answer: 'Los Ases publican rangos de precios orientativos. El precio final se acuerda directamente entre As y Explorador según las necesidades específicas del trabajo.'
  },
  {
    question: '¿Puedo ser As y Explorador al mismo tiempo?',
    answer: 'Sí, podés tener ambos roles en la misma cuenta. Muchos usuarios ofrecen servicios y también contratan otros cuando los necesitan.'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [userType, setUserType] = useState<'explorer' | 'as'>('explorer');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>Cómo Funciona - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Descubre cómo funciona Serviplay y conecta con los mejores servicios cerca de ti" />
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
                <Link href="/pricing" className="px-4 py-2 text-neutral-600 hover:text-purple-600 transition-colors">
                  Planes
                </Link>
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
              ¿Cómo Funciona {APP_CONFIG.NAME}?
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Conectamos {BRAND_TERMS.ASES} con {BRAND_TERMS.EXPLORADORES} de forma simple, 
              directa y sin comisiones. Descubrí cómo en 4 pasos.
            </p>

            {/* User Type Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <button
                onClick={() => setUserType('explorer')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  userType === 'explorer'
                    ? 'bg-primary-blue text-white shadow-lg'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                🧭 Soy {BRAND_TERMS.EXPLORADOR}
              </button>
              <button
                onClick={() => setUserType('as')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  userType === 'as'
                    ? 'bg-secondary-green text-white shadow-lg'
                    : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                ⭐ Soy {BRAND_TERMS.AS}
              </button>
            </div>
          </motion.div>

          {/* Steps Process */}
          <div className="mb-20">
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              El Proceso Paso a Paso
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative cursor-pointer ${
                    activeStep === step.id ? 'scale-105' : 'hover:scale-102'
                  } transition-transform`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className={`bg-white rounded-2xl p-6 border-2 ${
                    activeStep === step.id 
                      ? 'border-primary-blue shadow-lg shadow-primary-blue/25' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  } transition-all`}>
                    {/* Step Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 ${
                      activeStep === step.id
                        ? 'bg-primary-blue text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {step.id}
                    </div>

                    {/* Step Icon */}
                    <div className="text-4xl mb-4">{step.emoji}</div>

                    {/* Step Content */}
                    <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-neutral-300 transform -translate-y-1/2"></div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Active Step Detail */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                    {steps[activeStep - 1]?.title}
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    {steps[activeStep - 1]?.description}
                  </p>
                  
                  <div className="space-y-3">
                    {steps[activeStep - 1]?.details.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-neutral-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`p-4 rounded-lg ${
                    userType === 'explorer' ? 'bg-blue-50 border-l-4 border-primary-blue' : 'bg-neutral-50'
                  }`}>
                    <h4 className="font-semibold text-primary-blue mb-2">
                      🧭 Para {BRAND_TERMS.EXPLORADORES}:
                    </h4>
                    <p className="text-neutral-700 text-sm">
                      {steps[activeStep - 1]?.forExplorers}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    userType === 'as' ? 'bg-green-50 border-l-4 border-secondary-green' : 'bg-neutral-50'
                  }`}>
                    <h4 className="font-semibold text-secondary-green mb-2">
                      ⭐ Para {BRAND_TERMS.ASES}:
                    </h4>
                    <p className="text-neutral-700 text-sm">
                      {steps[activeStep - 1]?.forAses}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              ¿Por Qué Elegir {APP_CONFIG.NAME}?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-4">{feature.emoji}</div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 mb-4 text-sm">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
                        <span className="text-xs text-neutral-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary-blue to-primary-blue-dark rounded-2xl p-12 text-center text-white mb-20"
          >
            <h2 className="font-display text-3xl font-bold mb-6">
              Casos de Éxito Reales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="font-semibold mb-2">María - Limpieza</h3>
                <p className="text-primary-blue-light text-sm">
                  "Conseguí 50+ clientes en 3 meses. Los Exploradores valoran mi trabajo y siempre vuelven."
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">💻</div>
                <h3 className="font-semibold mb-2">Juan - Programador</h3>
                <p className="text-primary-blue-light text-sm">
                  "Trabajo con empresas de toda Argentina desde mi casa. Serviplay me conectó con proyectos increíbles."
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-semibold mb-2">Carlos - Plomero</h3>
                <p className="text-primary-blue-light text-sm">
                  "Atiendo emergencias 24hs. Los Exploradores me encuentran rápido cuando me necesitan."
                </p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              Preguntas Frecuentes 🤔
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900">{faq.question}</span>
                    <span className="text-neutral-400 text-xl">
                      {expandedFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-neutral-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-white rounded-2xl p-12 shadow-xl"
          >
            <AnimatedStatus 
              emoji="🚀" 
              text="¿Listo para comenzar?"
              subtext="Únete a miles de usuarios que ya están conectando en Serviplay"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/explore"
                className="px-8 py-4 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors"
              >
                🧭 Explorar Servicios
              </Link>
              <Link
                href="/auth/register?tipo=as"
                className="px-8 py-4 bg-secondary-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ⭐ Convertirme en As
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