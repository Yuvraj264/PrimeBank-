import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAppSelector } from '@/store';
import { customerService } from '@/services/customerService';
import { kycService } from '@/services/kycService';
import { loanService } from '@/services/loanService';
import { transactionService } from '@/services/transactionService'; // Import transactionService
import { Users, FileCheck, ClipboardList, Landmark, Activity, Loader2 } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAppSelector((s) => s.auth);
  const [stats, setStats] = useState({
    customerCount: 0,
    pendingKYC: 0,
    pendingLoans: [] as any[],
    pendingTxns: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [customers, kycRequests, loans, transactions] = await Promise.all([
        customerService.getAllCustomers(),
        kycService.getPendingKYCRequests(),
        loanService.getAllLoans(),
        transactionService.getAllTransactions()
      ]);

      setStats({
        customerCount: customers.length,
        pendingKYC: kycRequests.length,
        pendingLoans: loans.filter((l: any) => l.status === 'pending'),
        pendingTxns: transactions.filter((t: any) => t.status === 'pending') // Assuming 'pending' status exists for txns
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'Assigned Customers', value: stats.customerCount, icon: Users, color: 'text-primary' },
    { label: 'Pending KYC', value: stats.pendingKYC, icon: FileCheck, color: 'text-warning' },
    { label: 'Pending Loans', value: stats.pendingLoans.length, icon: Landmark, color: 'text-success' },
    { label: 'Pending Transactions', value: stats.pendingTxns.length, icon: ClipboardList, color: 'text-destructive' },
  ];

  // Placeholder for recent activity - could be a separate audit log endpoint later
  const recentActivities = [
    { action: 'System online and connected', time: 'Just now', type: 'success' as const },
    { action: 'Dashboard data refreshed', time: 'Just now', type: 'info' as const },
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

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                  {stats.pendingLoans.length > 0 || stats.pendingTxns.length > 0 ? (
                    <>
                      {stats.pendingLoans.slice(0, 3).map((loan) => {
                        // userId coming populated
                        const customer = loan.userId as any;
                        return (
                          <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20">
                            <div>
                              <p className="text-sm font-medium">{customer?.name || 'Unknown'} — {loan.type} Loan</p>
                              <p className="text-xs text-muted-foreground">${loan.amount.toLocaleString()} · {loan.interestRate}% APR</p>
                            </div>
                            <StatusBadge status="pending" />
                          </div>
                        );
                      })}
                      {stats.pendingTxns.slice(0, 3).map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/20">
                          <div>
                            <p className="text-sm font-medium">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">${txn.amount.toLocaleString()} · {txn.type}</p>
                          </div>
                          <StatusBadge status={txn.status} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending approvals required.</p>
                  )}
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
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${a.type === 'success' ? 'bg-success' : (a.type as string) === 'error' ? 'bg-destructive' : 'bg-primary'
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
