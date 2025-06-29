import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Ingresos Extras',
    description: 'Genera ingresos adicionales con tus habilidades',
    emoji: '💰',
    details: [
      'Fija tus propios precios',
      'Trabaja cuando quieras',
      'Sin límite de ingresos',
      'Pagos directos, sin comisiones'
    ]
  },
  {
    icon: ClockIcon,
    title: 'Horarios Flexibles',
    description: 'Trabaja cuando te conviene, a tu ritmo',
    emoji: '⏰',
    details: [
      'Horarios completamente flexibles',
      'Acepta trabajos según disponibilidad',
      'Ideal para trabajo part-time',
      'Compatibles con otros trabajos'
    ]
  },
  {
    icon: UserGroupIcon,
    title: 'Clientes Verificados',
    description: 'Conecta con miles de Exploradores activos',
    emoji: '👥',
    details: [
      'Acceso a miles de clientes potenciales',
      'Exploradores verificados',
      'Demanda constante',
      'Crecimiento de cartera de clientes'
    ]
  },
  {
    icon: TrophyIcon,
    title: 'Crece Profesionalmente',
    description: 'Desarrolla tu marca personal y reputación',
    emoji: '🏆',
    details: [
      'Construye tu reputación online',
      'Sistema de calificaciones',
      'Perfil profesional destacado',
      'Networking con otros profesionales'
    ]
  }
];

const steps = [
  {
    number: 1,
    title: 'Registrate Gratis',
    description: 'Crea tu cuenta de As en menos de 5 minutos',
    emoji: '📝',
    details: [
      'Registro rápido y sencillo',
      'Verificación de identidad',
      'Completamente gratuito',
      'Soporte durante el proceso'
    ],
    cta: 'Crear Cuenta'
  },
  {
    number: 2,
    title: 'Completa tu Perfil',
    description: 'Muestra tus habilidades y experiencia',
    emoji: '👤',
    details: [
      'Sube fotos de tu trabajo',
      'Describe tu experiencia',
      'Agrega certificaciones',
      'Define tu área de cobertura'
    ],
    cta: 'Ver Ejemplo'
  },
  {
    number: 3,
    title: 'Publica tus Servicios',
    description: 'Crea anuncios atractivos para tus servicios',
    emoji: '📢',
    details: [
      'Hasta 3 servicios gratis',
      'Fotos y descripciones detalladas',
      'Precios competitivos',
      'Servicios ilimitados con plan premium'
    ],
    cta: 'Ver Plantillas'
  },
  {
    number: 4,
    title: 'Recibe Contactos',
    description: 'Los Exploradores te contactan directamente',
    emoji: '📞',
    details: [
      'Notificaciones instantáneas',
      'Chat directo con clientes',
      'Intercambio de contactos',
      'Coordina trabajos fácilmente'
    ],
    cta: 'Empezar Ahora'
  }
];

const testimonials = [
  {
    name: 'María González',
    profession: 'Limpieza del Hogar',
    image: '👩‍🏭',
    rating: 5,
    review: 'En 6 meses conseguí más de 40 clientes fijos. Serviplay cambió mi vida, ahora trabajo para mí misma.',
    earnings: '$35,000/mes',
    location: 'Palermo, CABA'
  },
  {
    name: 'Carlos Martínez',
    profession: 'Plomero',
    image: '👨‍🔧',
    rating: 5,
    review: 'Los trabajos de emergencia me dan muy buenos ingresos. Los clientes siempre vuelven a contactarme.',
    earnings: '$45,000/mes',
    location: 'Villa Urquiza, CABA'
  },
  {
    name: 'Ana Rodríguez',
    profession: 'Programadora',
    image: '👩‍💻',
    rating: 5,
    review: 'Trabajo desde casa para clientes de todo el país. Perfecta para mi estilo de vida freelance.',
    earnings: '$80,000/mes',
    location: 'Trabajo remoto'
  }
];

const faqs = [
  {
    question: '¿Cuánto cuesta ser As en Serviplay?',
    answer: 'Registrarse y usar el plan básico es completamente gratuito. Puedes publicar hasta 3 servicios sin costo. Los planes premium son opcionales y te dan mayor visibilidad.'
  },
  {
    question: '¿Cómo recibo los pagos?',
    answer: 'Los pagos se realizan directamente entre vos y el Explorador. Serviplay no cobra comisiones. Podés acordar efectivo, transferencia o el método que prefieras.'
  },
  {
    question: '¿Necesito experiencia previa?',
    answer: 'No necesitas experiencia previa para registrarte, pero sí conocimientos en el servicio que quieras ofrecer. Los clientes valoran la calidad y profesionalismo.'
  },
  {
    question: '¿Puedo trabajar en varias categorías?',
    answer: 'Sí, podés ofrecer servicios en múltiples categorías. Muchos Ases exitosos combinan diferentes habilidades para maximizar sus ingresos.'
  },
  {
    question: '¿Cómo me destacaco entre otros Ases?',
    answer: 'Completa tu perfil al 100%, sube fotos de calidad, responde rápido a consultas, y mantén buenas calificaciones. El plan premium también te da más visibilidad.'
  },
  {
    question: '¿Hay soporte si tengo problemas?',
    answer: 'Sí, tenemos un equipo de soporte dedicado para Ases. Te ayudamos con cualquier duda sobre la plataforma o resolución de conflictos.'
  }
];

