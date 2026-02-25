import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import {
    Bell, CheckCircle2, ShieldAlert, ArrowDownLeft, ArrowUpRight,
    Info, Trash2, CheckCheck, RefreshCcw, BellOff
} from 'lucide-react';
import { formatDistanceToNow, subHours, subDays, subMinutes } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & MOCK DATA ---
type NotificationType = 'transaction_in' | 'transaction_out' | 'security' | 'general';

interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}

const mockNotifications: NotificationItem[] = [
    {
        id: 'notif-1',
        type: 'security',
        title: 'New Login Detected',
        message: 'A new login to your PrimeBank account was detected from Chrome on macOS.',
        timestamp: subMinutes(new Date(), 15),
        isRead: false
    },
    {
        id: 'notif-2',
        type: 'transaction_in',
        title: 'Salary Credited',
        message: 'Your account XXXX-1234 was credited with $4,500.00 from TECH CORP LTD.',
        timestamp: subHours(new Date(), 2),
        isRead: false
    },
    {
        id: 'notif-3',
        type: 'transaction_out',
        title: 'Auto-Pay Deducted',
        message: 'Netflix Subscription auto-pay of $15.99 was successfully processed.',
        timestamp: subHours(new Date(), 14),
        isRead: true
    },
    {
        id: 'notif-4',
        type: 'general',
        title: 'Maintenance Alert',
        message: 'PrimeBank services will undergo scheduled maintenance this Sunday from 2 AM to 4 AM EST.',
        timestamp: subDays(new Date(), 1),
        isRead: true
    },
    {
        id: 'notif-5',
        type: 'security',
        title: 'Password Expiring Soon',
        message: 'Your banking password will expire in 5 days. Consider updating it for better security.',
        timestamp: subDays(new Date(), 3),
        isRead: true
    }
];

export default function Notifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'transactions' | 'security' | 'general'>('all');

    // Derived state
    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => {
                if (filter === 'all') return true;
                if (filter === 'transactions') return n.type.includes('transaction');
                if (filter === 'security') return n.type === 'security';
                if (filter === 'general') return n.type === 'general';
                return true;
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [notifications, filter]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Actions
    const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification deleted");
    };

    const handleMarkAllRead = () => {
        if (unreadCount === 0) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("All caught up!");
    };

    const handleClearAll = () => {
        if (notifications.length === 0) return;
        setNotifications([]);
        toast.success("All notifications cleared");
    };

    // UI Helpers
    const getIconForType = (type: NotificationType) => {
        switch (type) {
            case 'security': return <ShieldAlert className="w-5 h-5 text-destructive" />;
            case 'transaction_in': return <ArrowDownLeft className="w-5 h-5 text-success" />;
            case 'transaction_out': return <ArrowUpRight className="w-5 h-5 text-primary" />;
            case 'general': default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColorForType = (type: NotificationType) => {
        switch (type) {
            case 'security': return 'bg-destructive/10';
            case 'transaction_in': return 'bg-success/10';
            case 'transaction_out': return 'bg-primary/10';
            case 'general': default: return 'bg-blue-500/10';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center relative">
                            <Bell className="w-5 h-5 text-primary" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive border-2 border-background text-[8px] font-bold text-white items-center justify-center">{unreadCount}</span>
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">Stay updated on your account activity</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0} className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                            Clear all
                        </Button>
                    </div>
                </div>

                <GlassCard className="p-2 sm:p-6 border-border/50">

                    {/* Filters */}
                    <div className="flex overflow-x-auto pb-4 mb-2 scrollbar-none gap-2 border-b border-border/50">
                        {['all', 'transactions', 'security', 'general'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                                        ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Feed */}
                    <div className="mt-4 space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n) => (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className={`group relative flex items-start sm:items-center gap-4 p-4 rounded-xl border transition-all ${n.isRead
                                                ? 'bg-background/40 border-border/30 opacity-70'
                                                : 'bg-secondary/40 border-primary/20 shadow-sm'
                                            }`}
                                    >
                                        {/* Status Dot */}
                                        {!n.isRead && (
                                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-primary rounded-r-full" />
                                        )}

                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 flex items-center justify-center mt-1 sm:mt-0 ${getBgColorForType(n.type)}`}>
                                            {getIconForType(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-10 sm:pr-24">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                <h4 className={`font-semibold truncate ${n.isRead ? 'text-foreground/80' : 'text-foreground'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                                                    {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className={`text-sm tracking-wide ${n.isRead ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                                                {n.message}
                                            </p>
                                            <span className="text-xs text-muted-foreground mt-2 block sm:hidden">
                                                {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                                            </span>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!n.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-full bg-background/80 hover:bg-primary/20 hover:text-primary backdrop-blur shadow-sm"
                                                    onClick={(e) => handleMarkAsRead(n.id, e)}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-8 h-8 rounded-full bg-background/80 hover:bg-destructive/20 hover:text-destructive backdrop-blur shadow-sm"
                                                onClick={(e) => handleDelete(n.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="pt-10 pb-16 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                        <BellOff className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">No notifications found</h3>
                                    <p className="text-muted-foreground text-sm max-w-[250px]">
                                        {filter === 'all'
                                            ? "You're all caught up! There are no new alerts to display right now."
                                            : `You don't have any ${filter} notifications.`}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
