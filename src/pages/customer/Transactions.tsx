import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTransactions } from '@/data/mockData';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Transactions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredTransactions = mockTransactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Transactions</h1>
                        <p className="text-muted-foreground text-sm mt-1">View and manage your transaction history</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                </div>

                <GlassCard>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
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
                                        <SelectValue placeholder="Filter by type" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="NEFT">NEFT</SelectItem>
                                    <SelectItem value="RTGS">RTGS</SelectItem>
                                    <SelectItem value="IMPS">IMPS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn) => {
                                // Simplified logic for demo: internal = positive/income, others negative
                                // In real app, check against user account ID
                                const isPositive = txn.type === 'internal';

                                return (
                                    <div key={txn.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/5 hover:bg-secondary/20 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{txn.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span className="capitalize">{txn.type}</span>
                                                    <span>•</span>
                                                    <span>{new Date(txn.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                            <StatusBadge status={txn.status} />
                                            <span className={`font-bold ${isPositive ? 'text-success' : 'text-foreground'}`}>
                                                {isPositive ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions found matching your filters.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
