import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/adminService';
import { Search, Filter, Shield, AlertTriangle, Key, Edit, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await adminService.getAuditLogs({
                    severity: typeFilter,
                    action: searchTerm
                });
                setLogs(data.data);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
                toast.error('Failed to load audit logs');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchLogs, 500);
        return () => clearTimeout(timeoutId);
    }, [typeFilter, searchTerm]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'destructive': return <Shield className="w-4 h-4 text-destructive" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
            case 'security': return <Key className="w-4 h-4 text-primary" />;
            case 'update': return <Edit className="w-4 h-4 text-blue-500" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-muted-foreground text-sm mt-1">System-wide activity tracking</p>
                </div>

                <GlassCard>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-muted-foreground" />
                                        <SelectValue placeholder="Filter Type" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="destructive">Destructive</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Logs List */}
                    <div className="relative border-l border-border/30 ml-3 space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-12 ml-6">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : logs.length > 0 ? (
                            logs.map((log) => {
                                const user = log.adminId;
                                const derivedType = log.severity || 'info';

                                return (
                                    <div key={log.id || log._id} className="ml-6 relative">
                                        <div className={`absolute -left-[31px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center bg-secondary`}>
                                            {getIcon(derivedType)}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-secondary/5 border border-border/10 p-4 rounded-xl hover:bg-secondary/10 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">{log.action}</span>
                                                    <span className="text-[10px] bg-secondary/30 px-2 py-0.5 rounded-full font-mono text-muted-foreground">{log.ipAddress || 'Unknown IP'}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80">{log.details}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <span>Admin: {user ? user.email : 'System'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right min-w-[140px]">
                                                <span className="text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground ml-6">
                                No logs found.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
