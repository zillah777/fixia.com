import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/common/Layout';
import Loading from '@/components/common/Loading';
import { Servicio } from '@/types';
import { BRAND_TERMS } from '@/utils/constants';

export default function MyServicesPage() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'activos' | 'pausados'>('todos');

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.get('/my-services');
      // setServices(response.data);
      
      // Mock data por ahora
      const mockServices: Servicio[] = [
        {
          id: '1',
          as_id: '1',
          categoria_id: '1',
          titulo: 'Limpieza profunda de hogar',
          descripcion: 'Ofrezco servicios de limpieza profunda para tu hogar. Incluye baños, cocina, dormitorios, y todas las áreas comunes.',
          tipo_precio: 'por_hora',
          precio_desde: 2500,
          precio_hasta: 4000,
          moneda: 'ARS',
          disponible: true,
          urgente: false,
          requiere_matricula: false,
          activo: true,
          destacado: true,
          created_at: new Date(),
          updated_at: new Date(),
          rating: 4.8
        },
        {
          id: '2',
          as_id: '1',
          categoria_id: '2',
          titulo: 'Reparación de electrodomésticos',
          descripcion: 'Reparo todo tipo de electrodomésticos: lavarropas, heladeras, microondas, etc.',
          tipo_precio: 'por_trabajo',
          precio_desde: 5000,
          precio_hasta: 15000,
          moneda: 'ARS',
          disponible: true,
          urgente: false,
          requiere_matricula: true,
          matricula_numero: '12345',
          activo: false,
          destacado: false,
          created_at: new Date(),
          updated_at: new Date(),
          rating: 4.5
        }
      ];
      
      setServices(mockServices);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId: string, newStatus: boolean) => {
    try {
      // TODO: API call to update service status
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, activo: newStatus }
            : service
        )
      );
    } catch (err) {
      console.error('Error updating service status:', err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este servicio?')) return;
    
    try {
      // TODO: API call to delete service
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'activos') return service.activo;
    if (filter === 'pausados') return !service.activo;
    return true;
  });

  const stats = {
    total: services.length,
    activos: services.filter(s => s.activo).length,
    pausados: services.filter(s => !s.activo).length,
    destacados: services.filter(s => s.destacado).length
  };

  if (loading) {
    return (
      <Layout title="Mis Servicios">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Servicios">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                Mis Servicios
              </h1>
              <p className="text-neutral-600">
                Gestioná y editá los servicios que ofrecés como {BRAND_TERMS.AS}
              </p>
            </div>
            
            <Link
              href="/services/new"
              className="flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Servicio</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-secondary-green">{stats.activos}</div>
              <div className="text-sm text-neutral-600">Activos</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-neutral-500">{stats.pausados}</div>
              <div className="text-sm text-neutral-600">Pausados</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-secondary-orange">{stats.destacados}</div>
              <div className="text-sm text-neutral-600">Destacados</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 mb-6 w-fit">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'activos', label: 'Activos' },
              { key: 'pausados', label: 'Pausados' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-primary-blue shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Services List */}
          {filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                {filter === 'todos' ? 'No tenés servicios aún' : `No tenés servicios ${filter}`}
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                {filter === 'todos' 
                  ? 'Creá tu primer servicio para empezar a recibir clientes.'
                  : `Cambiá el filtro para ver otros servicios o creá uno nuevo.`
                }
              </p>
              {filter === 'todos' && (
                <Link
                  href="/services/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Crear primer servicio</span>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Service Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                            {service.titulo}
                          </h3>
                          <p className="text-neutral-600 text-sm line-clamp-2">
                            {service.descripcion}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center space-x-2 ml-4">
                          {service.activo ? (
                            <div className="flex items-center space-x-1 text-secondary-green">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span className="text-xs">Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-neutral-500">
                              <XCircleIcon className="w-4 h-4" />
                              <span className="text-xs">Pausado</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Service Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span>${service.precio_desde.toLocaleString()}</span>
                          {service.precio_hasta && service.precio_hasta !== service.precio_desde && (
                            <span>- ${service.precio_hasta.toLocaleString()}</span>
                          )}
                        </div>
                        
                        {service.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span>{service.rating}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>
                            {service.tipo_precio === 'por_hora' && 'por hora'}
                            {service.tipo_precio === 'por_trabajo' && 'por trabajo'}
                            {service.tipo_precio === 'por_semana' && 'por semana'}
                            {service.tipo_precio === 'por_mes' && 'por mes'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {service.destacado && (
                          <span className="px-2 py-1 bg-secondary-orange/10 text-secondary-orange text-xs rounded-full">
                            Destacado
                          </span>
                        )}
                        {service.urgente && (
                          <span className="px-2 py-1 bg-secondary-red/10 text-secondary-red text-xs rounded-full">
                            Urgente
                          </span>
                        )}
                        {service.requiere_matricula && (
                          <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue text-xs rounded-full">
                            Requiere matrícula
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 lg:min-w-[200px]">
                      <div className="flex space-x-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Ver</span>
                        </Link>
                        <Link
                          href={`/services/${service.id}/edit`}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors text-sm"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(service.id, !service.activo)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            service.activo
                              ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              : 'bg-secondary-green text-white hover:bg-secondary-green-dark'
                          }`}
                        >
                          {service.activo ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="flex items-center justify-center px-3 py-2 bg-secondary-red text-white rounded-lg hover:bg-secondary-red-dark transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}