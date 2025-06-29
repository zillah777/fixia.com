import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  CogIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Primeros Pasos',
    icon: BookOpenIcon,
    emoji: '🚀',
    description: 'Todo lo que necesitas saber para comenzar',
    color: 'blue',
    articles: 8
  },
  {
    id: 'for-explorers',
    title: 'Para Exploradores',
    icon: MagnifyingGlassIcon,
    emoji: '🧭',
    description: 'Guías para encontrar y contratar servicios',
    color: 'green',
    articles: 12
  },
  {
    id: 'for-ases',
    title: 'Para Ases',
    icon: StarIcon,
    emoji: '⭐',
    description: 'Cómo ser exitoso ofreciendo servicios',
    color: 'purple',
    articles: 15
  },
  {
    id: 'account-settings',
    title: 'Cuenta y Configuración',
    icon: CogIcon,
    emoji: '⚙️',
    description: 'Gestiona tu cuenta y configuraciones',
    color: 'gray',
    articles: 10
  },
  {
    id: 'payments-billing',
    title: 'Pagos y Facturación',
    icon: CreditCardIcon,
    emoji: '💳',
    description: 'Información sobre planes y pagos',
    color: 'yellow',
    articles: 6
  },
  {
    id: 'safety-security',
    title: 'Seguridad',
    icon: ShieldCheckIcon,
    emoji: '🛡️',
    description: 'Mantén tu cuenta y datos seguros',
    color: 'red',
    articles: 9
  },
  {
    id: 'troubleshooting',
    title: 'Solución de Problemas',
    icon: ExclamationTriangleIcon,
    emoji: '🔧',
    description: 'Resuelve problemas técnicos comunes',
    color: 'orange',
    articles: 7
  },
  {
    id: 'community',
    title: 'Comunidad',
    icon: UserGroupIcon,
    emoji: '👥',
    description: 'Normas y buenas prácticas de la comunidad',
    color: 'indigo',
    articles: 5
  }
];

const popularFaqs = [
  {
    question: '¿Cómo me registro en Serviplay?',
    answer: 'Puedes registrarte haciendo clic en "Registrarse" en la parte superior derecha. Elige si quieres ser Explorador (buscar servicios) o As (ofrecer servicios). Solo necesitas email y algunos datos básicos para comenzar.',
    category: 'getting-started',
    views: 1250
  },
  {
    question: '¿Serviplay cobra comisiones?',
    answer: 'Serviplay es gratuito para Exploradores. Los Ases requieren una suscripción mensual mínima de $2900 para publicar servicios. No cobramos comisiones sobre los pagos entre As y Explorador.',
    category: 'payments-billing',
    views: 980
  },
  {
    question: '¿Cómo verifico mi identidad?',
    answer: 'Ve a tu perfil y haz clic en "Verificar identidad". Necesitarás una foto de tu DNI, pasaporte o cédula, y seguir el proceso de verificación facial. La verificación suele completarse en 24-48 horas.',
    category: 'account-settings',
    views: 875
  },
  {
    question: '¿Qué hago si tengo un problema con un servicio?',
    answer: 'Primero intenta resolver el problema directamente con la otra persona. Si no es posible, usa el botón "Reportar" en el perfil o conversación. Nuestro equipo de soporte mediará en la situación.',
    category: 'troubleshooting',
    views: 720
  },
  {
    question: '¿Cómo cambio mi plan de suscripción?',
    answer: 'Ve a Configuración > Suscripción en tu perfil. Allí puedes hacer upgrade, downgrade o cancelar tu plan. Los cambios se aplican inmediatamente y la facturación se ajusta proporcionalmente.',
    category: 'payments-billing',
    views: 650
  },
  {
    question: '¿Puedo ser As y Explorador al mismo tiempo?',
    answer: 'Sí, puedes tener ambos roles en la misma cuenta. Muchos usuarios ofrecen algunos servicios y también contratan otros cuando los necesitan. Puedes cambiar entre roles fácilmente.',
    category: 'getting-started',
    views: 540
  },
  {
    question: '¿Cómo mejoro mi visibilidad como As?',
    answer: 'Completa tu perfil al 100%, sube fotos de calidad, verifica tu identidad, mantén buenas calificaciones, responde rápido a mensajes, y considera un plan premium para aparecer destacado en búsquedas.',
    category: 'for-ases',
    views: 480
  },
  {
    question: '¿Mis datos personales están seguros?',
    answer: 'Sí, usamos encriptación de nivel bancario para proteger tus datos. Tienes control total sobre qué información compartir y puedes configurar tu privacidad en cualquier momento. Cumplimos con todas las normativas de protección de datos.',
    category: 'safety-security',
    views: 420
  }
];

