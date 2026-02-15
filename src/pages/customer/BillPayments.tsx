import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Zap, Wifi, Smartphone, Droplets, CreditCard, Tv, Car, Home, History } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import { accountService } from '@/services/accountService';
import { transactionService, Transaction } from '@/services/transactionService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const billers = [
    { id: 1, name: 'Electricity', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 2, name: 'Water', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 3, name: 'Internet', icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 4, name: 'Mobile', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 5, name: 'Credit Card', icon: CreditCard, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 6, name: 'Cable TV', icon: Tv, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 7, name: 'Insurance', icon: Car, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 8, name: 'Rent/Mortgage', icon: Home, color: 'text-green-400', bg: 'bg-green-400/10' },
];

export default function BillPayments() {
    const navigate = useNavigate();
    const [selectedBiller, setSelectedBiller] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [consumerNumber, setConsumerNumber] = useState('');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [recentPayments, setRecentPayments] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAppSelector((s) => s.auth);

    const fetchData = async () => {
        try {
            const [accData, txData] = await Promise.all([
                accountService.getMyAccounts(),
                transactionService.getMyTransactions()
            ]);
            setAccounts(accData);
            if (accData.length > 0 && !selectedAccount) setSelectedAccount(accData[0].id);

            // Filter for bill payments
            const bills = txData.filter((t: Transaction) =>
                t.type === 'bill_payment' || t.category === 'bills'
            ).slice(0, 5);
            setRecentPayments(bills);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error('Failed to load banking data');
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const biller = billers.find(b => b.id === selectedBiller);
            await transactionService.payBill({
                billerName: biller?.name || 'Utility',
                amount: Number(amount),
                billType: biller?.name || 'Utility',
                fromAccountId: selectedAccount
            });
            toast.success('Bill payment processed successfully');
            setSelectedBiller(null);
            setAmount('');
            setConsumerNumber('');

            // Refresh data to show new balance and transaction history
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const getBillerIcon = (billerName: string) => {
        const biller = billers.find(b => b.name === billerName) || billers.find(b => billerName.includes(b.name));
        return biller ? biller.icon : Zap;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Bill Payments</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pay your utility bills and more</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GlassCard className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Select Biller</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {billers.map((biller) => (
                                <button
                                    key={biller.id}
                                    onClick={() => setSelectedBiller(biller.id)}
                                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${selectedBiller === biller.id
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-secondary/30 border-border/10 hover:bg-secondary/50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${biller.bg}`}>
                                        <biller.icon className={`w-5 h-5 ${biller.color}`} />
                                    </div>
                                    <span className="text-sm font-medium">{biller.name}</span>
                                </button>
                            ))}
                        </div>

                        {selectedBiller && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                                <form onSubmit={handlePay} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Pay From Account</Label>
                                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.type.replace('_', ' ')} (**** {acc.accountNumber.slice(-4)}) - ${acc.balance.toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Consumer Number / Account ID</Label>
                                        <Input
                                            placeholder="Enter ID"
                                            value={consumerNumber}
                                            onChange={(e) => setConsumerNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-8"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={() => setSelectedBiller(null)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? 'Processing...' : 'Pay Bill'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                        {recentPayments.length > 0 ? (
                            <div className="space-y-4">
                                {recentPayments.map((tx) => {
                                    const Icon = getBillerIcon(tx.reference || tx.description || '');
                                    return (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tx.reference || tx.description}</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-destructive">-${Math.abs(tx.amount).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No recent bill payments</p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full mt-4 text-xs"
                            onClick={() => navigate('/customer/transactions?type=bill_payment')}
                        >
                            View All History
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
