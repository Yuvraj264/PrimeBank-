import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp, PieChart, Download, Plus, Landmark, HandCoins, ArrowUpRight,
    ArrowDownRight, Loader2, CheckCircle2, ChevronRight, RefreshCcw
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---

const performanceData = [
    { month: 'Sep', value: 42000 },
    { month: 'Oct', value: 43500 },
    { month: 'Nov', value: 42800 },
    { month: 'Dec', value: 46100 },
    { month: 'Jan', value: 48900 },
    { month: 'Feb', value: 52450 },
];

const mockMutualFunds = [
    { id: '1', name: 'PrimeBank Large Cap Fund', type: 'Equity', invested: 15000, currentValue: 18450, returns: 23.0 },
    { id: '2', name: 'Global Tech ETF', type: 'Index', invested: 8000, currentValue: 11200, returns: 40.0 },
    { id: '3', name: 'Conservative Debt Fund', type: 'Debt', invested: 10000, currentValue: 10800, returns: 8.0 },
];

interface Deposit {
    id: string;
    type: 'FD' | 'RD';
    principal: number;
    interestRate: number;
    maturityDate: string;
    maturityAmount: number;
    status: 'active' | 'matured';
}

const initialDeposits: Deposit[] = [
    { id: 'FD-9021', type: 'FD', principal: 10000, interestRate: 6.5, maturityDate: '2025-08-15', maturityAmount: 11350, status: 'active' },
    { id: 'RD-1123', type: 'RD', principal: 6000, interestRate: 5.8, maturityDate: '2024-11-01', maturityAmount: 6450, status: 'active' },
];

