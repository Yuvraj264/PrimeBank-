import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Zap, Wifi, Smartphone, Droplets, CreditCard, Tv, Car, Building2, Flame,
    History, Search, Plus, CalendarClock, ArrowLeft, Loader2, ShieldCheck,
    BellRing, CheckCircle2, CloudLightning, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import { accountService } from '@/services/accountService';
import { transactionService, Transaction } from '@/services/transactionService';
import { format, addDays, isPast, isToday, differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

// Expanded Categories
const categories = [
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'water', name: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'gas', name: 'Piped Gas', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'broadband', name: 'Broadband', icon: Wifi, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'dth', name: 'DTH / Cable', icon: Tv, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'credit_card', name: 'Credit Card', icon: CreditCard, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'insurance', name: 'Insurance', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'subscriptions', name: 'Subscriptions', icon: CloudLightning, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

interface SavedBiller {
    id: string;
    billerId: string;
    consumerNumber: string;
    nickname: string;
    autoPayAmount: number | null;
    autoPayDate: string | null;
    lastPaid: string | null;
    dueDate: string | null;
    dueAmount: number | null;
}

export default function BillPayments() {
    const navigate = useNavigate();
    const { user } = useAppSelector((s) => s.auth);

    // Core Data
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Mock Saved Billers (Persisted locally for simulation)
    const [savedBillers, setSavedBillers] = useState<SavedBiller[]>(() => {
        const saved = localStorage.getItem('primebank_saved_billers');
        if (saved) return JSON.parse(saved);

        // Default mock data
        return [
            {
                id: 'b1',
                billerId: 'electricity',
                consumerNumber: 'ELC9928312',
                nickname: 'Home Electricity',
                autoPayAmount: null,
                autoPayDate: null,
                lastPaid: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: addDays(new Date(), 3).toISOString(),
                dueAmount: 145.20
            },
            {
                id: 'b2',
                billerId: 'broadband',
                consumerNumber: 'ACT92811',
                nickname: 'Office Fiber',
                autoPayAmount: 69.99,
                autoPayDate: '01',
                lastPaid: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                dueDate: addDays(new Date(), 15).toISOString(),
                dueAmount: 69.99
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('primebank_saved_billers', JSON.stringify(savedBillers));
    }, [savedBillers]);

    // Payment Flow State
    const [step, setStep] = useState<'categories' | 'details' | 'confirm' | 'success'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [consumerNumber, setConsumerNumber] = useState('');
    const [nickname, setNickname] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [fetchMode, setFetchMode] = useState<boolean>(true); // true = Fetch, false = Manual

    // Payment Options Flags
    const [saveBiller, setSaveBiller] = useState(false);
    const [setupAutopay, setSetupAutopay] = useState(false);

    // Async simulated states
    const [isFetching, setIsFetching] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Fetched Bill Data
    const [fetchedBill, setFetchedBill] = useState<{ amount: number; dueDate: string; customerName: string } | null>(null);

    const fetchData = async () => {
        try {
            const [accData, txData] = await Promise.all([
                accountService.getMyAccounts(),
                transactionService.getMyTransactions()
            ]);
            setAccounts(accData);
            if (accData.length > 0 && !selectedAccount) setSelectedAccount(accData[0].id);
            setTransactions(txData.filter((t: Transaction) => t.type === 'bill_payment' || t.category === 'bills'));
        } catch (error) {
            toast.error('Failed to load accounts and history');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Format Biller Icon helper
    const getCategoryDetails = (id: string) => categories.find(c => c.id === id) || categories[0];

    // --- Actions ---

    const handleSelectCategory = (id: string) => {
        setSelectedCategory(id);
        setStep('details');
        setConsumerNumber('');
        setAmount('');
        setFetchedBill(null);
        setFetchMode(true);
        setSaveBiller(false);
        setSetupAutopay(false);
    };

    const handleFetchBill = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fetchMode) {
            // Manual entry proceeds directly to Confirm
            if (!amount || Number(amount) <= 0) {
                toast.error("Please enter a valid amount");
                return;
            }
            setStep('confirm');
            return;
        }

        setIsFetching(true);
        try {
            // Simulate 3rd party API fetch
            await new Promise(res => setTimeout(res, 2000));

            // Random mock generation
            const mockAmount = (Math.random() * 200 + 50).toFixed(2);
            const mockDueDate = addDays(new Date(), Math.floor(Math.random() * 15)).toISOString();

            setFetchedBill({
                amount: Number(mockAmount),
                dueDate: mockDueDate,
                customerName: user?.name || 'Valued Customer'
            });
            setAmount(mockAmount);
            setStep('confirm');

        } catch (e) {
            toast.error("Failed to fetch bill. Try entering amount manually.");
        } finally {
            setIsFetching(false);
        }
    };

    const handlePayBill = async () => {
        if (!selectedAccount) return toast.error("Select an account to pay from");

        setIsPaying(true);
        try {
            const biller = getCategoryDetails(selectedCategory || '');

            // Execute real transaction
            await transactionService.payBill({
                billerName: `${biller.name} - ${consumerNumber}`,
                amount: Number(amount),
                billType: selectedCategory || 'utility',
                fromAccountId: selectedAccount
            });

            // Handle Frontend Simulated Features
            if (saveBiller) {
                const newBiller: SavedBiller = {
                    id: Math.random().toString(36).substring(7),
                    billerId: selectedCategory!,
                    consumerNumber,
                    nickname: nickname || `${biller.name} Account`,
                    autoPayAmount: setupAutopay ? Number(amount) : null,
                    autoPayDate: setupAutopay ? new Date().getDate().toString() : null, // Mock scheduling
                    lastPaid: new Date().toISOString(),
                    dueDate: null,
                    dueAmount: null
                };
                setSavedBillers(prev => [...prev.filter(b => b.consumerNumber !== consumerNumber), newBiller]);
            } else {
                // Update last paid if it was an existing saved biller that we just paid manually
                setSavedBillers(prev => prev.map(b => b.consumerNumber === consumerNumber ? {
                    ...b,
                    lastPaid: new Date().toISOString(),
                    dueAmount: null,
                    dueDate: null
                } : b));
            }

            toast.success("Payment Successful!");
            await fetchData(); // Refresh balances and history
            setStep('success');

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
        } finally {
            setIsPaying(false);
        }
    };

    const handlePaySaved = (biller: SavedBiller) => {
        setSelectedCategory(biller.billerId);
        setConsumerNumber(biller.consumerNumber);

        if (biller.dueAmount) {
            setAmount(biller.dueAmount.toString());
            setFetchedBill({
                amount: biller.dueAmount,
                dueDate: biller.dueDate || new Date().toISOString(),
                customerName: user?.name || ''
            });
            setFetchMode(true);
            setStep('confirm');
        } else {
            setFetchedBill(null);
            setAmount('');
            setFetchMode(false);
            setStep('details');
        }
    };

    // --- Renderers ---

    const renderDueIndicator = (dueDate: string | null) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const days = differenceInDays(date, new Date());

        if (isPast(date) && !isToday(date)) return <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Overdue</span>;
        if (days <= 3) return <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Due in {days === 0 ? 'Today' : `${days} days`}</span>;
        return <span className="text-xs text-muted-foreground">{format(date, 'MMM d, yyyy')}</span>;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Recharge & Pay Bills</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage all your utility and scheduled payments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left/Main Column - Payment Flows */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        <GlassCard className="relative overflow-hidden min-h-[500px] border-border/50">
                            <AnimatePresence mode="wait">

                                {step === 'categories' && (
                                    <motion.div
                                        key="categories"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="p-6"
                                    >
                                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-primary" /> What would you like to pay?
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleSelectCategory(cat.id)}
                                                    className="p-5 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50 transition-all duration-300 group flex flex-col items-center gap-3 text-center"
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.bg}`}>
                                                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                                    </div>
                                                    <span className="text-sm font-medium">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'details' && selectedCategory && (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="p-6 flex flex-col h-full"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <button onClick={() => setStep('categories')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryDetails(selectedCategory).bg}`}>
                                                    {(() => { const I = getCategoryDetails(selectedCategory).icon; return <I className={`w-5 h-5 ${getCategoryDetails(selectedCategory).color}`} /> })()}
                                                </div>
                                                <h3 className="text-xl font-semibold">Pay {getCategoryDetails(selectedCategory).name}</h3>
                                            </div>
                                        </div>

                                        <form onSubmit={handleFetchBill} className="max-w-md mx-auto w-full flex-1 space-y-6">

                                            {/* Toggle Fetch Mode */}
                                            <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/50">
                                                <button type="button" onClick={() => setFetchMode(true)} className={`flex-1 text-sm py-2 rounded-md transition-colors ${fetchMode ? 'bg-primary/20 text-primary font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Fetch Bill</button>
                                                <button type="button" onClick={() => setFetchMode(false)} className={`flex-1 text-sm py-2 rounded-md transition-colors ${!fetchMode ? 'bg-primary/20 text-primary font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Manual Entry</button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Account / Consumer Number</Label>
                                                <Input
                                                    placeholder="e.g. 1234567890"
                                                    value={consumerNumber}
                                                    onChange={e => setConsumerNumber(e.target.value)}
                                                    className="h-12 bg-background/50"
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground">Find this on your latest bill statement.</p>
                                            </div>

                                            {!fetchMode && (
                                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                                    <Label>Payment Amount ($)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={amount}
                                                        onChange={e => setAmount(e.target.value)}
                                                        className="h-12 bg-background/50 font-mono text-lg"
                                                        required
                                                    />
                                                </div>
                                            )}

                                            <div className="pt-6">
                                                <Button type="submit" className="w-full h-12 text-md transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]" disabled={isFetching || !consumerNumber}>
                                                    {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : fetchMode ? 'Fetch Bill Details' : 'Continue to Payment'}
                                                </Button>
                                            </div>

                                        </form>
                                    </motion.div>
                                )}

                                {step === 'confirm' && (
                                    <motion.div
                                        key="confirm"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="p-6 h-full overflow-y-auto"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <button onClick={() => setStep('details')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                            <h3 className="text-xl font-semibold">Review & Pay</h3>
                                        </div>

                                        <div className="max-w-md mx-auto space-y-6">

                                            {/* Bill Summary Card */}
                                            <div className="bg-gradient-to-br from-secondary/40 to-background border border-border/50 rounded-2xl p-6 relative overflow-hidden">
                                                {/* Background flair */}
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryDetails(selectedCategory || '').bg}`}>
                                                        {(() => { const I = getCategoryDetails(selectedCategory || '').icon; return <I className={`w-4 h-4 ${getCategoryDetails(selectedCategory || '').color}`} /> })()}
                                                    </div>
                                                    <span className="font-medium text-foreground/80">{getCategoryDetails(selectedCategory || '').name}</span>
                                                </div>

                                                <div className="space-y-1 mb-6">
                                                    <p className="text-sm text-muted-foreground">Amount Due</p>
                                                    <p className="text-4xl font-bold tracking-tight text-foreground">${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>

                                                {fetchedBill && (
                                                    <div className="grid grid-cols-2 gap-4 text-sm bg-background/50 p-3 rounded-lg border border-border/50">
                                                        <div>
                                                            <p className="text-muted-foreground text-xs">Due Date</p>
                                                            <p className="font-medium">{format(new Date(fetchedBill.dueDate), 'MMM dd, yyyy')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-muted-foreground text-xs">Customer</p>
                                                            <p className="font-medium truncate">{fetchedBill.customerName}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-muted-foreground text-xs">Account / Consumer ID</p>
                                                            <p className="font-mono">{consumerNumber}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Payment Source */}
                                            <div className="space-y-3">
                                                <Label>Pay From</Label>
                                                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                                    <SelectTrigger className="h-14 bg-secondary/20">
                                                        <SelectValue placeholder="Select Account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map(acc => (
                                                            <SelectItem key={acc.id} value={acc.id}>
                                                                <div className="flex justify-between items-center w-full gap-4">
                                                                    <span>{acc.type.replace('_', ' ')} (..{acc.accountNumber.slice(-4)})</span>
                                                                    <span className="font-mono text-muted-foreground">${acc.balance.toLocaleString('en-US')}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>

                                                </Select>
                                            </div>

                                            {/* Preferences */}
                                            <div className="space-y-4 pt-2 border-t border-border/50 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Save Biller Details</Label>
                                                        <p className="text-xs text-muted-foreground">Quickly pay next time without entering ID</p>
                                                    </div>
                                                    <Switch checked={saveBiller} onCheckedChange={setSaveBiller} />
                                                </div>

                                                {saveBiller && (
                                                    <div className="pl-4 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2">
                                                        <div className="space-y-1">
                                                            <Input
                                                                placeholder="Biller Nickname (e.g. Home Electric)"
                                                                value={nickname}
                                                                onChange={e => setNickname(e.target.value)}
                                                                className="h-10 text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label className="text-xs flex items-center gap-1"><CalendarClock className="w-3 h-3 text-primary" /> Setup Auto-pay</Label>
                                                                <p className="text-[10px] text-muted-foreground">Automatically pay this biller each month</p>
                                                            </div>
                                                            <Switch checked={setupAutopay} onCheckedChange={setSetupAutopay} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={handlePayBill}
                                                disabled={isPaying || !selectedAccount}
                                                className="w-full h-14 text-lg font-medium shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                                            >
                                                {isPaying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                                {isPaying ? 'Processing Payment...' : `Confirm & Pay $${amount}`}
                                            </Button>

                                        </div>
                                    </motion.div>
                                )}

                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="p-12 flex flex-col items-center justify-center h-full text-center"
                                    >
                                        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-success" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                                        <p className="text-muted-foreground max-w-sm mb-8">
                                            Your payment of <strong className="text-foreground">${amount}</strong> to {getCategoryDetails(selectedCategory || '').name} was successfully processed.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={() => navigate('/customer/transactions')}>View Receipt</Button>
                                            <Button onClick={() => setStep('categories')}>Pay Another Bill</Button>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </GlassCard>
                    </div>

                    {/* Right/Side Column */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">

                        {/* Saved Billers & Reminders */}
                        <GlassCard className="border-border/50">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <BellRing className="w-4 h-4 text-primary" /> Reminders & Saved
                                </h3>
                                <span className="text-xs bg-secondary/50 px-2 py-1 rounded-full">{savedBillers.length}</span>
                            </div>

                            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {savedBillers.length > 0 ? (
                                    savedBillers.map((biller) => {
                                        const c = getCategoryDetails(biller.billerId);
                                        return (
                                            <div key={biller.id} className="p-3 hover:bg-secondary/30 rounded-xl transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                                                        <c.icon className={`w-5 h-5 ${c.color}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-semibold truncate">{biller.nickname}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-xs text-muted-foreground font-mono truncate">{biller.consumerNumber}</p>
                                                            {biller.autoPayAmount && (
                                                                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1 rounded flex items-center">
                                                                    <Activity className="w-3 h-3 mr-0.5" /> Auto
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end shrink-0 ml-3">
                                                    {biller.dueAmount && step === 'categories' ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-xs font-semibold hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                                                            onClick={() => handlePaySaved(biller)}
                                                        >
                                                            Pay ${biller.dueAmount}
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {renderDueIndicator(biller.dueDate)}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 mt-1 opacity-0 group-hover:opacity-100"
                                                                onClick={() => handlePaySaved(biller)}
                                                            >
                                                                <ArrowLeft className="w-4 h-4 rotate-135" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center p-6 text-sm text-muted-foreground bg-secondary/10 rounded-xl m-2 border border-dashed border-border/50">
                                        No saved billers yet. You can save them after making a payment.
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Recent History */}
                        <GlassCard className="border-border/50 flex flex-col h-[400px]">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <History className="w-4 h-4 text-primary" /> Recent Payments
                                </h3>
                                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/customer/transactions')}>View All</Button>
                            </div>

                            <div className="p-2 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                {loadingData ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                                ) : transactions.length > 0 ? (
                                    transactions.slice(0, 10).map((tx) => {
                                        // Attempt to find category from transaction description, or fallback
                                        const foundCat = categories.find(c => tx.description?.toLowerCase().includes(c.id) || tx.description?.toLowerCase().includes(c.name.toLowerCase()));
                                        const DisplayIcon = foundCat ? foundCat.icon : Receipt;
                                        const colorStr = foundCat ? foundCat.color : 'text-muted-foreground';

                                        return (
                                            <div key={tx.id} className="p-3 hover:bg-secondary/30 rounded-xl transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                                                        <DisplayIcon className={`w-4 h-4 ${colorStr}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium capitalize truncate max-w-[150px]">{tx.reference || tx.description || 'Bill Payment'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{format(new Date(tx.date || tx.createdAt || ''), 'MMM dd, h:mm a')}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-foreground">-${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center p-6 text-sm text-muted-foreground">
                                        No recent bill payment history.
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

// Fallback icon for history
const Receipt = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" /></svg>
);
