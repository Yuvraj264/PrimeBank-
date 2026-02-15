import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { transactionService, Transaction } from '@/services/transactionService';
import { useAppSelector } from '@/store';
import { toast } from 'sonner';

export default function Transactions() {
    const { user } = useAppSelector((s) => s.auth);
    const [searchTerm, setSearchTerm] = useState('');
    // Initialize filter from URL query param
    const [typeFilter, setTypeFilter] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('type') || 'all';
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Get accountId from URL if present
    const accountFilter = new URLSearchParams(window.location.search).get('accountId');
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getMyTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTransactions();
    }, [user]);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.receiverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.senderName || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'bill_payment' && (t.type === 'bill_payment' || t.category === 'bills')) ||
            t.type === typeFilter;

        const matchesAccount = !accountFilter ||
            t.fromAccountId === accountFilter ||
            t.toAccountId === accountFilter ||
            (t as any).accountId === accountFilter;

        return matchesSearch && matchesType && matchesAccount;
    });

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        const headers = ["Date", "Description", "Type", "Reference", "Debit ($)", "Credit ($)", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredTransactions.map(txn => {
                const isIncoming = txn.category === 'income' || txn.type === 'deposit';
                const date = new Date(txn.date || txn.createdAt || '').toLocaleDateString();
                const debit = isIncoming ? '' : Math.abs(txn.amount).toFixed(2);
                const credit = isIncoming ? Math.abs(txn.amount).toFixed(2) : '';

                return [
                    date,
                    `"${(txn.description || '').replace(/"/g, '""')}"`,
                    txn.type,
                    txn.reference || '',
                    debit,
                    credit,
                    txn.status
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Transactions exported successfully");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Transactions</h1>
                        <p className="text-muted-foreground text-sm mt-1">View and manage your transaction history</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={fetchTransactions} title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                    </div>
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
                                    <SelectItem value="transfer">Transfers</SelectItem>
                                    <SelectItem value="bill_payment">Bill Payments</SelectItem>
                                    <SelectItem value="deposit">Deposits</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading transactions...</div>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn) => {
                                const isIncoming = txn.category === 'income' || txn.type === 'deposit';
                                const isBill = txn.type === 'bill_payment' || txn.category === 'bills';

                                return (
                                    <div key={txn.id || Math.random()} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/5 hover:bg-secondary/20 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncoming ? 'bg-success/10 text-success' :
                                                isBill ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-destructive/10 text-destructive'
                                                }`}>
                                                {isIncoming ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{txn.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span className="capitalize">{txn.type?.replace('_', ' ')}</span>
                                                    <span>•</span>
                                                    <span>{new Date(txn.date || txn.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                            <StatusBadge status={txn.status} />
                                            <span className={`font-bold ${isIncoming ? 'text-success' : 'text-foreground'}`}>
                                                {isIncoming ? '+' : '-'}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
