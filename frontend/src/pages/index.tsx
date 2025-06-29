import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagnifyingGlassIcon, StarIcon, UserGroupIcon, SparklesIcon, RocketLaunchIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { BRAND_TERMS, APP_CONFIG } from '@/utils/constants';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>{APP_CONFIG.NAME} - {APP_CONFIG.TAGLINE}</title>
        <meta name="description" content="Conecta con los mejores Ases de servicios cerca de ti. Los Exploradores encuentran todo lo que necesitan." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Modern Header with Blur Effect */}
        <motion.header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
              : 'bg-transparent'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {APP_CONFIG.NAME}
                </h1>
              </motion.div>
              
              <div className="flex items-center space-x-1 sm:space-x-3">
                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center space-x-3">
                  <motion.button 
                    onClick={() => router.push('/auth/login')}
                    className="px-5 py-2.5 text-gray-600 hover:text-primary-blue transition-all duration-300 font-medium rounded-xl hover:bg-gray-100/50"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Iniciar Sesión
                  </motion.button>
                  <motion.button 
                    onClick={() => router.push('/pricing')}
                    className="px-5 py-2.5 text-gray-600 hover:text-purple-600 transition-all duration-300 font-medium rounded-xl hover:bg-gray-100/50"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Planes
                  </motion.button>
                  <motion.button 
                    onClick={() => router.push('/contact')}
                    className="px-5 py-2.5 text-gray-600 hover:text-secondary-green transition-all duration-300 font-medium rounded-xl hover:bg-gray-100/50"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Contacto
                  </motion.button>
                  <motion.button 
                    onClick={() => router.push('/pricing')}
                    className="px-3 py-1.5 bg-gradient-to-r from-secondary-green to-primary-blue text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-medium rounded-lg shadow-md hover:shadow-lg text-sm"
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Suscribirse
                  </motion.button>
                </div>
                
                {/* Mobile Navigation */}
                <div className="flex sm:hidden items-center space-x-2 mx-2">
                  <motion.button 
                    onClick={() => router.push('/pricing')}
                    className="px-3 py-1.5 bg-gradient-to-r from-secondary-green to-primary-blue text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Suscribirse
                  </motion.button>
                </div>
                
                {/* Register Button - Always Visible */}
                <motion.button 
                  onClick={() => router.push('/auth/register')}
                  className="px-3 py-1.5 bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 mx-2 text-sm"
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Registrarse
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section with Modern Design */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-white to-secondary-green/5"></div>
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary-blue/10 rounded-full mix-blend-multiply filter blur-xl"
            style={{ y: y1 }}
          ></motion.div>
          <motion.div 
            className="absolute top-40 right-10 w-72 h-72 bg-secondary-green/10 rounded-full mix-blend-multiply filter blur-xl"
            style={{ y: y2 }}
          ></motion.div>
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 mb-8 shadow-lg"
              >
                <SparklesIcon className="w-5 h-5 text-primary-blue" />
                <span className="text-base font-semibold text-gray-700">La plataforma #1 de servicios</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>

              {/* Main Headline */}
              <h2 className="font-display text-4xl sm:text-6xl md:text-8xl font-bold mb-8 leading-tight px-4">
                <span className="bg-gradient-to-r from-gray-900 via-primary-blue to-secondary-green bg-clip-text text-transparent">
                  Conectando
                </span>
                <br />
                <span className="text-primary-blue">{BRAND_TERMS.ASES}</span> y{' '}
                <span className="text-secondary-green">{BRAND_TERMS.EXPLORADORES}</span>
                <motion.div 
                  className="mt-6 text-5xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🤝✨
                </motion.div>
              </h2>
              
              {/* Subtitle */}
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                La plataforma que <strong>conecta</strong> a los mejores y más profesionales con personas que necesitan servicios de calidad. 
                <span className="text-primary-blue font-semibold"> Sin comisiones</span>, <span className="text-secondary-green font-semibold">sin intermediarios</span>, 
                <span className="text-primary-blue font-semibold">solo suscripción mensual</span>.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.button
                  onClick={() => router.push('/categories')}
                  className="group px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary-blue to-primary-blue-dark text-white rounded-2xl text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl hover:shadow-primary-blue/30 transition-all duration-300 flex items-center space-x-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                  <span>Explorar Servicios</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.button>
                
                <motion.button
                  onClick={() => router.push('/pricing')}
                  className="group px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-secondary-green to-primary-blue text-white rounded-2xl text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl hover:shadow-secondary-green/30 transition-all duration-300 flex items-center space-x-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RocketLaunchIcon className="w-6 h-6" />
                  <span>Suscribirse como As</span>
                  <motion.div
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💳
                  </motion.div>
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-blue mb-1">1,200+</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">{BRAND_TERMS.ASES} suscritos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-green mb-1">15K+</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">{BRAND_TERMS.EXPLORADORES} activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-green mb-1">$2900</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Suscripción mensual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-orange mb-1">0%</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Comisiones</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section with Modern Cards */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 px-4">
                ¿Cómo <span className="bg-gradient-to-r from-primary-blue to-secondary-green bg-clip-text text-transparent">funciona</span>?
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4 px-4">
                Si sos el mejor en tu oficio, tu profesión o el trabajo en el que te desempeñes o simplemente buscas una oportunidad de demostrar tu trabajo
              </p>
              <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium px-4">
                Conectamos {BRAND_TERMS.ASES} con {BRAND_TERMS.EXPLORADORES} de forma <strong>inteligente y directa</strong>
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-blue/20 transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-blue to-primary-blue-dark rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MagnifyingGlassIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-blue transition-colors duration-300">
                    Explorá Servicios
                  </h4>
                  
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    Buscá <strong>{BRAND_TERMS.ASES} verificados</strong> cerca tuyo. Filtrá por categoría, precio y distancia con nuestra búsqueda inteligente.
                  </p>
                  
                  {/* Features list */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <ShieldCheckIcon className="w-4 h-4 text-primary-blue" />
                      <span>Profesionales verificados</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <StarIcon className="w-4 h-4 text-primary-blue" />
                      <span>Calificaciones reales</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-secondary-green/20 transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Featured Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-secondary-green to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Popular
                </div>
                
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-secondary-green to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <StarIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-secondary-green transition-colors duration-300">
                    Match Inteligente
                  </h4>
                  
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    Nuestro <strong>algoritmo inteligente</strong> conecta {BRAND_TERMS.EXPLORADORES} con los {BRAND_TERMS.ASES} más adecuados según sus necesidades.
                  </p>
                  
                  {/* Features list */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <SparklesIcon className="w-4 h-4 text-secondary-green" />
                      <span>Algoritmo inteligente</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <UserGroupIcon className="w-4 h-4 text-secondary-green" />
                      <span>Matches perfectos</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-secondary-orange/20 transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-secondary-orange to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h4 className="font-display text-2xl font-bold text-gray-900 mb-4 group-hover:text-secondary-orange transition-colors duration-300">
                    Conectá Directo
                  </h4>
                  
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                    Contactá <strong>directamente</strong> con {BRAND_TERMS.ASES} verificados. Sin intermediarios, sin comisiones extra.
                  </p>
                  
                  {/* Features list */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <div className="w-4 h-4 text-secondary-orange">💬</div>
                      <span>Chat directo</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <div className="w-4 h-4 text-secondary-orange">🚫</div>
                      <span>Sin comisiones</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => router.push('/how-it-works')}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Ver proceso completo</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Modern CTA Section */}
        <section className="relative px-6 py-24 overflow-hidden">
          {/* Background with gradient and patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-primary-blue-dark to-secondary-green"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="max-w-5xl mx-auto text-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">¡Empezá tu negocio hoy!</span>
              </motion.div>

              <h3 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="block">{BRAND_TERMS.BECOME_AS}</span>
                <span className="block text-3xl md:text-4xl font-normal text-white/80 mt-4">
                  y generá ingresos con tus habilidades
                </span>
              </h3>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Mostrá tus habilidades, conectá con miles de {BRAND_TERMS.EXPLORADORES} 
                y <strong>hacé crecer tu negocio</strong> sin límites.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <motion.button
                  onClick={() => router.push('/auth/register?tipo=as')}
                  className="group px-12 py-4 bg-white text-primary-blue rounded-2xl text-lg font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 flex items-center space-x-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Empezar Gratis</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </motion.button>
                
                <motion.button
                  onClick={() => router.push('/become-as')}
                  className="group px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Conocer más</span>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⭐
                  </motion.div>
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white/80">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <span className="font-medium">Sin comisiones</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">⏰</span>
                  </div>
                  <span className="font-medium">Horarios flexibles</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <span className="font-medium">Ingresos ilimitados</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="px-6 py-24 bg-gradient-to-r from-secondary-green to-primary-blue">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
                <span className="text-2xl">💳</span>
                <span className="text-sm font-semibold text-white">Modelo de Suscripción</span>
              </div>

              <h3 className="font-display text-4xl md:text-6xl font-bold text-white mb-8">
                Solo <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent">$2900</span> por mes
              </h3>
              
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12">
                Para publicar tus servicios en Serviplay, solo necesitas una <strong>suscripción mensual</strong>. 
                Sin comisiones por cada trabajo, sin costos ocultos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">✅</div>
                  <h4 className="font-display text-xl font-bold text-white mb-3">Suscripción Única</h4>
                  <p className="text-white/90">
                    Solo pagas $2900 mensuales para acceder a la plataforma. Sin comisiones por cada servicio.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">🚫</div>
                  <h4 className="font-display text-xl font-bold text-white mb-3">Sin Comisiones</h4>
                  <p className="text-white/90">
                    Cobra el 100% de tus servicios. No descontamos nada de tus ganancias.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">💰</div>
                  <h4 className="font-display text-xl font-bold text-white mb-3">Ingresos Ilimitados</h4>
                  <p className="text-white/90">
                    Publica todos los servicios que quieras y genera ingresos sin límite.
                  </p>
                </motion.div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
                <h4 className="font-display text-2xl font-bold text-white mb-4">¿Por qué cobramos suscripción?</h4>
                <p className="text-white/90 text-lg leading-relaxed">
                  A diferencia de otras plataformas que cobran comisiones altas (20-30%), nosotros creemos en un modelo más justo. 
                  Tu suscripción nos permite mantener la plataforma funcionando mientras <strong>tú te quedas con el 100% de tus ganancias</strong>.
                </p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.button
                  onClick={() => router.push('/pricing')}
                  className="px-10 py-4 bg-white text-secondary-green rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💳 Ver Planes de Suscripción
                </motion.button>
                
                <motion.button
                  onClick={() => router.push('/help')}
                  className="px-10 py-4 border-2 border-white text-white rounded-2xl text-lg font-bold hover:bg-white hover:text-primary-blue transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ❓ Preguntas Frecuentes
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Clasificados del Futuro Section */}
        <section className="px-6 py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-primary-blue">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                <span className="text-3xl">🚀</span>
                <span className="text-sm font-semibold text-white">El Futuro de los Servicios</span>
              </div>

              <h3 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Somos los <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">clasificados</span>
                <br />
                y <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">páginas amarillas</span>
                <br />
                del <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">futuro</span>
              </h3>
              
              <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
                Revolucionamos la forma en que las personas se conectan con servicios. Sin intermediarios, sin comisiones,
                solo <strong>conexiones directas y auténticas</strong> entre profesionales y clientes.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">📱</div>
                  <h4 className="font-display text-2xl font-bold text-white mb-4">Digital & Moderno</h4>
                  <p className="text-white/80 leading-relaxed">
                    Tecnología de vanguardia que conecta profesionales con clientes de forma inteligente y eficiente.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">🤝</div>
                  <h4 className="font-display text-2xl font-bold text-white mb-4">Conexión Directa</h4>
                  <p className="text-white/80 leading-relaxed">
                    Eliminamos los intermediarios. Los {BRAND_TERMS.ASES} se conectan directamente con {BRAND_TERMS.EXPLORADORES}.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                >
                  <div className="text-4xl mb-4">🌟</div>
                  <h4 className="font-display text-2xl font-bold text-white mb-4">Calidad Garantizada</h4>
                  <p className="text-white/80 leading-relaxed">
                    Sistema de verificación y calificaciones que garantiza profesionales confiables y servicios de calidad.
                  </p>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/80 text-sm">Digital</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">0%</div>
                  <div className="text-white/80 text-sm">Comisiones</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80 text-sm">Disponible</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">∞</div>
                  <div className="text-white/80 text-sm">Posibilidades</div>
                </div>
              </div>

              {/* Call to Action */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.button
                  onClick={() => router.push('/categories')}
                  className="px-8 py-4 bg-white text-purple-600 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:bg-gray-100 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🔍 Explorar Servicios
                </motion.button>
                
                <motion.button
                  onClick={() => router.push('/become-as')}
                  className="px-8 py-4 border-2 border-white text-white rounded-2xl text-lg font-bold hover:bg-white hover:text-purple-600 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⭐ Convertite en As
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Modern Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <span className="font-display text-2xl font-bold">{APP_CONFIG.NAME}</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                  {APP_CONFIG.TAGLINE}
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-blue transition-colors cursor-pointer">
                    <span>📧</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-blue transition-colors cursor-pointer">
                    <span>📱</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-blue transition-colors cursor-pointer">
                    <span>💬</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-lg mb-6">Plataforma</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="/how-it-works" className="hover:text-white transition-colors">Cómo funciona</a></li>
                  <li><a href="/categories" className="hover:text-white transition-colors">Categorías</a></li>
                  <li><a href="/pricing" className="hover:text-white transition-colors">Precios</a></li>
                  <li><a href="/become-as" className="hover:text-white transition-colors">Ser As</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold text-lg mb-6">Soporte</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="/help" className="hover:text-white transition-colors">Centro de ayuda</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contacto</a></li>
                  <li><a href="/security" className="hover:text-white transition-colors">Seguridad</a></li>
                  <li><a href="/about" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-500 text-sm">
                © 2024 {APP_CONFIG.NAME} - Mmata. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacidad</a>
                <a href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">Términos</a>
                <a href="/security" className="text-gray-500 hover:text-white text-sm transition-colors">Seguridad</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}