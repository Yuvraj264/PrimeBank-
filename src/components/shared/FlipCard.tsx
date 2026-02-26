import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

interface FlipCardProps {
    frontContent: React.ReactNode;
    backContent: React.ReactNode;
    isFlipped: boolean;
    className?: string;
    onClick?: () => void;
}

export default function FlipCard({ frontContent, backContent, isFlipped, className, onClick }: FlipCardProps) {
    return (
        <div
            className={cn("relative perspective-1000", className)}
            onClick={onClick}
        >
            <motion.div
                className="w-full h-full preserve-3d relative cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <GlassCard className="absolute inset-0 backface-hidden interactive w-full h-full p-0">
                    {frontContent}
                </GlassCard>

                {/* Back */}
                <GlassCard className="absolute inset-0 backface-hidden rotate-y-180 interactive w-full h-full p-0 bg-primary/10 border-primary/20">
                    {backContent}
                </GlassCard>
            </motion.div>
        </div>
    );
}
