import { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import { APP_CONFIG } from '@/utils/constants';
import { LayoutProps } from '@/types';

const Layout = ({ 
  children, 
  title, 
  description, 
  showSearch = true, 
  user 
}: LayoutProps) => {
  const pageTitle = title ? `${title} - ${APP_CONFIG.NAME}` : `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`;
  const pageDescription = description || 'Conecta con los mejores Ases de servicios cerca de ti. Los Exploradores encuentran todo lo que necesitan.';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL || 'https://serviplay.vercel.app'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <div className="min-h-screen bg-neutral-50">
        <Header user={user} showSearch={showSearch} />
        
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer (si es necesario) */}
        <footer className="bg-white border-t border-neutral-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Para Exploradores</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="/explore" className="hover:text-primary-blue">Explorar Servicios</a></li>
                  <li><a href="/categories" className="hover:text-primary-blue">Categorías</a></li>
                  <li><a href="/how-it-works" className="hover:text-primary-blue">Cómo Funciona</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Para Ases</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="/join" className="hover:text-primary-blue">Convertite en As</a></li>
                  <li><a href="/pricing" className="hover:text-primary-blue">Precios</a></li>
                  <li><a href="/verification" className="hover:text-primary-blue">Verificación</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Soporte</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="/help" className="hover:text-primary-blue">Centro de Ayuda</a></li>
                  <li><a href="/contact" className="hover:text-primary-blue">Contacto</a></li>
                  <li><a href="/safety" className="hover:text-primary-blue">Seguridad</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Empresa</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="/about" className="hover:text-primary-blue">Sobre Nosotros</a></li>
                  <li><a href="/privacy" className="hover:text-primary-blue">Privacidad</a></li>
                  <li><a href="/terms" className="hover:text-primary-blue">Términos</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-display text-lg font-bold text-neutral-900">{APP_CONFIG.NAME}</span>
              </div>
              
              <p className="text-sm text-neutral-500">
                © 2024 {APP_CONFIG.NAME}. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;