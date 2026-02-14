import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Shield, AlertTriangle, Key, Edit, Info } from 'lucide-react';
import { mockUsers } from '@/data/mockData';

// Mock Audit Log Data
const mockAuditLogs = [
    { id: 'log-001', action: 'User Login', userId: 'cust-001', timestamp: '2024-03-20T10:30:00Z', details: 'Successful login from IP 192.168.1.1', type: 'info' },
    { id: 'log-002', action: 'Failed Login', userId: 'cust-002', timestamp: '2024-03-20T11:15:00Z', details: 'Invalid password attempt', type: 'warning' },
    { id: 'log-003', action: 'Account Freeze', userId: 'emp-001', timestamp: '2024-03-19T14:20:00Z', details: 'Froze account acc-003 due to suspicious activity', type: 'destructive' },
    { id: 'log-004', action: 'Key Rotation', userId: 'admin', timestamp: '2024-03-18T09:00:00Z', details: 'Rotated API keys for payment gateway', type: 'info' },
    { id: 'log-005', action: 'Profile Update', userId: 'cust-001', timestamp: '2024-03-18T16:45:00Z', details: 'Updated phone number', type: 'info' },
    { id: 'log-006', action: 'Large Transfer', userId: 'cust-003', timestamp: '2024-03-17T12:00:00Z', details: 'Transferred $50,000 to external account', type: 'warning' },
];

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const getIcon = (type: string) => {
        switch (type) {
            case 'destructive': return <Shield className="w-4 h-4 text-destructive" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    const filteredLogs = mockAuditLogs.filter(log => {
        const user = mockUsers.find(u => u.id === log.userId);
        const searchString = `${log.action} ${log.details} ${user?.email || log.userId}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        return matchesSearch && matchesType;
    });

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
                                    <SelectItem value="destructive">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Logs List */}
                    <div className="relative border-l border-border/30 ml-3 space-y-6">
                        {filteredLogs.map((log) => {
                            const user = mockUsers.find(u => u.id === log.userId);
                            return (
                                <div key={log.id} className="ml-6 relative">
                                    <div className={`absolute -left-[31px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center bg-secondary`}>
                                        {getIcon(log.type)}
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-secondary/5 border border-border/10 p-4 rounded-xl hover:bg-secondary/10 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">{log.action}</span>
                                                <span className="text-[10px] bg-secondary/30 px-2 py-0.5 rounded-full font-mono text-muted-foreground">{log.id}</span>
                                            </div>
                                            <p className="text-sm text-foreground/80">{log.details}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>User: {user ? user.email : log.userId}</span>
                                            </div>
                                        </div>
                                        <div className="text-right min-w-[140px]">
                                            <span className="text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No logs found matching criteria.
                        </div>
                    )}
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
