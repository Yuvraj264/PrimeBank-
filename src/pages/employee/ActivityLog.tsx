import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Activity, User, Shield, AlertTriangle, FileText, Settings } from 'lucide-react';

const mockLogs = [
    { id: 1, action: 'Approved loan application #L-1024', user: 'James Wilson', role: 'Employee', time: '10 mins ago', type: 'success', icon: FileText },
    { id: 2, action: 'Verified KYC documents for User #8821', user: 'Sarah Connor', role: 'Employee', time: '1 hour ago', type: 'info', icon: Shield },
    { id: 3, action: 'Flagged suspicious transaction #TX-9921', user: 'System AI', role: 'System', time: '2 hours ago', type: 'warning', icon: AlertTriangle },
    { id: 4, action: 'Updated global interest rates', user: 'Admin User', role: 'Admin', time: '5 hours ago', type: 'default', icon: Settings },
    { id: 5, action: 'New customer registration: David Kim', user: 'System', role: 'System', time: '1 day ago', type: 'info', icon: User },
];

export default function ActivityLog() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Activity Log</h1>
                    <p className="text-muted-foreground text-sm mt-1">Audit trail of system events and employee actions</p>
                </div>

                <GlassCard>
                    <div className="space-y-6">
                        {mockLogs.map((log, index) => (
                            <div key={log.id} className="relative pl-8 pb-6 border-l border-border/30 last:pb-0 last:border-0">
                                <div className={`absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center ${log.type === 'success' ? 'bg-success' :
                                        log.type === 'warning' ? 'bg-warning' :
                                            log.type === 'info' ? 'bg-primary' : 'bg-secondary'
                                    }`}>
                                    <log.icon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm">{log.action}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <User className="w-3 h-3" />
                                            <span>{log.user} ({log.role})</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
