import { useAppSelector } from '@/store';
import { mockAccounts, mockTransactions, spendingByCategory, monthlyTransactionData } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, CreditCard, ArrowLeftRight,
  FileText, TrendingUp, Wallet, ShieldCheck
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const accounts = mockAccounts.filter((a) => a.userId === user?.id);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const recentTxns = mockTransactions.filter(
    (t) => t.fromAccountId === accounts[0]?.id || t.toAccountId === accounts[0]?.id
  ).slice(0, 5);

  const quickActions = [
    { label: 'Transfer', icon: ArrowLeftRight, path: '/customer/transfers', color: 'text-primary' },
    { label: 'Pay Bills', icon: CreditCard, path: '/customer/bills', color: 'text-success' },
    { label: 'Statements', icon: FileText, path: '/customer/statements', color: 'text-warning' },
    { label: 'Security', icon: ShieldCheck, path: '/customer/security', color: 'text-destructive' },
  ];

  // Financial health score (simulated)
  const healthScore = 82;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview</p>
        </div>

        {/* Balance + Health Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="md:col-span-2" delay={0}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <AnimatedCounter
                  value={totalBalance}
                  prefix="$"
                  decimals={2}
                  className="text-3xl font-bold"
                />
              </div>
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" /> +12.5%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-lg bg-secondary/30 border border-border/20">
                  <p className="text-xs text-muted-foreground capitalize">{acc.type.replace('_', ' ')}</p>
                  <p className="text-lg font-semibold mt-1">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{acc.accountNumber}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <p className="text-sm text-muted-foreground mb-3">Financial Health</p>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="hsl(var(--success))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={327} strokeDashoffset={327 - (327 * healthScore) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedCounter value={healthScore} className="text-2xl font-bold" />
              </div>
            </div>
            <p className="text-center text-sm font-medium text-success">Excellent</p>
            <p className="text-center text-xs text-muted-foreground">Your finances are in great shape</p>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => navigate(action.path)}
              className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center"
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Chart + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <GlassCard className="lg:col-span-3" delay={0.3}>
            <h3 className="text-sm font-semibold mb-4">Income vs Spending</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTransactionData}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(234, 89%, 74%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(234, 89%, 74%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 47%, 9%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(213, 31%, 91%)' }}
                />
                <Area type="monotone" dataKey="deposits" stroke="hsl(160, 84%, 39%)" fill="url(#colorDeposits)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="withdrawals" stroke="hsl(234, 89%, 74%)" fill="url(#colorWithdrawals)" strokeWidth={2} name="Spending" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="lg:col-span-2" delay={0.35}>
            <h3 className="text-sm font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTxns.map((txn) => {
                const isOutgoing = txn.fromAccountId === accounts[0]?.id;
                return (
                  <div key={txn.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOutgoing ? 'bg-destructive/10' : 'bg-success/10'}`}>
                        {isOutgoing ? <ArrowUpRight className="w-4 h-4 text-destructive" /> : <ArrowDownRight className="w-4 h-4 text-success" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">{txn.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isOutgoing ? 'text-destructive' : 'text-success'}`}>
                        {isOutgoing ? '-' : '+'}${txn.amount.toLocaleString()}
                      </p>
                      <StatusBadge status={txn.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Daily Limit */}
        {accounts[0] && (
          <GlassCard delay={0.4}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Daily Transaction Limit</h3>
              <span className="text-xs text-muted-foreground">
                ${accounts[0].usedLimit.toLocaleString()} / ${accounts[0].dailyLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(accounts[0].usedLimit / accounts[0].dailyLimit) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(accounts[0].dailyLimit - accounts[0].usedLimit).toLocaleString()} remaining today
            </p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
}
