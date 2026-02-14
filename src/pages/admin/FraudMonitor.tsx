import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/data/mockData';
import { AlertTriangle, ShieldAlert, CheckCircle, Ban, Activity } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function FraudMonitor() {
    const [alerts, setAlerts] = useState(mockTransactions.filter(t => t.isFlagged));

    const handleAction = (id: string, action: 'cleared' | 'blocked') => {
        setAlerts(alerts.filter(a => a.id !== id));
        if (action === 'cleared') {
            toast.success('Alert cleared as false positive');
        } else {
            toast.error('Transaction blocked and account flagged');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-destructive" /> Fraud Monitor
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Real-time threat detection and response</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full border border-destructive/20 animate-pulse">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-semibold">System Alert Level: High</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Alert Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        {alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <GlassCard key={alert.id} className="border-l-4 border-l-destructive">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Suspicious Activity Detected</h3>
                                                <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()} • TXN ID: {alert.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-destructive">${alert.amount.toLocaleString()}</span>
                                            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-destructive mt-1">
                                                <span>Risk Score: {alert.riskScore}/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-secondary/20 rounded-lg mb-6 text-sm">
                                        <p><span className="font-semibold text-muted-foreground">Reason:</span> {alert.description}</p>
                                        <p className="mt-2"><span className="font-semibold text-muted-foreground">Analysis:</span> Transaction amount exceeds normal behavior pattern for this account by 400%. Location mismatch detected.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleAction(alert.id, 'blocked')}
                                        >
                                            <Ban className="w-4 h-4 mr-2" /> Block & Freeze
                                        </Button>
                                        <Button
                                            className="flex-1 bg-success hover:bg-success/90 text-white"
                                            onClick={() => handleAction(alert.id, 'cleared')}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Safe
                                        </Button>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
                                <CheckCircle className="w-16 h-16 text-success mb-4 opacity-50" />
                                <h3 className="text-xl font-bold">All Clear</h3>
                                <p className="text-muted-foreground">No pending fraud alerts to review.</p>
                            </GlassCard>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="font-semibold mb-4">Risk Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Alerts (24h)</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Auto-Blocked</span>
                                    <span className="font-bold text-destructive">5</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">False Positives</span>
                                    <span className="font-bold text-success">2</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="bg-destructive/5 border-destructive/20">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                                <Ban className="w-4 h-4" /> Blacklisted IPs
                            </h3>
                            <div className="space-y-2 mt-4">
                                {['45.33.120.55', '192.168.1.5', '10.0.0.99'].map(ip => (
                                    <div key={ip} className="flex justify-between items-center text-xs bg-background/50 p-2 rounded">
                                        <span className="font-mono">{ip}</span>
                                        <span className="text-muted-foreground">DDOS Attempt</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
