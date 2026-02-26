import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  interactive?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className, hover = true, delay = 0, interactive = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        interactive && "hover:-translate-y-1 hover:shadow-xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-primary/20",
        'p-6 rounded-2xl transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
