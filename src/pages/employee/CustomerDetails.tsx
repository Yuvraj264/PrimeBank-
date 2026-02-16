import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { customerService } from '@/services/customerService';
import { transactionService } from '@/services/transactionService';
import { User, Account, Transaction } from '@/types';
import {
    User as UserIcon, Mail, Phone, MapPin, Calendar,
    CreditCard, ArrowLeft, ArrowUpRight, ArrowDownRight,
    MoreHorizontal, Shield, Wallet, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<User | null>(null);
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCustomerData();
        }
    }, [id]);

    const loadCustomerData = async () => {
        try {
            // Fetch customer details and their account
            const data = await customerService.getCustomerById(id!);
            setCustomer(data.customer);
            setAccount(data.account);

            // Fetch all transactions and filter for this user
            // In a production app, we would have a specific endpoint for this
            const allTransactions = await transactionService.getAllTransactions();
            const userTransactions = allTransactions.filter(t =>
                (t as any).userId?._id === id || (t as any).userId === id ||
                t.fromAccountId === data.account?.id || t.toAccountId === data.account?.id
            );
            setTransactions(userTransactions);

        } catch (error) {
            console.error('Failed to load customer details:', error);
            toast.error('Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: 'active' | 'blocked') => {
        if (!customer) return;
        try {
            await customerService.updateCustomerStatus(customer.id, newStatus);
            toast.success(`Customer ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
            setCustomer({ ...customer, status: newStatus });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!customer) {
        return (
            <DashboardLayout>
                <div className="text-center p-20">
                    <h2 className="text-xl font-bold">Customer not found</h2>
                    <Button onClick={() => navigate('/employee/customers')} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => navigate('/employee/customers')} className="gap-2 pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4" /> Back to Customers
                </Button>

                {/* Header Profile Card */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <UserIcon className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl border-4 border-background">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">{customer.name}</h1>
                                    <div className="flex items-center gap-3 text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {customer.email}</span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {customer.phone}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={customer.status} />
                                    {customer.status === 'blocked' ? (
                                        <Button onClick={() => handleStatusChange('active')} variant="outline" className="text-success hover:text-success border-success/20 hover:bg-success/10">
                                            <Shield className="w-4 h-4 mr-2" /> Unblock User
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleStatusChange('blocked')} variant="destructive">
                                            <Shield className="w-4 h-4 mr-2" /> Block User
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/10">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Personal Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">ID:</span> <span className="font-mono">{customer.id}</span></p>
                                        <p><span className="text-muted-foreground">Joined:</span> {new Date(customer.createdAt || Date.now()).toLocaleDateString()}</p>
                                        <p><span className="text-muted-foreground">KyC Status:</span> {customer.identityDetails ? 'Verified' : 'Pending'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Address</h4>
                                    <div className="space-y-1 text-sm">
                                        {customer.address ? (
                                            <>
                                                <p>{customer.address.street}</p>
                                                <p>{customer.address.city}, {customer.address.state} {customer.address.zip}</p>
                                                <p>{customer.address.country}</p>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground italic">No address provided</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Primary Account</h4>
                                    {account ? (
                                        <div className="bg-background/40 p-3 rounded-lg border border-border/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium capitalize">{account.type} Account</span>
                                                <StatusBadge status={account.status as any} />
                                            </div>
                                            <p className="font-mono text-sm text-muted-foreground mb-2">{account.accountNumber}</p>
                                            <p className="text-2xl font-bold">${account.balance.toLocaleString()}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No active account</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Transactions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <GlassCard>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-primary" /> Transaction History
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                    Total Transactions: {transactions.length}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {transactions.length > 0 ? (
                                    transactions.map((txn) => {
                                        const isPositive = txn.type === 'deposit' || txn.toAccountId === account?.id;
                                        return (
                                            <div key={txn.id || Math.random()} className="flex items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/5 hover:bg-secondary/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                        {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{txn.description}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(txn.date || txn.createdAt || Date.now()).toLocaleString()} • <span className="capitalize">{txn.type}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${isPositive ? 'text-success' : 'text-foreground'}`}>
                                                        {isPositive ? '+' : '-'}${txn.amount.toLocaleString()}
                                                    </p>
                                                    <StatusBadge status={txn.status} />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No transaction history found for this user.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
