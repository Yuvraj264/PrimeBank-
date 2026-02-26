import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/10", className)}
        >
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 text-muted-foreground">
                <Icon className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
            )}
        </motion.div>
    );
}

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

import { AlertTriangle } from 'lucide-react';

export function ErrorState({
    title = "Something went wrong",
    description = "We couldn't load this data. Please try again later.",
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5", className)}
        >
            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-destructive mb-1">{title}</h3>
            <p className="text-sm text-destructive/80 max-w-sm mb-4">{description}</p>
            {onRetry && (
                <Button variant="destructive" size="sm" onClick={onRetry}>Try Again</Button>
            )}
        </motion.div>
    );
}
