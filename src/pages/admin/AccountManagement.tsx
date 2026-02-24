import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services/adminService';
import { Search, History, MoreHorizontal, CreditCard, Ban, Unlock, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

export default function AccountManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(false);

    const fetchAccounts = async () => {
        try {
            const data = await adminService.getAllAccounts();
            setAccounts(data.data || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const filteredAccounts = (accounts || []).filter(acc => {
        const matchesSearch =
            acc.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || acc.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewTransactions = async (account: any) => {
        setSelectedAccount(account);
        setLoadingTx(true);
        try {
            const data = await adminService.getAccountTransactions(account.id || account._id);
            setTransactions(data.data || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setTransactions([]);
            toast.error('Failed to load transaction history');
        } finally {
            setLoadingTx(false);
        }
    };

    const handleAction = async (accountId: string, action: 'active' | 'blocked') => {
        try {
            await adminService.updateAccountStatus(accountId, action);
            toast.success(`Account status updated to ${action}`);
            setAccounts(accounts.map(acc => acc.id === accountId || acc._id === accountId ? { ...acc, status: action } : acc));
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to update account status');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Account Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">Monitor and manage customer bank accounts</p>
                    </div>
                </div>

                <GlassCard>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search account number or owner..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {filteredAccounts.map((account) => (
                                    <div key={account.id || account._id} className="p-5 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col group relative">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="gap-2"
                                                        onClick={() => handleViewTransactions(account)}
                                                    >
                                                        <History className="w-4 h-4" /> View Transactions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {account.status === 'blocked' ? (
                                                        <DropdownMenuItem
                                                            className="gap-2 text-success"
                                                            onClick={() => handleAction(account.id || account._id, 'active')}
                                                        >
                                                            <Unlock className="w-4 h-4" /> Unfreeze
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="gap-2 text-destructive"
                                                            onClick={() => handleAction(account.id || account._id, 'blocked')}
                                                        >
                                                            <Ban className="w-4 h-4" /> Freeze
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <CreditCard className="w-6 h-6 text-primary" />
                                            </div>
                                            <StatusBadge status={account.status} />
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="font-mono font-bold text-lg">{account.accountNumber}</h3>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{account.type} Account</p>
                                        </div>

                                        <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Balance</p>
                                                <p className="text-xl font-bold text-primary">${account.balance?.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Owner</p>
                                                <p className="text-xs font-medium truncate max-w-[100px]">{account.userId?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </GlassCard>

                <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Transaction History - {selectedAccount?.accountNumber}</DialogTitle>
                        </DialogHeader>
                        {loadingTx ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : transactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id || tx._id}>
                                            <TableCell className="text-xs font-mono">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="capitalize">{tx.type}</TableCell>
                                            <TableCell>{tx.description}</TableCell>
                                            <TableCell className={`text-right font-semibold ${tx.type === 'debit' ? 'text-destructive' : 'text-success'}`}>
                                                {tx.type === 'debit' ? '-' : '+'}${tx.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={tx.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions found for this account.
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
