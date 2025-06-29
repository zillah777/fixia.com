import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  LightBulbIcon,
  UserGroupIcon,
  GlobeAmericasIcon,
  TrophyIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';

const values = [
  {
    icon: HeartIcon,
    title: 'Conexión Humana',
    description: 'Creemos en el poder de las conexiones genuinas entre personas',
    emoji: '❤️',
    details: 'Facilitamos encuentros auténticos entre profesionales y clientes, priorizando la confianza y el respeto mutuo.'
  },
  {
    icon: LightBulbIcon,
    title: 'Innovación',
    description: 'Desarrollamos tecnología que simplifica la vida de las personas',
    emoji: '💡',
    details: 'Utilizamos algoritmos inteligentes y diseño centrado en el usuario para crear experiencias excepcionales.'
  },
  {
    icon: CheckBadgeIcon,
    title: 'Transparencia',
    description: 'Sin comisiones ocultas, sin sorpresas, solo claridad total',
    emoji: '✨',
    details: 'Creemos en la honestidad total: precios claros, procesos transparentes y comunicación directa.'
  },
  {
    icon: UserGroupIcon,
    title: 'Comunidad',
    description: 'Construimos una comunidad donde todos pueden prosperar',
    emoji: '🤝',
    details: 'Fomentamos un ecosistema donde tanto Ases como Exploradores crecen y se apoyan mutuamente.'
  }
];

const stats = [
  {
    number: '15,000+',
    label: 'Usuarios registrados',
    description: 'Exploradores y Ases activos',
    emoji: '👥',
    growth: '+45% mensual'
  },
  {
    number: '1,200+',
    label: 'Ases verificados',
    description: 'Profesionales certificados',
    emoji: '⭐',
    growth: '+30% mensual'
  },
  {
    number: '50,000+',
    label: 'Conexiones exitosas',
    description: 'Servicios completados',
    emoji: '🎯',
    growth: '+60% mensual'
  },
  {
    number: '4.8/5',
    label: 'Calificación promedio',
    description: 'Satisfacción de usuarios',
    emoji: '⭐',
    growth: 'Mejora continua'
  }
];

const timeline = [
  {
    year: '2024',
    title: 'Lanzamiento de Serviplay',
    description: 'Comenzamos con la visión de conectar personas de forma directa y sin comisiones',
    emoji: '🚀',
    milestone: 'Inicio'
  },
  {
    year: '2024',
    title: 'Primeros 1,000 usuarios',
    description: 'Alcanzamos nuestro primer hito importante con usuarios en toda Argentina',
    emoji: '🎉',
    milestone: 'Crecimiento'
  },
  {
    year: '2024',
    title: 'Sistema de verificación',
    description: 'Implementamos verificación de identidad para mayor seguridad',
    emoji: '🛡️',
    milestone: 'Seguridad'
  },
  {
    year: '2024',
    title: 'Expansión nacional',
    description: 'Servicios disponibles en todas las provincias de Argentina',
    emoji: '🌎',
    milestone: 'Expansión'
  }
];

const team = [
  {
    name: 'Mmata',
    role: 'Fundador & CEO',
    description: 'Visionario que creó Serviplay para democratizar el acceso a servicios de calidad',
    emoji: '👨‍💼',
    background: 'Con experiencia en tecnología y emprendimientos, lidera la visión estratégica de la plataforma.',
    linkedin: '#'
  },
  {
    name: 'Equipo de Desarrollo',
    role: 'Tecnología',
    description: 'Desarrolladores apasionados que construyen la mejor experiencia de usuario',
    emoji: '👨‍💻',
    background: 'Especialistas en tecnologías modernas que garantizan una plataforma robusta y escalable.',
    linkedin: '#'
  },
  {
    name: 'Equipo de Soporte',
    role: 'Atención al Cliente',
    description: 'Dedicados a ayudar a nuestra comunidad 24/7',
    emoji: '🎧',
    background: 'Profesionales comprometidos con la satisfacción y seguridad de todos los usuarios.',
    linkedin: '#'
  },
  {
    name: 'Equipo de Seguridad',
    role: 'Seguridad & Confianza',
    description: 'Garantizan la seguridad y confianza en cada interacción',
    emoji: '🔐',
    background: 'Expertos en seguridad digital que protegen la integridad de la plataforma.',
    linkedin: '#'
  }
];


export default function About() {
  const [activeTimelineItem, setActiveTimelineItem] = useState(0);

  return (
    <>
      <Head>
        <title>Sobre Nosotros - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Conoce la historia, misión y equipo detrás de Serviplay" />
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
                  Únete a Nosotros
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
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full px-6 py-3 mb-8">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-blue-800">Nuestra Historia</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-8 px-4">
              Sobre <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{APP_CONFIG.NAME}</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Somos una plataforma argentina que conecta <strong>{BRAND_TERMS.ASES}</strong> con <strong>{BRAND_TERMS.EXPLORADORES}</strong> 
              de forma directa, transparente y sin comisiones. Creemos en el poder de las conexiones humanas genuinas.
            </p>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-primary-blue to-secondary-green rounded-3xl p-12 text-white max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">Nuestra Misión</h2>
              <p className="text-lg sm:text-xl leading-relaxed px-4">
                "Democratizar el acceso a servicios de calidad, empoderando a profesionales independientes 
                y facilitando que las personas encuentren exactamente lo que necesitan, cuando lo necesitan."
              </p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16 px-4">
              Nuestro <span className="text-green-600">Impacto</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="text-4xl mb-4">{stat.emoji}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm sm:text-base text-gray-600 mb-3">{stat.description}</div>
                  <div className="inline-flex items-center space-x-1 text-green-600 text-sm font-medium">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span>{stat.growth}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16 px-4">
              Nuestros <span className="text-purple-600">Valores</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="text-4xl">{value.emoji}</div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
                      {value.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-base sm:text-lg">
                    {value.description}
                  </p>
                  
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {value.details}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16 px-4">
              Nuestra <span className="text-blue-600">Historia</span>
            </h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="text-2xl mb-3">{item.emoji}</div>
                        <div className="text-sm font-bold text-blue-600 mb-1">{item.milestone}</div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline Dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                      <div className="absolute -top-2 -left-2 w-10 h-10 bg-blue-100 rounded-full animate-pulse opacity-75"></div>
                    </div>
                    
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8 text-right'}`}>
                      <div className="text-3xl font-bold text-gray-300">{item.year}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16 px-4">
              Nuestro <span className="text-secondary-green">Equipo</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-4">{member.emoji}</div>
                  
                  <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  
                  <div className="text-sm sm:text-base font-medium text-blue-600 mb-3">
                    {member.role}
                  </div>
                  
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    {member.description}
                  </p>
                  
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {member.background}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>


          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-primary-blue to-secondary-green rounded-3xl p-12 text-white"
          >
            <AnimatedStatus 
              emoji="🚀" 
              text="¿Listo para ser parte de la revolución?"
              subtext="Únete a miles de usuarios que ya están transformando la forma de conectar servicios"
              theme="dark"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 px-4">
              <Link
                href="/auth/register"
                className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-blue-600 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl text-center"
              >
                Únete a Nosotros
              </Link>
              <Link
                href="/contact"
                className="px-6 sm:px-10 py-3 sm:py-4 border-2 border-white text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                Contáctanos
              </Link>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-blue-100">
                📍 Buenos Aires, Argentina • 📧 hola@serviplay.com • 📞 +54 11 1234-5678
              </p>
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