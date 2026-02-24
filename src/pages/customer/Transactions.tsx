import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { transactionService, Transaction } from '@/services/transactionService';
import { useAppSelector } from '@/store';
import { toast } from 'sonner';

import TransactionFilters, { FilterState } from '@/components/transactions/TransactionFilters';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionModal from '@/components/transactions/TransactionModal';

export default function Transactions() {
    const { user } = useAppSelector((s) => s.auth);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        type: new URLSearchParams(window.location.search).get('type') || 'all',
        status: 'all',
        dateRange: undefined,
        minAmount: 0,
        maxAmount: 100000
    });

    // Sorting state
    const [sortField, setSortField] = useState<keyof Transaction | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const accountFilter = new URLSearchParams(window.location.search).get('accountId');

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

    // Handle local note/tag updates
    const handleUpdateMeta = (id: string, note: string, tags: string[]) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, note, tags } : t));
        if (selectedTxn && selectedTxn.id === id) {
            setSelectedTxn(prev => prev ? { ...prev, note, tags } : null);
        }
    };

    const handleSort = (field: keyof Transaction | 'date') => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc'); // Default to descending when changing fields
        }
    };

    const processedTransactions = useMemo(() => {
        let result = [...transactions];

        // 1. Account Filter (from URL)
        if (accountFilter) {
            result = result.filter(t => t.fromAccountId === accountFilter || t.toAccountId === accountFilter);
        }

        // 2. Type Filter
        if (filters.type !== 'all') {
            result = result.filter(t =>
                (filters.type === 'bill_payment' && (t.type === 'bill_payment' || t.category === 'bills')) ||
                t.type === filters.type
            );
        }

        // 3. Status Filter
        if (filters.status !== 'all') {
            result = result.filter(t => t.status === filters.status);
        }

        // 4. Amount Range
        result = result.filter(t => {
            const amt = Math.abs(t.amount);
            return amt >= filters.minAmount && amt <= filters.maxAmount;
        });

        // 5. Date Range
        if (filters.dateRange?.from) {
            const start = new Date(filters.dateRange.from).getTime();
            // End of day for "to" date, or end of day for "from" date if "to" is missing
            const end = filters.dateRange.to
                ? new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
                : new Date(filters.dateRange.from).setHours(23, 59, 59, 999);

            result = result.filter(t => {
                const txnDate = new Date(t.date || t.createdAt || '').getTime();
                return txnDate >= start && txnDate <= end;
            });
        }

        // 6. Search
        if (filters.search) {
            const lowerQuery = filters.search.toLowerCase();
            result = result.filter(t =>
                (t.description || '').toLowerCase().includes(lowerQuery) ||
                (t.reference || '').toLowerCase().includes(lowerQuery) ||
                (t.senderName || '').toLowerCase().includes(lowerQuery) ||
                (t.receiverName || '').toLowerCase().includes(lowerQuery)
            );
        }

        // 7. Sort
        result.sort((a, b) => {
            let valA: any = a[sortField as keyof Transaction];
            let valB: any = b[sortField as keyof Transaction];

            if (sortField === 'date') {
                valA = new Date(a.date || a.createdAt || 0).getTime();
                valB = new Date(b.date || b.createdAt || 0).getTime();
            } else if (sortField === 'amount') {
                valA = Math.abs(a.amount);
                valB = Math.abs(b.amount);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [transactions, filters, accountFilter, sortField, sortOrder]);


    const handleExportCSV = () => {
        if (processedTransactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        const headers = ["Date", "Description", "Type", "Reference", "Debit ($)", "Credit ($)", "Status", "Note", "Tags"];
        const csvContent = [
            headers.join(","),
            ...processedTransactions.map(txn => {
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
                    txn.status,
                    `"${(txn.note || '').replace(/"/g, '""')}"`,
                    `"${(txn.tags?.join('; ') || '').replace(/"/g, '""')}"`
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
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Advanced Explorer</h1>
                        <p className="text-muted-foreground text-sm mt-1">Search, filter, and export your complete transaction history</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={fetchTransactions} title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" className="gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" onClick={handleExportCSV}>
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                <GlassCard className="p-4 sm:p-6">
                    <TransactionFilters
                        filters={filters}
                        setFilters={setFilters}
                    />

                    <TransactionTable
                        transactions={processedTransactions}
                        loading={loading}
                        onRowClick={(txn) => setSelectedTxn(txn)}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                </GlassCard>

                <TransactionModal
                    transaction={selectedTxn}
                    isOpen={!!selectedTxn}
                    onClose={() => setSelectedTxn(null)}
                    onUpdateTempMeta={handleUpdateMeta}
                />
            </div>
        </DashboardLayout>
    );
}
