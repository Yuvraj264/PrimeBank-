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
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedLogId(prev => prev === id ? null : id);
    };

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
                                const user = log.userId;
                                const derivedType = log.severity || 'info';
                                const isExpanded = expandedLogId === (log.id || log._id);

                                return (
                                    <div key={log.id || log._id} className="ml-6 relative">
                                        <div className={`absolute -left-[31px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center bg-secondary`}>
                                            {getIcon(derivedType)}
                                        </div>

                                        <div
                                            className="flex flex-col gap-2 bg-secondary/5 border border-border/10 p-4 rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer"
                                            onClick={() => toggleExpand(log.id || log._id)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm">{log.action}</span>
                                                        <span className="text-[10px] bg-secondary/30 px-2 py-0.5 rounded-full font-mono text-muted-foreground">{log.ipAddress || 'Unknown IP'}</span>
                                                        {log.entityType && (
                                                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold uppercase">{log.entityType}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-foreground/80">{log.details}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <span>User: {user ? `${user.name || user.fullName} (${user.email})` : 'System'}</span>
                                                        {log.entityId && <span>• Target ID: {log.entityId}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-left md:text-right min-w-[140px] flex md:flex-col justify-between items-center md:items-end">
                                                    <span className="text-xs font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span className="text-xs text-primary mt-1">{isExpanded ? 'Collapse' : 'View Details'}</span>
                                                </div>
                                            </div>

                                            {/* Expandable JSON State Diff */}
                                            {isExpanded && (log.beforeState || log.afterState) && (
                                                <div className="mt-4 pt-4 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {log.beforeState && (
                                                        <div className="bg-background/50 rounded-lg p-3 overflow-x-auto text-[10px] sm:text-xs">
                                                            <div className="font-bold text-muted-foreground mb-2 flex items-center justify-between">
                                                                <span>BEFORE STATE</span>
                                                                <span className="w-2 h-2 rounded-full bg-destructive/50"></span>
                                                            </div>
                                                            <pre className="text-destructive/80 font-mono">
                                                                {JSON.stringify(log.beforeState, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {log.afterState && (
                                                        <div className="bg-background/50 rounded-lg p-3 overflow-x-auto text-[10px] sm:text-xs">
                                                            <div className="font-bold text-muted-foreground mb-2 flex items-center justify-between">
                                                                <span>AFTER STATE</span>
                                                                <span className="w-2 h-2 rounded-full bg-success/50"></span>
                                                            </div>
                                                            <pre className="text-success/80 font-mono">
                                                                {JSON.stringify(log.afterState, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
