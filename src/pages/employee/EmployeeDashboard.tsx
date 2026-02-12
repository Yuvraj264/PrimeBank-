import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAppSelector } from '@/store';
import { mockUsers, mockKYCDocuments, mockLoans, mockTransactions } from '@/data/mockData';
import { Users, FileCheck, ClipboardList, Landmark, Activity } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const customers = mockUsers.filter((u) => u.role === 'customer');
  const pendingKYC = mockKYCDocuments.filter((k) => k.status === 'pending');
  const pendingLoans = mockLoans.filter((l) => l.status === 'pending');
  const pendingTxns = mockTransactions.filter((t) => t.status === 'pending');

  const metrics = [
    { label: 'Assigned Customers', value: customers.length, icon: Users, color: 'text-primary' },
    { label: 'Pending KYC', value: pendingKYC.length, icon: FileCheck, color: 'text-warning' },
    { label: 'Pending Loans', value: pendingLoans.length, icon: Landmark, color: 'text-success' },
    { label: 'Pending Transactions', value: pendingTxns.length, icon: ClipboardList, color: 'text-destructive' },
  ];

  const recentActivities = [
    { action: 'Verified KYC document for Priya Sharma', time: '2 hours ago', type: 'success' as const },
    { action: 'Processed deposit of $5,000 for Alex Rivera', time: '4 hours ago', type: 'info' as const },
    { action: 'Rejected loan application — insufficient docs', time: 'Yesterday', type: 'error' as const },
    { action: 'Created new customer account — David Kim', time: '2 days ago', type: 'info' as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Operations Overview</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <GlassCard key={m.label} delay={i * 0.05} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <AnimatedCounter value={m.value} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending Approvals */}
          <GlassCard delay={0.2}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> Pending Approvals
            </h3>
            <div className="space-y-3">
              {pendingLoans.map((loan) => {
                const customer = mockUsers.find((u) => u.id === loan.userId);
                return (
                  <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20">
                    <div>
                      <p className="text-sm font-medium">{customer?.name} — {loan.type} Loan</p>
                      <p className="text-xs text-muted-foreground">${loan.amount.toLocaleString()} · {loan.interestRate}% APR</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs rounded-lg bg-success/15 text-success border border-success/20 hover:bg-success/25 transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs rounded-lg bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
              {pendingTxns.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20">
                  <div>
                    <p className="text-sm font-medium">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">${txn.amount.toLocaleString()} · {txn.type}</p>
                  </div>
                  <StatusBadge status={txn.status} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Activity Log */}
          <GlassCard delay={0.25}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    a.type === 'success' ? 'bg-success' : a.type === 'error' ? 'bg-destructive' : 'bg-primary'
                  }`} />
                  <div>
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
