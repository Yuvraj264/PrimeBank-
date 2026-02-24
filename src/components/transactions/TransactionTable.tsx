import { useEffect, useRef, useState, useCallback } from 'react';
import { Transaction } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { ArrowUpRight, ArrowDownRight, ArrowUpDown, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface Props {
    transactions: Transaction[];
    loading: boolean;
    onRowClick: (txn: Transaction) => void;
    sortField: keyof Transaction | 'date';
    sortOrder: 'asc' | 'desc';
    onSort: (field: keyof Transaction | 'date') => void;
}

const ITEMS_PER_PAGE = 15;

export default function TransactionTable({ transactions, loading, onRowClick, sortField, sortOrder, onSort }: Props) {
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Reset pagination when data changes
    useEffect(() => {
        setDisplayedCount(ITEMS_PER_PAGE);
    }, [transactions]);

    const loadMore = useCallback(() => {
        if (displayedCount < transactions.length) {
            // Simulate network delay for infinite scroll feel
            setTimeout(() => {
                setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, transactions.length));
            }, 500);
        }
    }, [displayedCount, transactions.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMore]);

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />;
        return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1 text-primary" /> : <ChevronDown className="w-4 h-4 ml-1 text-primary" />;
    };

    const displayedTransactions = transactions.slice(0, displayedCount);

    if (loading && transactions.length === 0) {
        return (
            <div className="w-full space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/5 animate-pulse h-[72px]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/40" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-secondary/40 rounded" />
                                <div className="h-3 w-24 bg-secondary/20 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="h-6 w-20 bg-secondary/40 rounded-full hidden md:block" />
                            <div className="h-5 w-16 bg-secondary/40 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">No transactions found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    We couldn't find any transactions matching your current filters. Try adjusting them or clearing your search.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full relative overflow-x-auto rounded-xl border border-border/50 bg-card/30">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                    <tr>
                        <th className="px-5 py-4 font-semibold w-16 invisible md:visible">Type</th>
                        <th className="px-5 py-4 font-semibold cursor-pointer group hover:text-foreground transition-colors" onClick={() => onSort('description')}>
                            <div className="flex items-center">Description <SortIcon field="description" /></div>
                        </th>
                        <th className="px-5 py-4 font-semibold cursor-pointer group hover:text-foreground transition-colors hidden md:table-cell" onClick={() => onSort('date')}>
                            <div className="flex items-center">Date <SortIcon field="date" /></div>
                        </th>
                        <th className="px-5 py-4 font-semibold cursor-pointer group hover:text-foreground transition-colors hidden sm:table-cell" onClick={() => onSort('status')}>
                            <div className="flex items-center justify-center">Status <SortIcon field="status" /></div>
                        </th>
                        <th className="px-5 py-4 font-semibold cursor-pointer group hover:text-foreground transition-colors text-right" onClick={() => onSort('amount')}>
                            <div className="flex items-center justify-end">Amount <SortIcon field="amount" /></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayedTransactions.map((txn, index) => {
                        const isIncoming = txn.category === 'income' || txn.type === 'deposit';
                        const isBill = txn.type === 'bill_payment' || txn.category === 'bills';
                        const dateStr = new Date(txn.date || txn.createdAt || '').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });

                        return (
                            <tr
                                key={txn.id + index}
                                onClick={() => onRowClick(txn)}
                                className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer group"
                            >
                                <td className="px-5 py-4 w-16 hidden md:table-cell transition-transform group-hover:scale-110">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncoming ? 'bg-success/10 text-success' :
                                            isBill ? 'bg-orange-500/10 text-orange-500' :
                                                'bg-destructive/10 text-destructive'
                                        }`}>
                                        {isIncoming ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                        {txn.description}
                                        {txn.note && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has Note" />}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 md:hidden">
                                        {dateStr}
                                    </div>
                                    {txn.tags && txn.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1.5">
                                            {txn.tags.map(t => (
                                                <span key={t} className="text-[9px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                                    {dateStr}
                                </td>
                                <td className="px-5 py-4 hidden sm:table-cell text-center">
                                    <StatusBadge status={txn.status} />
                                </td>
                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                    <span className={`font-bold tabular-nums ${isIncoming ? 'text-success' : 'text-foreground'}`}>
                                        {isIncoming ? '+' : '-'}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                    <div className="sm:hidden mt-1 flex justify-end">
                                        <StatusBadge status={txn.status} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Infinite Scroll Target */}
            {displayedCount < transactions.length && (
                <div ref={observerTarget} className="p-6 flex justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
                        Loading more transactions...
                    </div>
                </div>
            )}
        </div>
    );
}
