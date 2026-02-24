import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services/adminService';
import { AlertTriangle, ShieldAlert, CheckCircle, Ban, Activity, Loader2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function FraudMonitor() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [blacklistedIPs, setBlacklistedIPs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [alertsData, ipsData] = await Promise.all([
                adminService.getFlaggedTransactions(),
                adminService.getBlacklistedIPs()
            ]);
            setAlerts(alertsData.data);
            setBlacklistedIPs(ipsData.data);
        } catch (error) {
            console.error('Failed to fetch fraud data:', error);
            toast.error('Failed to load fraud monitor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id: string, action: 'cleared' | 'blocked') => {
        try {
            await adminService.resolveFraudAlert(id, action);
            setAlerts(alerts.filter(a => a.id !== id && a._id !== id));
            if (action === 'cleared') {
                toast.success('Alert cleared as false positive');
            } else {
                toast.success('Transaction blocked and account frozen');
                // Refresh IPs as blocking might have added one (though not implemented in controller yet, good practice)
                const ips = await adminService.getBlacklistedIPs();
                setBlacklistedIPs(ips.data);
            }
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to resolve alert');
        }
    };

    const handleRemoveIP = async (id: string) => {
        try {
            await adminService.removeBlacklistedIP(id);
            setBlacklistedIPs(blacklistedIPs.filter(ip => ip._id !== id));
            toast.success('IP removed from blacklist');
        } catch (error) {
            toast.error('Failed to remove IP');
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
                        <span className="text-sm font-semibold">System Alert Level: {alerts.length > 5 ? 'High' : 'Normal'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Alert Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <GlassCard key={alert.id || alert._id} className="border-l-4 border-l-destructive">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Suspicious Activity Detected</h3>
                                                <p className="text-xs text-muted-foreground">{new Date(alert.date || alert.timestamp).toLocaleString()} • TXN ID: {alert.id || alert._id}</p>
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
                                        <p><span className="font-semibold text-muted-foreground">Description:</span> {alert.description}</p>
                                        <p className="mt-2 text-muted-foreground">User: {alert.userId?.name} ({alert.userId?.email})</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleAction(alert.id || alert._id, 'blocked')}
                                        >
                                            <Ban className="w-4 h-4 mr-2" /> Block & Freeze
                                        </Button>
                                        <Button
                                            className="flex-1 bg-success hover:bg-success/90 text-white"
                                            onClick={() => handleAction(alert.id || alert._id, 'cleared')}
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
                                    <span className="text-muted-foreground">Total Alerts</span>
                                    <span className="font-bold">{alerts.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">High Priority</span>
                                    <span className="font-bold text-destructive">{alerts.filter(a => a.riskScore > 80).length}</span>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="bg-destructive/5 border-destructive/20">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                                <Ban className="w-4 h-4" /> Blacklisted IPs
                            </h3>
                            <div className="space-y-2 mt-4">
                                {blacklistedIPs.length > 0 ? (
                                    blacklistedIPs.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-xs bg-background/50 p-2 rounded group">
                                            <div>
                                                <span className="font-mono block">{item.ip}</span>
                                                <span className="text-[10px] text-muted-foreground">{item.reason}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveIP(item._id)}
                                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground text-center py-4">No blacklisted IPs</p>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
