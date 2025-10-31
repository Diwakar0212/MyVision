import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface GlassCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export const GlassCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  className = '',
  children 
}: GlassCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 0 40px hsl(var(--primary) / 0.4)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={title}
      className={`glass-card rounded-2xl p-8 cursor-pointer transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${className}`}
    >
      {Icon && (
        <div className="mb-6 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Icon className="w-8 h-8 text-background" />
        </div>
      )}
      
      <h3 className="text-2xl md:text-3xl font-bold mb-3 gradient-text">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground text-lg">
          {description}
        </p>
      )}
      
      {children}
    </motion.div>
  );
};
