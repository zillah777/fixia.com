import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animado */}
        <motion.div
          className={`${sizeClasses[size]} border-2 border-neutral-200 border-t-primary-blue rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Texto opcional */}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-neutral-600 font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Loading skeleton para cards
export const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-neutral-200 rounded-full" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-neutral-200 rounded" />
          <div className="w-16 h-3 bg-neutral-200 rounded" />
        </div>
      </div>
      <div className="w-16 h-6 bg-neutral-200 rounded-full" />
    </div>
    
    <div className="space-y-3">
      <div className="w-3/4 h-5 bg-neutral-200 rounded" />
      <div className="w-full h-4 bg-neutral-200 rounded" />
      <div className="w-2/3 h-4 bg-neutral-200 rounded" />
      
      <div className="flex space-x-2">
        <div className="w-16 h-6 bg-neutral-200 rounded" />
        <div className="w-20 h-6 bg-neutral-200 rounded" />
        <div className="w-14 h-6 bg-neutral-200 rounded" />
      </div>
      
      <div className="flex justify-between items-end pt-3 border-t border-neutral-100">
        <div className="w-16 h-4 bg-neutral-200 rounded" />
        <div className="w-20 h-6 bg-neutral-200 rounded" />
      </div>
    </div>
  </div>
);

// Loading para listas
export const LoadingList = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ServiceCardSkeleton key={index} />
    ))}
  </div>
);

export default Loading;