const contactOptions = [
  {
    title: 'Chat en Vivo',
    description: 'Respuesta inmediata',
    icon: ChatBubbleLeftRightIcon,
    emoji: '💬',
    action: 'Iniciar chat',
    available: true,
    responseTime: 'En línea'
  },
  {
    title: 'Email',
    description: 'Respuesta en 4-6 horas',
    icon: EnvelopeIcon,
    emoji: '📧',
    action: 'ayuda@serviplay.com',
    available: true,
    responseTime: '4-6 horas'
  },
  {
    title: 'Teléfono',
    description: 'Lun a Vie 9:00 - 18:00',
    icon: PhoneIcon,
    emoji: '📞',
    action: '+54 11 1234-5678',
    available: true,
    responseTime: 'Horario comercial'
  },
  {
    title: 'Centro de Ayuda',
    description: 'Artículos y guías detalladas',
    icon: BookOpenIcon,
    emoji: '📚',
    action: 'Explorar artículos',
    available: true,
    responseTime: '24/7'
  }
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = popularFaqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Centro de Ayuda - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Encuentra respuestas a todas tus preguntas sobre Serviplay" />
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
                <Link href="/pricing" className="px-5 py-2.5 text-gray-600 hover:text-purple-600 transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Planes
                </Link>
                <Link href="/contact" className="px-5 py-2.5 text-gray-600 hover:text-secondary-green transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Contacto
                </Link>
                <Link href="/security" className="px-5 py-2.5 text-gray-600 hover:text-red-600 transition-colors font-medium rounded-xl hover:bg-gray-100/50">
                  Seguridad
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
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Centro de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ayuda</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              ¿Necesitas ayuda? Encontrá respuestas rápidas a tus preguntas o contactá a nuestro equipo de soporte.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en el centro de ayuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-300 rounded-2xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
            </div>
          </motion.div>

          {/* Help Categories */}
          <div className="mb-20">
            <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-12">
              Explorar por Categoría
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                    selectedCategory === category.id 
                      ? 'border-blue-500 shadow-blue-500/25' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-4">{category.emoji}</div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{category.articles} artículos</span>
                    <span className="text-blue-600 font-medium">Ver más →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-3xl font-bold text-gray-900">
                Preguntas Frecuentes
              </h2>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  {helpCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">{faq.views} visualizaciones</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {helpCategories.find(cat => cat.id === faq.category)?.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-2xl ml-4">
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
                      
                      <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span className="text-sm">Útil</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-600 transition-colors">
                          <span className="text-sm">¿Necesitas más ayuda?</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-gray-600 mb-6">
                  Intentá con otros términos de búsqueda o contactá a nuestro equipo
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Aún necesitas ayuda?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  <div className="text-3xl mb-4">{option.emoji}</div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {option.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">{option.responseTime}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {option.action}
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white"
          >
            <AnimatedStatus 
              emoji="💡" 
              text="Consejo Pro"
              subtext="Para obtener ayuda más rápida, incluye detalles específicos sobre tu problema y capturas de pantalla si es posible"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-2xl mb-3">📸</div>
                <h3 className="font-semibold mb-2">Incluye capturas</h3>
                <p className="text-purple-100 text-sm">Las imágenes nos ayudan a entender mejor tu problema</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-2xl mb-3">📝</div>
                <h3 className="font-semibold mb-2">Sé específico</h3>
                <p className="text-purple-100 text-sm">Describe paso a paso lo que estás intentando hacer</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2">Respuesta rápida</h3>
                <p className="text-purple-100 text-sm">Nuestro equipo responde en menos de 6 horas</p>
              </div>
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