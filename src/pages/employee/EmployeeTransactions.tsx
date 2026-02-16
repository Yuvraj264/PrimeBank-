import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { transactionService } from '@/services/transactionService';
import { Transaction } from '@/types';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye, Flag, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function EmployeeTransactions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
        const interval = setInterval(loadTransactions, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await transactionService.getAllTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        // Safe string comparison
        const searchString = `${t.description} ${t.id} ${t.senderName || ''} ${t.receiverName || ''}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());

        // Filter by strict types or 'all'
        const matchesType = typeFilter === 'all' || t.type === typeFilter;

        return matchesSearch && matchesType;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">System Transactions</h1>
                        <p className="text-muted-foreground text-sm mt-1">Monitor and manage all banking transactions</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>

                <GlassCard>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, user, or description..."
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
                                    <SelectItem value="deposit">Deposit</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                    <SelectItem value="bill_payment">Bill Payment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center p-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn) => {
                                // Infer direction based on type/account for demo purposes
                                // In a real app, this would be determined by the context (credit vs debit)
                                const isPositive = txn.type === 'deposit' || txn.category === 'income';
                                const user = (txn as any).userId; // Populated by backend

                                return (
                                    <div key={txn.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-secondary/10 border border-border/5 hover:bg-secondary/20 transition-colors">
                                        <div className="md:col-span-5 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{txn.description}</p>
                                                <p className="text-xs text-muted-foreground font-mono">TXN-{txn.id?.substring(0, 8)}...</p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm">{user?.name || 'Unknown User'}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(txn.date || txn.createdAt || Date.now()).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 text-right">
                                            <span className={`font-bold ${isPositive ? 'text-success' : 'text-foreground'}`}>
                                                {isPositive ? '+' : '-'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end items-center gap-3">
                                            <StatusBadge status={txn.status} />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem className="gap-2">
                                                        <Eye className="w-4 h-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 text-warning">
                                                        <Flag className="w-4 h-4" /> Flag as Suspicious
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions found.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
