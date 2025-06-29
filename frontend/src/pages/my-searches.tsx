import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/common/Layout';
import Loading from '@/components/common/Loading';
import { BusquedaServicio } from '@/types';
import { BRAND_TERMS } from '@/utils/constants';

export default function MySearchesPage() {
  const [searches, setSearches] = useState<BusquedaServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'activas' | 'pausadas' | 'completadas'>('todas');

  useEffect(() => {
    fetchMySearches();
  }, []);

  const fetchMySearches = async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.get('/my-searches');
      // setSearches(response.data);
      
      // Mock data por ahora
      const mockSearches: BusquedaServicio[] = [
        {
          id: '1',
          explorador_id: '1',
          titulo: 'Limpieza profunda de departamento',
          descripcion: 'Necesito limpieza profunda de departamento de 2 ambientes. Incluye baños, cocina y habitaciones. Preferiblemente en fin de semana.',
          categoria_id: '1',
          direccion_trabajo: 'Palermo, CABA',
          latitud_trabajo: -34.5755,
          longitud_trabajo: -58.4338,
          radio_busqueda: 10,
          presupuesto_minimo: 3000,
          presupuesto_maximo: 6000,
          tipo_precio: 'por_trabajo',
          fecha_necesaria: new Date('2024-03-15'),
          urgente: false,
          estado: 'activa',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          explorador_id: '1',
          titulo: 'Reparación de heladera',
          descripcion: 'Mi heladera no enfría bien. Busco técnico especializado en electrodomésticos.',
          categoria_id: '2',
          radio_busqueda: 15,
          presupuesto_maximo: 8000,
          urgente: true,
          estado: 'completada',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          explorador_id: '1',
          titulo: 'Cuidado de plantas mientras viajo',
          descripcion: 'Viajo por 2 semanas y necesito alguien que cuide mis plantas. Son unas 15 plantas en total.',
          direccion_trabajo: 'Villa Crespo, CABA',
          radio_busqueda: 5,
          presupuesto_minimo: 2000,
          presupuesto_maximo: 4000,
          tipo_precio: 'por_semana',
          fecha_necesaria: new Date('2024-03-20'),
          urgente: false,
          estado: 'pausada',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      setSearches(mockSearches);
    } catch (err) {
      console.error('Error fetching searches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (searchId: string, newStatus: 'activa' | 'pausada') => {
    try {
      // TODO: API call to update search status
      setSearches(prev => 
        prev.map(search => 
          search.id === searchId 
            ? { ...search, estado: newStatus }
            : search
        )
      );
    } catch (err) {
      console.error('Error updating search status:', err);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta búsqueda?')) return;
    
    try {
      // TODO: API call to delete search
      setSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      console.error('Error deleting search:', err);
    }
  };

  const filteredSearches = searches.filter(search => {
    if (filter === 'activas') return search.estado === 'activa';
    if (filter === 'pausadas') return search.estado === 'pausada';
    if (filter === 'completadas') return search.estado === 'completada';
    return true;
  });

  const stats = {
    total: searches.length,
    activas: searches.filter(s => s.estado === 'activa').length,
    pausadas: searches.filter(s => s.estado === 'pausada').length,
    completadas: searches.filter(s => s.estado === 'completada').length
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'text-secondary-green';
      case 'pausada': return 'text-neutral-500';
      case 'completada': return 'text-primary-blue';
      case 'cancelada': return 'text-secondary-red';
      default: return 'text-neutral-600';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activa': return CheckCircleIcon;
      case 'pausada': return PauseIcon;
      case 'completada': return CheckCircleIcon;
      case 'cancelada': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  if (loading) {
    return (
      <Layout title="Mis Búsquedas">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Búsquedas">
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
                Mis Búsquedas
              </h1>
              <p className="text-neutral-600">
                Gestioná las búsquedas de servicios que has publicado
              </p>
            </div>
            
            <Link
              href="/search/new"
              className="flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nueva Búsqueda</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
              <div className="text-sm text-neutral-600">Total</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-secondary-green">{stats.activas}</div>
              <div className="text-sm text-neutral-600">Activas</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-neutral-500">{stats.pausadas}</div>
              <div className="text-sm text-neutral-600">Pausadas</div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="text-2xl font-bold text-primary-blue">{stats.completadas}</div>
              <div className="text-sm text-neutral-600">Completadas</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 mb-6 w-fit">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'activas', label: 'Activas' },
              { key: 'pausadas', label: 'Pausadas' },
              { key: 'completadas', label: 'Completadas' }
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

          {/* Searches List */}
          {filteredSearches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                {filter === 'todas' ? 'No tenés búsquedas aún' : `No tenés búsquedas ${filter}`}
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                {filter === 'todas' 
                  ? 'Creá tu primera búsqueda para encontrar el servicio que necesitás.'
                  : `Cambiá el filtro para ver otras búsquedas o creá una nueva.`
                }
              </p>
              {filter === 'todas' && (
                <Link
                  href="/search/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Crear primera búsqueda</span>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredSearches.map((search, index) => {
                const StatusIcon = getStatusIcon(search.estado);
                
                return (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      {/* Search Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                              {search.titulo}
                            </h3>
                            <p className="text-neutral-600 text-sm line-clamp-2">
                              {search.descripcion}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`flex items-center space-x-2 ml-4 ${getStatusColor(search.estado)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-xs capitalize">{search.estado}</span>
                          </div>
                        </div>
                        
                        {/* Search Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                          {search.direccion_trabajo && (
                            <div className="flex items-center space-x-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{search.direccion_trabajo}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            <span>Radio: {search.radio_busqueda} km</span>
                          </div>
                          
                          {search.presupuesto_maximo && (
                            <div className="flex items-center space-x-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>
                                {search.presupuesto_minimo && (
                                  <>${search.presupuesto_minimo.toLocaleString()} - </>
                                )}
                                ${search.presupuesto_maximo.toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {search.fecha_necesaria && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{new Date(search.fecha_necesaria).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {search.urgente && (
                            <span className="px-2 py-1 bg-secondary-red/10 text-secondary-red text-xs rounded-full">
                              Urgente
                            </span>
                          )}
                          {search.tipo_precio && (
                            <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue text-xs rounded-full">
                              {search.tipo_precio === 'por_hora' && 'Por hora'}
                              {search.tipo_precio === 'por_trabajo' && 'Por trabajo'}
                              {search.tipo_precio === 'por_semana' && 'Por semana'}
                              {search.tipo_precio === 'por_mes' && 'Por mes'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2 lg:min-w-[200px]">
                        <div className="flex space-x-2">
                          <Link
                            href={`/search/${search.id}`}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>Ver respuestas</span>
                          </Link>
                        </div>
                        
                        {search.estado !== 'completada' && search.estado !== 'cancelada' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleStatus(
                                search.id, 
                                search.estado === 'activa' ? 'pausada' : 'activa'
                              )}
                              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                search.estado === 'activa'
                                  ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                  : 'bg-secondary-green text-white hover:bg-secondary-green-dark'
                              }`}
                            >
                              {search.estado === 'activa' ? (
                                <>
                                  <PauseIcon className="w-4 h-4" />
                                  <span>Pausar</span>
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="w-4 h-4" />
                                  <span>Activar</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteSearch(search.id)}
                              className="flex items-center justify-center px-3 py-2 bg-secondary-red text-white rounded-lg hover:bg-secondary-red-dark transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}