export default function BecomeAs() {
  const router = useRouter();
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>Convertite en As - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Monetiza tus habilidades y conecta con miles de clientes en Serviplay" />
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
                  Ya soy As
                </Link>
                <Link href="/auth/register?tipo=as" className="px-6 py-2 bg-secondary-green text-white rounded-full hover:bg-green-600 transition-colors">
                  Empezar Ahora
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
              Convertite en <span className="text-secondary-green">{BRAND_TERMS.AS}</span>
              <div className="mt-4 text-4xl">⭐✨</div>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Transforma tus habilidades en ingresos. Conecta con miles de {BRAND_TERMS.EXPLORADORES} 
              que necesitan exactamente lo que vos ofrecés.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth/register?tipo=as')}
                className="px-8 py-4 bg-secondary-green text-white rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span>Registrarme Gratis</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
              
              <Link
                href="/how-it-works"
                className="px-8 py-4 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors flex items-center space-x-2"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Ver Cómo Funciona</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-secondary-green">1,200+</div>
                <div className="text-sm text-neutral-600">{BRAND_TERMS.ASES} activos</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-primary-blue">15,000+</div>
                <div className="text-sm text-neutral-600">{BRAND_TERMS.EXPLORADORES} registrados</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-secondary-orange">$25,000</div>
                <div className="text-sm text-neutral-600">Ingreso promedio mensual</div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <div className="mb-20">
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              ¿Por Qué Ser {BRAND_TERMS.AS}? 🤔
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-4">{benefit.emoji}</div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 mb-4 text-sm">
                    {benefit.description}
                  </p>
                  
                  <div className="space-y-2">
                    {benefit.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-secondary-green flex-shrink-0" />
                        <span className="text-xs text-neutral-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Steps Section */}
          <div className="mb-20">
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              Cómo Empezar en 4 Pasos 🚀
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Step Number */}
                    <div className="w-12 h-12 bg-secondary-green rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step.number}
                    </div>

                    {/* Step Icon */}
                    <div className="text-4xl mb-4">{step.emoji}</div>

                    {/* Step Content */}
                    <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 mb-4 text-sm">
                      {step.description}
                    </p>

                    {/* Step Details */}
                    <div className="space-y-2 mb-6">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-secondary-green rounded-full"></div>
                          <span className="text-xs text-neutral-600">{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => router.push('/auth/register?tipo=as')}
                      className="w-full px-4 py-2 bg-secondary-green/10 text-secondary-green rounded-lg font-medium hover:bg-secondary-green/20 transition-colors text-sm"
                    >
                      {step.cta}
                    </button>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-neutral-300 transform -translate-y-1/2"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <h2 className="font-display text-3xl font-bold text-center text-neutral-900 mb-12">
              Historias de Éxito Reales 💪
            </h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl cursor-pointer transition-all ${
                      selectedTestimonial === index
                        ? 'bg-secondary-green/10 border-2 border-secondary-green'
                        : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                    onClick={() => setSelectedTestimonial(index)}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{testimonial.image}</div>
                      <h3 className="font-semibold text-neutral-900">{testimonial.name}</h3>
                      <p className="text-sm text-neutral-600">{testimonial.profession}</p>
                      <div className="flex justify-center mt-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary-green mb-1">
                        {testimonial.earnings}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-neutral-50 rounded-xl">
                <p className="text-neutral-700 italic text-center">
                  "{testimonials[selectedTestimonial].review}"
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
                <div key={index} className="bg-white rounded-lg border border-neutral-200">
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
            className="text-center bg-gradient-to-r from-secondary-green to-green-600 rounded-2xl p-12 text-white"
          >
            <AnimatedStatus 
              emoji="🎯" 
              text="¡Tu Momento es Ahora!"
              subtext="Más de 1000 Ases ya están ganando dinero en Serviplay"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/auth/register?tipo=as"
                className="px-8 py-4 bg-white text-secondary-green rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Registrarme Gratis Ahora
              </Link>
              <Link
                href="/categories"
                className="px-8 py-4 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Ver Todas las Categorías
              </Link>
            </div>
            
            <p className="text-green-100 text-sm mt-4">
              Sin costo inicial • Sin comisiones • Sin permanencia
            </p>
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