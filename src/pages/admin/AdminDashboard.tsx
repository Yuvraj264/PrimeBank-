import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAppSelector } from '@/store';
import { adminService } from '@/services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import {
  Users, Landmark, TrendingUp, TrendingDown, AlertTriangle,
  Activity, ShieldAlert, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) return null;

  const totalDeposits = stats.monthlyData.reduce((s: number, m: any) => s + m.deposits, 0);
  const totalWithdrawals = stats.monthlyData.reduce((s: number, m: any) => s + m.withdrawals, 0);

  const statCards = [
    { label: 'Total Deposits', value: totalDeposits, prefix: '$', icon: TrendingUp, color: 'text-success' },
    { label: 'Total Withdrawals', value: totalWithdrawals, prefix: '$', icon: TrendingDown, color: 'text-warning' },
    { label: 'Active Loans', value: stats.activeLoans, icon: Landmark, color: 'text-primary' },
    { label: 'Flagged Alerts', value: stats.flaggedTransactions, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Admin <span className="gradient-text">Console</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">System-wide analytics & management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <GlassCard key={s.label} delay={i * 0.05}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    className="text-xl font-bold"
                  />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* User counts */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard delay={0.2} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <AnimatedCounter value={stats.totalCustomers} className="text-3xl font-bold" />
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
          </GlassCard>
          <GlassCard delay={0.25} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <AnimatedCounter value={stats.totalEmployees} className="text-3xl font-bold" />
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
          </GlassCard>
        </div>

        {/* Monthly Transaction Chart */}
        <GlassCard delay={0.3}>
          <h3 className="text-sm font-semibold mb-4">Monthly Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(222, 47%, 9%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(213, 31%, 91%)' }}
              />
              <Bar dataKey="deposits" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Deposits" />
              <Bar dataKey="withdrawals" fill="hsl(234, 89%, 74%)" radius={[4, 4, 0, 0]} name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
