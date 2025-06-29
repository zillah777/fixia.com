import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: (id: string) => void;
}

export default function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (duration > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            setIsVisible(false);
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [duration]);

  useEffect(() => {
    if (!isVisible) {
      const timeout = setTimeout(() => {
        onClose?.(id);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-secondary-green',
          borderColor: 'border-secondary-green/20',
          iconColor: 'text-secondary-green'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-secondary-red',
          borderColor: 'border-secondary-red/20',
          iconColor: 'text-secondary-red'
        };
      case 'warning':
        return {
          icon: ExclamationCircleIcon,
          bgColor: 'bg-secondary-orange',
          borderColor: 'border-secondary-orange/20',
          iconColor: 'text-secondary-orange'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-primary-blue',
          borderColor: 'border-primary-blue/20',
          iconColor: 'text-primary-blue'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;
  const progressPercentage = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            relative bg-white border-l-4 ${config.borderColor} rounded-lg shadow-lg 
            max-w-sm w-full overflow-hidden
          `}
        >
          {/* Progress Bar */}
          {duration > 0 && (
            <div className="absolute top-0 left-0 h-1 bg-neutral-200 w-full">
              <motion.div
                className={`h-full ${config.bgColor}`}
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-900 mb-1">
                  {title}
                </h4>
                {message && (
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {message}
                  </p>
                )}
                
                {/* Action Button */}
                {action && (
                  <button
                    onClick={action.onClick}
                    className={`
                      mt-2 text-sm font-medium ${config.iconColor} 
                      hover:underline focus:outline-none focus:underline
                    `}
                  >
                    {action.label}
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: (NotificationToastProps & { id: string })[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({
  toasts,
  onRemoveToast,
  position = 'top-right'
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
    }
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-2`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            {...toast}
            onClose={onRemoveToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}