import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAccounts, mockUsers } from '@/data/mockData';
import { Search, Filter, Ban, Unlock, Eye, CreditCard, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function AccountManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accounts, setAccounts] = useState(mockAccounts);

    const filteredAccounts = accounts.filter(acc => {
        const user = mockUsers.find(u => u.id === acc.userId);
        const searchString = `${acc.accountNumber} ${user?.name || ''}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (id: string, action: 'frozen' | 'active') => {
        setAccounts(accounts.map(a => a.id === id ? { ...a, status: action } : a));
        toast.success(`Account status updated to ${action}`);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Account Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">Oversee customer bank accounts</p>
                </div>

                <GlassCard>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by account number or owner..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-muted-foreground" />
                                        <SelectValue placeholder="Filter Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="frozen">Frozen</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                        {filteredAccounts.map((account) => {
                            const user = mockUsers.find(u => u.id === account.userId);
                            return (
                                <div key={account.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-secondary/10 border border-border/5 hover:bg-secondary/20 transition-colors">
                                    <div className="md:col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm">{account.accountNumber}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{account.type} Account</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-3">
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>

                                    <div className="md:col-span-3 text-right md:text-left">
                                        <p className="text-sm font-bold">${account.balance.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Currency: {account.currency}</p>
                                    </div>

                                    <div className="md:col-span-2 flex justify-end items-center gap-3">
                                        <StatusBadge status={account.status} />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-2">
                                                    <Eye className="w-4 h-4" /> View Transactions
                                                </DropdownMenuItem>
                                                {account.status === 'active' ? (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive"
                                                        onClick={() => handleAction(account.id, 'frozen')}
                                                    >
                                                        <Ban className="w-4 h-4" /> Freeze Account
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-success"
                                                        onClick={() => handleAction(account.id, 'active')}
                                                    >
                                                        <Unlock className="w-4 h-4" /> Unfreeze Account
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