export default function Investments() {
    const { user } = useAppSelector((s) => s.auth);

    // UI State
    const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
    const [isDownloading, setIsDownloading] = useState(false);

    // New Deposit Modal State
    const [showNewDeposit, setShowNewDeposit] = useState(false);
    const [newDepType, setNewDepType] = useState<'FD' | 'RD'>('FD');
    const [newDepAmount, setNewDepAmount] = useState(1000);
    const [newDepTenure, setNewDepTenure] = useState(12); // months
    const [isProcessingDep, setIsProcessingDep] = useState(false);

    // Derived Portfolio Values
    const currentMfValue = mockMutualFunds.reduce((acc, curr) => acc + curr.currentValue, 0);
    const investedMfValue = mockMutualFunds.reduce((acc, curr) => acc + curr.invested, 0);
    const currentDepositValue = deposits.reduce((acc, curr) => acc + curr.principal, 0); // simplifying

    const totalPortfolioValue = currentMfValue + currentDepositValue;
    const totalInvested = investedMfValue + currentDepositValue;
    const totalAbsoluteReturns = totalPortfolioValue - totalInvested;
    const percentageReturn = (totalAbsoluteReturns / totalInvested) * 100;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            await new Promise(res => setTimeout(res, 2000));
            // Simulate browser download
            const blob = new Blob([`Consolidated Investment Report for ${user?.name}\nTotal Value: ${totalPortfolioValue}`], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PrimeBank_Investments_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Investment Report Downloaded');
        } catch (e) {
            toast.error('Failed to generate report');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCreateDeposit = () => {
        setIsProcessingDep(true);
        setTimeout(() => {
            const rate = newDepType === 'FD' ? 6.5 : 5.8; // mock rates
            const maturityAmount = newDepType === 'FD'
                ? newDepAmount * Math.pow(1 + (rate / 100), newDepTenure / 12)
                : (newDepAmount * newDepTenure) + 150; // overly simplified RD math

            const newDeposit: Deposit = {
                id: `${newDepType}-${Math.floor(Math.random() * 10000)}`,
                type: newDepType,
                principal: newDepType === 'FD' ? newDepAmount : (newDepAmount * newDepTenure),
                interestRate: rate,
                maturityDate: new Date(new Date().setMonth(new Date().getMonth() + newDepTenure)).toISOString().split('T')[0],
                maturityAmount: Math.round(maturityAmount),
                status: 'active'
            };

            setDeposits(prev => [newDeposit, ...prev]);
            setShowNewDeposit(false);
            setIsProcessingDep(false);
            toast.success(`${newDepType} successfully opened!`);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Wealth & Investments</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your mutual funds, FDs, RDs, and track portfolio growth</p>
                    </div>
                    <Button
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        className="shadow-[0_0_15px_rgba(0,255,255,0.1)] gap-2"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download Report
                    </Button>
                </div>

                {/* Portfolio Top Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Key Metrics Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <GlassCard className="p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <PieChart className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg text-foreground/90">Total Portfolio Value</h3>
                            </div>
                            <div className="mb-2">
                                <p className="text-4xl font-bold tracking-tight text-foreground glow-text-subtle">{formatCurrency(totalPortfolioValue)}</p>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-6">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground">Total Invested</p>
                                    <p className="font-medium text-foreground/80">{formatCurrency(totalInvested)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-muted-foreground">Overall Returns</p>
                                    <div className="flex items-center justify-end gap-1 font-semibold text-success">
                                        <ArrowUpRight className="w-4 h-4" />
                                        {formatCurrency(totalAbsoluteReturns)} ({percentageReturn.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-2 gap-4">
                            <GlassCard className="p-4 flex flex-col justify-center border-border/50">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">Mutual Funds</p>
                                <p className="font-semibold text-lg">{formatCurrency(currentMfValue)}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center border-border/50">
                                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                                    <Landmark className="w-4 h-4 text-orange-500" />
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">Deposits (FD/RD)</p>
                                <p className="font-semibold text-lg">{formatCurrency(currentDepositValue)}</p>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="lg:col-span-8">
                        <GlassCard className="p-6 border-border/50 h-full flex flex-col">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Portfolio Growth (6 Months)
                            </h3>
                            <div className="flex-1 w-full min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                                            formatter={(value: number) => [formatCurrency(value), 'Value']}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="funds" className="space-y-6 pt-6">
                    <TabsList className="bg-secondary/40 p-1">
                        <TabsTrigger value="funds">Mutual Funds</TabsTrigger>
                        <TabsTrigger value="deposits">Fixed & Recurring Deposits</TabsTrigger>
                    </TabsList>

                    {/* TAB: MUTUAL FUNDS */}
                    <TabsContent value="funds" className="focus:outline-none focus:ring-0">
                        <GlassCard className="border-border/50 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" /> Active SIPs & Lumpsums
                                </h3>
                                <Button variant="outline" size="sm" className="gap-1">Explore Funds <ChevronRight className="w-4 h-4" /></Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 rounded-lg">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Fund Name</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3 text-right">Invested</th>
                                            <th className="px-4 py-3 text-right">Current Value</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Returns (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {mockMutualFunds.map((fund) => (
                                            <tr key={fund.id} className="hover:bg-secondary/10 transition-colors group">
                                                <td className="px-4 py-4 font-medium text-foreground">{fund.name}</td>
                                                <td className="px-4 py-4"><span className="bg-secondary px-2 py-1 rounded text-xs">{fund.type}</span></td>
                                                <td className="px-4 py-4 text-right font-mono text-muted-foreground">{formatCurrency(fund.invested)}</td>
                                                <td className="px-4 py-4 text-right font-mono font-semibold">{formatCurrency(fund.currentValue)}</td>
                                                <td className="px-4 py-4 text-right font-mono font-bold text-success group-hover:glow-text-subtle">
                                                    +{fund.returns.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </TabsContent>

                    {/* TAB: DEPOSITS */}
                    <TabsContent value="deposits" className="focus:outline-none focus:ring-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Manage List */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-lg">Active Term Deposits</h3>
                                    <Button size="sm" onClick={() => setShowNewDeposit(true)} className="gap-1 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                                        <Plus className="w-4 h-4" /> Open New
                                    </Button>
                                </div>

                                {deposits.map(dep => (
                                    <GlassCard key={dep.id} className="p-4 border-border/50 hover:border-primary/30 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                <Landmark className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-base">{dep.type === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'}</h4>
                                                <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {dep.id} • Rate: <span className="text-foreground font-medium">{dep.interestRate}% p.a</span></p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground mb-1">Maturity Value</p>
                                            <p className="font-bold text-lg text-foreground">{formatCurrency(dep.maturityAmount)}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Matures on: {new Date(dep.maturityDate).toLocaleDateString()}</p>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>

                            {/* Open New Modal/Panel */}
                            <div className="lg:col-span-4 relative">
                                <AnimatePresence>
                                    {showNewDeposit ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute md:relative inset-0 bg-background md:bg-transparent z-10"
                                        >
                                            <GlassCard className="p-6 border-primary/30 border-2">
                                                <h3 className="font-semibold text-lg mb-6 flex items-center justify-between">
                                                    Open New Deposit
                                                    <Button variant="ghost" size="sm" onClick={() => setShowNewDeposit(false)} className="h-6 w-6 p-0 rounded-full bg-secondary">X</Button>
                                                </h3>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Deposit Type</Label>
                                                        <div className="flex p-1 bg-secondary/30 rounded-lg">
                                                            <button
                                                                className={`flex-1 py-1.5 text-sm rounded ${newDepType === 'FD' ? 'bg-background shadow font-medium' : 'text-muted-foreground'}`}
                                                                onClick={() => setNewDepType('FD')}
                                                            >Fixed (Lumpsum)</button>
                                                            <button
                                                                className={`flex-1 py-1.5 text-sm rounded ${newDepType === 'RD' ? 'bg-background shadow font-medium' : 'text-muted-foreground'}`}
                                                                onClick={() => setNewDepType('RD')}
                                                            >Recurring (Monthly)</button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex justify-between items-center"><Label>Amount ($)</Label><span className="font-mono text-sm">{formatCurrency(newDepAmount)}</span></div>
                                                        <Slider value={[newDepAmount]} min={500} max={100000} step={500} onValueChange={(val) => setNewDepAmount(val[0])} />
                                                    </div>

                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex justify-between items-center"><Label>Tenure (Months)</Label><span className="font-mono text-sm">{newDepTenure} Months</span></div>
                                                        <Slider value={[newDepTenure]} min={6} max={120} step={6} onValueChange={(val) => setNewDepTenure(val[0])} />
                                                    </div>

                                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6 text-center space-y-1">
                                                        <p className="text-xs text-muted-foreground">Est. Maturity Amount</p>
                                                        <p className="text-2xl font-bold tracking-tight text-primary">
                                                            {formatCurrency(newDepType === 'FD' ? newDepAmount * Math.pow(1 + (6.5 / 100), newDepTenure / 12) : (newDepAmount * newDepTenure) * 1.058)}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground pt-1">Assuming current rate of {newDepType === 'FD' ? '6.5%' : '5.8%'} p.a.</p>
                                                    </div>

                                                    <div className="space-y-2 pt-2">
                                                        <div className="flex justify-between items-center"><Label>Tenure (Months)</Label><span className="font-mono text-sm">{newDepTenure} Months</span></div>
                                                        <Slider value={[newDepTenure]} min={6} max={120} step={6} onValueChange={(val) => setNewDepTenure(val[0])} />
                                                    </div>

                                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6 text-center space-y-1">
                                                        <p className="text-xs text-muted-foreground">Est. Maturity Amount</p>
                                                        <p className="text-2xl font-bold tracking-tight text-primary">
                                                            {formatCurrency(newDepType === 'FD' ? newDepAmount * Math.pow(1 + (6.5 / 100), newDepTenure / 12) : (newDepAmount * newDepTenure) * 1.058)}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground pt-1">Assuming current rate of {newDepType === 'FD' ? '6.5%' : '5.8%'} p.a.</p>
                                                    </div>

                                                    <Button onClick={handleCreateDeposit} disabled={isProcessingDep} className="w-full mt-4 bg-primary text-primary-foreground">
                                                        {isProcessingDep ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                                        Confirm & Open
                                                    </Button>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ) : (
                                        <GlassCard className="p-8 border-dashed border-border/50 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[300px]">
                                            <HandCoins className="w-10 h-10 mb-4 opacity-50 text-primary" />
                                            <p className="text-sm">Put your idle money to work.<br />Open a high-yield Fixed or Recurring deposit instantly.</p>
                                            <Button variant="secondary" className="mt-6" onClick={() => setShowNewDeposit(true)}>Start Building Wealth</Button>
                                        </GlassCard>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

            </div>
        </DashboardLayout>
    );
}

// Fallback Icon component
const Activity = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
