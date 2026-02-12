import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAppSelector } from '@/store';
import { mockUsers, mockAccounts, mockTransactions, mockLoans, monthlyTransactionData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import {
  Users, Landmark, TrendingUp, TrendingDown, AlertTriangle,
  Activity, DollarSign, ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const totalDeposits = monthlyTransactionData.reduce((s, m) => s + m.deposits, 0);
  const totalWithdrawals = monthlyTransactionData.reduce((s, m) => s + m.withdrawals, 0);
  const activeLoans = mockLoans.filter((l) => l.status === 'active' || l.status === 'approved');
  const flaggedTxns = mockTransactions.filter((t) => t.isFlagged);
  const totalUsers = mockUsers.filter((u) => u.role === 'customer').length;
  const totalEmployees = mockUsers.filter((u) => u.role === 'employee').length;

  const stats = [
    { label: 'Total Deposits', value: totalDeposits, prefix: '$', icon: TrendingUp, color: 'text-success' },
    { label: 'Total Withdrawals', value: totalWithdrawals, prefix: '$', icon: TrendingDown, color: 'text-warning' },
    { label: 'Active Loans', value: activeLoans.length, icon: Landmark, color: 'text-primary' },
    { label: 'Flagged Alerts', value: flaggedTxns.length, icon: AlertTriangle, color: 'text-destructive' },
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
          {stats.map((s, i) => (
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
              <AnimatedCounter value={totalUsers} className="text-3xl font-bold" />
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
          </GlassCard>
          <GlassCard delay={0.25} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <AnimatedCounter value={totalEmployees} className="text-3xl font-bold" />
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
          </GlassCard>
        </div>

        {/* Monthly Transaction Chart */}
        <GlassCard delay={0.3}>
          <h3 className="text-sm font-semibold mb-4">Monthly Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTransactionData}>
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

        {/* Flagged Transactions */}
        <GlassCard delay={0.35}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" /> Flagged Transactions
          </h3>
          <div className="space-y-3">
            {flaggedTxns.length === 0 && (
              <p className="text-sm text-muted-foreground">No flagged transactions</p>
            )}
            {flaggedTxns.map((txn) => (
              <motion.div
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/15"
                animate={{ borderColor: ['hsl(0, 72%, 51%, 0.15)', 'hsl(0, 72%, 51%, 0.3)', 'hsl(0, 72%, 51%, 0.15)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div>
                  <p className="text-sm font-medium">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    ${txn.amount.toLocaleString()} · Risk Score: {txn.riskScore}/100
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={txn.status} />
                  <button className="px-3 py-1 text-xs rounded-lg bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 transition-colors">
                    Freeze
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
