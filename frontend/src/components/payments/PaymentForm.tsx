import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const paymentSchema = z.object({
  cardNumber: z.string().min(13, 'Número de tarjeta inválido'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Formato MM/YY'),
  cvv: z.string().min(3, 'CVV inválido'),
  cardholderName: z.string().min(3, 'Nombre del titular requerido'),
  email: z.string().email('Email inválido').optional(),
  saveCard: z.boolean().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  showSaveCard?: boolean;
}

export default function PaymentForm({
  amount,
  description,
  onSuccess,
  onError,
  onCancel,
  loading = false,
  showSaveCard = true
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema)
  });

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsProcessing(true);
      setStep('processing');

      // TODO: Integrar con MercadoPago o Stripe
      // const paymentData = {
      //   ...data,
      //   amount,
      //   description
      // };
      // const result = await processPayment(paymentData);

      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResult = {
        id: 'payment_' + Date.now(),
        status: 'approved',
        amount,
        currency: 'ARS'
      };

      setStep('success');
      setTimeout(() => {
        onSuccess?.(mockResult);
      }, 2000);

    } catch (error: any) {
      setStep('error');
      const errorMessage = error.message || 'Error al procesar el pago';
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Procesando pago...
        </h3>
        <p className="text-neutral-600">
          No cierres esta ventana. El proceso puede tardar unos segundos.
        </p>
      </motion.div>
    );
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircleIcon className="w-16 h-16 text-secondary-green mx-auto mb-6" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          ¡Pago exitoso!
        </h3>
        <p className="text-neutral-600">
          Tu pago de ${amount.toLocaleString()} fue procesado correctamente.
        </p>
      </motion.div>
    );
  }

  if (step === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <ExclamationTriangleIcon className="w-16 h-16 text-secondary-red mx-auto mb-6" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Error en el pago
        </h3>
        <p className="text-neutral-600 mb-6">
          Hubo un problema al procesar tu pago. Por favor intentá nuevamente.
        </p>
        <button
          onClick={() => setStep('form')}
          className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
        >
          Intentar nuevamente
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Payment Summary */}
      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-neutral-600">Descripción:</span>
          <span className="font-medium text-neutral-900">{description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Total:</span>
          <span className="text-xl font-bold text-neutral-900">
            ${amount.toLocaleString()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Número de tarjeta
          </label>
          <div className="relative">
            <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              {...register('cardNumber')}
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              onChange={(e) => {
                e.target.value = formatCardNumber(e.target.value);
              }}
              className={`
                w-full pl-10 pr-3 py-3 border rounded-lg 
                focus:outline-none focus:ring-2 transition-all
                ${errors.cardNumber 
                  ? 'border-secondary-red focus:ring-secondary-red/20' 
                  : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
                }
              `}
            />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-secondary-red">{errors.cardNumber.message}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Vencimiento
            </label>
            <input
              {...register('expiryDate')}
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              onChange={(e) => {
                e.target.value = formatExpiryDate(e.target.value);
              }}
              className={`
                w-full px-3 py-3 border rounded-lg 
                focus:outline-none focus:ring-2 transition-all
                ${errors.expiryDate 
                  ? 'border-secondary-red focus:ring-secondary-red/20' 
                  : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
                }
              `}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-secondary-red">{errors.expiryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              CVV
            </label>
            <input
              {...register('cvv')}
              type="text"
              placeholder="123"
              maxLength={4}
              className={`
                w-full px-3 py-3 border rounded-lg 
                focus:outline-none focus:ring-2 transition-all
                ${errors.cvv 
                  ? 'border-secondary-red focus:ring-secondary-red/20' 
                  : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
                }
              `}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-secondary-red">{errors.cvv.message}</p>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre del titular
          </label>
          <input
            {...register('cardholderName')}
            type="text"
            placeholder="Como aparece en la tarjeta"
            className={`
              w-full px-3 py-3 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all
              ${errors.cardholderName 
                ? 'border-secondary-red focus:ring-secondary-red/20' 
                : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
              }
            `}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-secondary-red">{errors.cardholderName.message}</p>
          )}
        </div>

        {/* Save Card Option */}
        {showSaveCard && (
          <div className="flex items-center space-x-2">
            <input
              {...register('saveCard')}
              type="checkbox"
              id="saveCard"
              className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue/20 focus:ring-2"
            />
            <label htmlFor="saveCard" className="text-sm text-neutral-700">
              Guardar tarjeta para futuros pagos
            </label>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-start space-x-2 p-3 bg-neutral-50 rounded-lg">
          <LockClosedIcon className="w-5 h-5 text-secondary-green flex-shrink-0 mt-0.5" />
          <div className="text-sm text-neutral-600">
            <p className="font-medium mb-1">Pago seguro</p>
            <p>Tus datos están protegidos con encriptación SSL de 256 bits.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing || loading}
            className={`
              flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all
              ${isProcessing || loading
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-primary-blue hover:bg-primary-blue-dark'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              `Pagar $${amount.toLocaleString()}`
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}