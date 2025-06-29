import { motion } from 'framer-motion';

interface ModernIconProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  gradient?: boolean;
  shadow?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-3xl'
};

export default function ModernIcon({ 
  emoji, 
  size = 'md', 
  className = '', 
  animate = false,
  gradient = false,
  shadow = false
}: ModernIconProps) {
  const baseClasses = `
    ${sizeClasses[size]}
    rounded-full
    flex items-center justify-center
    transition-all duration-300
    ${gradient ? 'bg-gradient-to-br from-primary-blue/10 to-secondary-green/10' : 'bg-neutral-100'}
    ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
    ${className}
  `;

  const iconElement = (
    <div className={baseClasses}>
      <span className="select-none">{emoji}</span>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {iconElement}
      </motion.div>
    );
  }

  return iconElement;
}

// Componente especializado para categorías
interface CategoryIconProps {
  emoji: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
}

export function CategoryIcon({ 
  emoji, 
  color, 
  size = 'md', 
  active = false, 
  onClick 
}: CategoryIconProps) {
  const sizeMap = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl', 
    lg: 'w-16 h-16 text-2xl'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizeMap[size]}
        rounded-xl
        flex items-center justify-center
        transition-all duration-300
        border-2
        ${active 
          ? `border-[${color}] shadow-lg shadow-[${color}]/25` 
          : 'border-neutral-200 hover:border-neutral-300'
        }
      `}
      style={{
        backgroundColor: active ? `${color}15` : '#f8f9fa',
        borderColor: active ? color : '#e5e7eb'
      }}
    >
      <span className="select-none filter drop-shadow-sm">{emoji}</span>
    </motion.button>
  );
}

// Componente para badges con emojis
interface EmojiBadgeProps {
  emoji: string;
  text: string;
  color?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function EmojiBadge({ 
  emoji, 
  text, 
  color,
  variant = 'default' 
}: EmojiBadgeProps) {
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`
      inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
      ${variantClasses[variant]}
    `}>
      <span className="text-sm">{emoji}</span>
      <span>{text}</span>
    </span>
  );
}

// Componente para estado con emoji animado
interface AnimatedStatusProps {
  emoji: string;
  text: string;
  subtext?: string;
  animate?: 'pulse' | 'bounce' | 'spin' | 'none';
  theme?: 'light' | 'dark';
}

export function AnimatedStatus({ 
  emoji, 
  text, 
  subtext, 
  animate = 'none',
  theme = 'light'
}: AnimatedStatusProps) {
  const animations = {
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    none: ''
  };

  const textColors = {
    light: {
      title: 'text-neutral-900',
      subtitle: 'text-neutral-500'
    },
    dark: {
      title: 'text-white',
      subtitle: 'text-white/80'
    }
  };

  return (
    <div className="text-center">
      <div className={`text-4xl mb-3 ${animations[animate]}`}>
        {emoji}
      </div>
      <h3 className={`font-semibold mb-1 ${textColors[theme].title}`}>{text}</h3>
      {subtext && (
        <p className={`text-sm ${textColors[theme].subtitle}`}>{subtext}</p>
      )}
    </div>
  );
}