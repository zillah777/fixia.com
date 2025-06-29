import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/common/Layout';
import Loading from '@/components/common/Loading';
import { BRAND_TERMS } from '@/utils/constants';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  current?: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  start_date: Date;
  end_date: Date;
  auto_renew: boolean;
  payment_method: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamadas reales a la API
      
      // Mock subscription data
      const mockSubscription: UserSubscription = {
        id: '1',
        plan_id: 'pro',
        status: 'active',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-04-15'),
        auto_renew: true,
        payment_method: 'Visa ****1234'
      };

      // Mock plans data
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'Básico',
          price: 2999,
          period: 'monthly',
          features: [
            'Hasta 3 servicios activos',
            'Perfil básico',
            'Soporte por email',
            'Notificaciones básicas'
          ]
        },
        {
          id: 'pro',
          name: 'Profesional',
          price: 4999,
          period: 'monthly',
          features: [
            'Servicios ilimitados',
            'Perfil destacado',
            'Prioridad en búsquedas',
            'Estadísticas avanzadas',
            'Soporte prioritario',
            'Notificaciones premium',
            'Badge de verificación'
          ],
          recommended: true,
          current: true
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          price: 9999,
          period: 'monthly',
          features: [
            'Todo lo de Profesional',
            'Múltiples ubicaciones',
            'Gestión de equipo',
            'API personalizada',
            'Soporte 24/7',
            'Gerente de cuenta dedicado'
          ]
        }
      ];

      setSubscription(mockSubscription);
      setPlans(mockPlans);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    // TODO: Implementar lógica de upgrade
    console.log('Upgrading to plan:', planId);
  };

  const handleCancelSubscription = () => {
    if (!confirm('¿Estás seguro de que querés cancelar tu suscripción?')) return;
    
    // TODO: Implementar lógica de cancelación
    console.log('Cancelling subscription');
  };

  const toggleAutoRenew = () => {
    // TODO: Implementar toggle de auto-renovación
    if (subscription) {
      setSubscription({
        ...subscription,
        auto_renew: !subscription.auto_renew
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-secondary-green';
      case 'expired': return 'text-secondary-red';
      case 'cancelled': return 'text-neutral-500';
      default: return 'text-neutral-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      case 'cancelled': return 'Cancelada';
      case 'inactive': return 'Inactiva';
      default: return status;
    }
  };

  const daysUntilExpiry = subscription ? 
    Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (loading) {
    return (
      <Layout title="Suscripción">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Suscripción">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
              Tu Suscripción
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Gestioná tu plan de suscripción como {BRAND_TERMS.AS} y accedé a todas las funciones premium
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Plan {plans.find(p => p.id === subscription.plan_id)?.name || 'Desconocido'}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)} bg-current/10`}>
                      {getStatusText(subscription.status)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Vence el {new Date(subscription.end_date).toLocaleDateString()}
                        {daysUntilExpiry > 0 && ` (${daysUntilExpiry} días)`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCardIcon className="w-4 h-4" />
                      <span>{subscription.payment_method}</span>
                    </div>
                  </div>
                  
                  {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                    <div className="flex items-center space-x-2 text-secondary-orange">
                      <BellIcon className="w-4 h-4" />
                      <span className="text-sm">Tu suscripción vence pronto</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={toggleAutoRenew}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      subscription.auto_renew
                        ? 'bg-secondary-green text-white hover:bg-secondary-green-dark'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {subscription.auto_renew ? 'Auto-renovación ON' : 'Auto-renovación OFF'}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-secondary-red text-white rounded-lg hover:bg-secondary-red-dark transition-colors text-sm"
                  >
                    Cancelar Suscripción
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Plan Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'monthly'
                    ? 'bg-white text-primary-blue shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setSelectedPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'yearly'
                    ? 'bg-white text-primary-blue shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                Anual
                <span className="ml-1 text-xs bg-secondary-green text-white px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, index) => {
              const price = selectedPeriod === 'yearly' ? Math.round(plan.price * 0.8 * 12) : plan.price;
              const priceLabel = selectedPeriod === 'yearly' ? 'por año' : 'por mes';
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                  className={`relative bg-white rounded-2xl border-2 p-6 ${
                    plan.recommended 
                      ? 'border-primary-blue shadow-lg' 
                      : plan.current
                        ? 'border-secondary-green'
                        : 'border-neutral-200'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                        Recomendado
                      </span>
                    </div>
                  )}
                  
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-secondary-green text-white px-4 py-1 rounded-full text-sm font-medium">
                        Plan Actual
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-neutral-900">${price.toLocaleString()}</span>
                      <span className="text-neutral-600 ml-1">{priceLabel}</span>
                    </div>
                    
                    {selectedPeriod === 'yearly' && (
                      <div className="text-sm text-secondary-green">
                        Ahorrás ${(plan.price * 12 * 0.2).toLocaleString()} por año
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckIcon className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.current}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.current
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : plan.recommended
                          ? 'bg-primary-blue text-white hover:bg-primary-blue-dark'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {plan.current ? 'Plan Actual' : 'Seleccionar Plan'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl p-8 text-white text-center"
          >
            <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              ¿Por qué suscribirse como {BRAND_TERMS.AS}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center">
                <TrophyIcon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold mb-1">Más Visibilidad</h3>
                <p className="text-sm opacity-90">Aparecé primero en los resultados de búsqueda</p>
              </div>
              <div className="flex flex-col items-center">
                <StarIcon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold mb-1">Perfil Destacado</h3>
                <p className="text-sm opacity-90">Badge de verificación y perfil premium</p>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheckIcon className="w-8 h-8 mb-2" />
                <h3 className="font-semibold mb-1">Soporte Premium</h3>
                <p className="text-sm opacity-90">Atención prioritaria y soporte especializado</p>
              </div>
            </div>
          </motion.div>

          {/* FAQ or Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-neutral-600 mb-4">
              ¿Tenés preguntas sobre tu suscripción?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                Centro de Ayuda
              </button>
              <button className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors">
                Contactar Soporte
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}