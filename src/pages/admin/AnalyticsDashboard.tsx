import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Activity, Users, DollarSign, AlertTriangle, TrendingUp, CreditCard, Download } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AnalyticsData {
    timeseries: Array<{
        date: string;
        dailyVolume: number;
        totalDeposits: number;
        totalWithdrawals: number;
        activeUsers: number;
        revenue: number;
        fraudRate: number;
        defaultRate: number;
        cardUsage: {
            online: number;
            pos: number;
            atm: number;
        };
    }>;
    summary: {
        currentVolume: number;
        activeUsers: number;
        dailyRevenue: number;
        currentFraudRate: number;
        currentDefaultRate: number;
        totalDeposits: number;
        totalWithdrawals: number;
    };
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/dashboard');
            setData(response.data.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const triggerManualAggregation = async () => {
        try {
            toast.loading('Aggregating data...', { id: 'agg' });
            await api.post('/analytics/trigger', { date: new Date().toISOString() });
            toast.success('Aggregation complete', { id: 'agg' });
            fetchAnalytics();
        } catch (error: any) {
            toast.error('Aggregation failed', { id: 'agg' });
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (loading || !data) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="h-10 w-48 bg-secondary/50 rounded animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-secondary/30 rounded-xl animate-pulse" />)}
                    </div>
                    <div className="h-[400px] bg-secondary/30 rounded-xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    const { summary, timeseries } = data;

    // Derived card usage for Pie Chart (latest day)
    const latestDay = timeseries[timeseries.length - 1] || { cardUsage: { online: 0, pos: 0, atm: 0 } };
    const cardData = [
        { name: 'Online', value: latestDay.cardUsage.online },
        { name: 'POS', value: latestDay.cardUsage.pos },
        { name: 'ATM', value: latestDay.cardUsage.atm }
    ];

    const StatCard = ({ title, value, icon: Icon, trend, prefix = '' }: any) => (
        <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <h3 className="text-2xl font-bold tracking-tight">
                    {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                {trend && (
                    <p className={cn("text-xs mt-2 flex items-center gap-1", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
                        <TrendingUp className={cn("w-3 h-3", trend < 0 && "rotate-180")} />
                        {Math.abs(trend)}% from last week
                    </p>
                )}
            </div>
        </GlassCard>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Analytics Overview</h1>
                        <p className="text-muted-foreground mt-1">Real-time performance metrics and historical trends</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={triggerManualAggregation} className="px-4 py-2 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors text-sm font-medium flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Force Aggregation
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Daily Volume" value={summary.currentVolume} prefix="$" icon={DollarSign} trend={5.2} />
                    <StatCard title="Active Users" value={summary.activeUsers} icon={Users} trend={12.4} />
                    <StatCard title="Daily Revenue" value={summary.dailyRevenue} prefix="$" icon={TrendingUp} trend={3.1} />
                    <StatCard title="Fraud Rate" value={`${summary.currentFraudRate.toFixed(2)}%`} icon={AlertTriangle} trend={-0.5} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GlassCard className="col-span-1 lg:col-span-2 p-6">
                        <h3 className="font-semibold text-lg mb-6">Financial Volume Trend</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeseries}>
                                    <defs>
                                        <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis tickFormatter={(v) => `$${v / 1000}k`} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        labelFormatter={formatDate}
                                        formatter={(val: number) => formatCurrency(val)}
                                    />
                                    <Area type="monotone" dataKey="totalDeposits" name="Deposits" stroke="#10b981" fillOpacity={1} fill="url(#colorDeposits)" />
                                    <Area type="monotone" dataKey="totalWithdrawals" name="Withdrawals" stroke="#ef4444" fillOpacity={1} fill="url(#colorWithdrawals)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-semibold text-lg mb-6">Card Usage Breakdown</h3>
                        <div className="h-[300px] w-full relative">
                            {cardData.every(d => d.value === 0) ? (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No card usage data today</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={cardData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {cardData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            formatter={(value: number) => value.toLocaleString()}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard className="col-span-1 lg:col-span-3 p-6">
                        <h3 className="font-semibold text-lg mb-6">User & Risk Metrics Overview</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeseries}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                        labelFormatter={formatDate}
                                    />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="fraudRate" name="Fraud Rate (%)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="defaultRate" name="Default Rate (%)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
