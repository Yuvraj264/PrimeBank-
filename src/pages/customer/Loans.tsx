import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Home, Car, GraduationCap, Briefcase, Download, DollarSign, Wallet,
    Calculator, CheckCircle2, AlertCircle, Percent, Calendar, RefreshCcw, Landmark
} from 'lucide-react';
import { useAppSelector } from '@/store';
import { format, addMonths } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const loanTypes = [
    { id: 'personal', name: 'Personal Loan', icon: Briefcase, rate: 10.5, bg: 'bg-blue-500/10', color: 'text-blue-500' },
    { id: 'home', name: 'Home Loan', icon: Home, rate: 8.5, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
    { id: 'auto', name: 'Auto Loan', icon: Car, rate: 9.2, bg: 'bg-orange-500/10', color: 'text-orange-500' },
    { id: 'education', name: 'Education Loan', icon: GraduationCap, rate: 7.8, bg: 'bg-purple-500/10', color: 'text-purple-500' },
];

const mockActiveLoans = [
    {
        id: 'L-1092837',
        type: 'home',
        status: 'active',
        disbursedAmount: 350000,
        outstandingPrincipal: 312500,
        interestRate: 8.5,
        tenureMonths: 240,
        monthsCompleted: 42,
        emi: 3037.38,
        nextDueDate: addMonths(new Date(), 1).toISOString(),
    },
    {
        id: 'L-8937122',
        type: 'auto',
        status: 'active',
        disbursedAmount: 45000,
        outstandingPrincipal: 15400,
        interestRate: 9.2,
        tenureMonths: 60,
        monthsCompleted: 45,
        emi: 938.83,
        nextDueDate: addMonths(new Date(), 1).toISOString(),
    }
];

export default function Loans() {
    const { user } = useAppSelector((s) => s.auth);
    const [loans, setLoans] = useState(mockActiveLoans);

    // --- Calculator State ---
    const [calcPrincipal, setCalcPrincipal] = useState(50000);
    const [calcTenure, setCalcTenure] = useState(36);
    const [calcRate, setCalcRate] = useState(10.5);

    // --- Eligibility State ---
    const [income, setIncome] = useState('5000');
    const [existingEmi, setExistingEmi] = useState('500');

    // --- Prepayment State ---
    const [selectedLoanForPrepay, setSelectedLoanForPrepay] = useState<string | null>(null);
    const [prepayAmount, setPrepayAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Application State ---
    const [appStep, setAppStep] = useState(1);
    const [appType, setAppType] = useState('personal');

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // EMI Math Logic
    const emiResults = useMemo(() => {
        const p = calcPrincipal;
        const r = calcRate / (12 * 100);
        const n = calcTenure;
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const totalInterest = totalAmount - p;
        return {
            emi: isNaN(emi) || !isFinite(emi) ? 0 : emi,
            totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
            totalAmount: isNaN(totalAmount) ? 0 : totalAmount
        };
    }, [calcPrincipal, calcTenure, calcRate]);

    const eligibilityResult = useMemo(() => {
        const netIncome = Number(income) - Number(existingEmi);
        const maxEmi = netIncome * 0.45; // Bank allows max 45% of net income for new EMI
        // Assuming average 10% rate for 60 months
        const r = 10 / (12 * 100);
        const maxLoan = maxEmi > 0 ? (maxEmi * (Math.pow(1 + r, 60) - 1)) / (r * Math.pow(1 + r, 60)) : 0;
        return { maxEmi, maxLoan };
    }, [income, existingEmi]);

    const handlePrepay = async () => {
        if (!prepayAmount || Number(prepayAmount) <= 0) return toast.error("Enter a valid amount");
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setLoans(prev => prev.map(l => l.id === selectedLoanForPrepay ? {
                ...l,
                outstandingPrincipal: Math.max(0, l.outstandingPrincipal - Number(prepayAmount))
            } : l));
            toast.success(`Successfully prepaid ${formatCurrency(Number(prepayAmount))}`);
            setSelectedLoanForPrepay(null);
            setPrepayAmount('');
        }, 1500);
    };

    const handleDownloadStatement = (loanId: string) => {
        toast.info("Generating Statement...");
        setTimeout(() => {
            toast.success(`Statement for ${loanId} downloaded.`);
        }, 1000);
    };

    const handleApplyNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (appStep < 3) setAppStep(prev => prev + 1);
        else {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                toast.success("Application submitted successfully! Our team will contact you.");
                setAppStep(1);
            }, 2000);
        }
    };

    const getLoanTypeDetails = (id: string) => loanTypes.find(l => l.id === id) || loanTypes[0];

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Loans Center</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage active loans, check eligibility, and apply for new loans</p>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-secondary/40 p-1">
                        <TabsTrigger value="overview">My Active Loans</TabsTrigger>
                        <TabsTrigger value="apply">Apply New Loan</TabsTrigger>
                        <TabsTrigger value="calculators">Calculators</TabsTrigger>
                    </TabsList>

                    {/* TAB: ACTIVE LOANS */}
                    <TabsContent value="overview" className="space-y-6 focus:outline-none focus:ring-0">
                        {loans.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {loans.map(loan => {
                                    const details = getLoanTypeDetails(loan.type);
                                    const progress = (loan.monthsCompleted / loan.tenureMonths) * 100;

                                    return (
                                        <GlassCard key={loan.id} className="p-6 border-border/50 relative overflow-hidden group">
                                            {/* decorative background blur */}
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${details.bg}`}>
                                                        <details.icon className={`w-6 h-6 ${details.color}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{details.name}</h3>
                                                        <p className="text-xs text-muted-foreground font-mono">{loan.id}</p>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success font-medium border border-success/20 shadow-sm flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Active
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Outstanding Principal</p>
                                                    <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(loan.outstandingPrincipal)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Monthly EMI</p>
                                                    <p className="text-xl font-bold tracking-tight text-foreground/90">{formatCurrency(loan.emi)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                                                    <p className="text-lg font-medium text-foreground/80 flex items-center gap-1"><Percent className="w-4 h-4 text-primary" /> {loan.interestRate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Next Due Date</p>
                                                    <p className="text-lg font-medium text-foreground/80 flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> {format(new Date(loan.nextDueDate), 'd MMM yyyy')}</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                                    <span>Tenure Progress</span>
                                                    <span>{loan.monthsCompleted} / {loan.tenureMonths} Months</span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-border/50">
                                                <Button
                                                    onClick={() => setSelectedLoanForPrepay(loan.id)}
                                                    className="flex-1 shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                                                >
                                                    <DollarSign className="w-4 h-4 mr-1.5" /> Prepay
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleDownloadStatement(loan.id)}
                                                    className="flex-1 bg-secondary/50 hover:bg-secondary"
                                                >
                                                    <Download className="w-4 h-4 mr-1.5" /> Statement
                                                </Button>
                                            </div>

                                            {/* Prepayment Modal overlay inside card */}
                                            <AnimatePresence>
                                                {selectedLoanForPrepay === loan.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col justify-center p-6 border border-primary/20 rounded-2xl"
                                                    >
                                                        <h4 className="font-semibold text-lg mb-4">Make a Prepayment</h4>
                                                        <p className="text-sm text-muted-foreground mb-4">Prepaying principal directly reduces your total interest burden and remaining tenure.</p>

                                                        <div className="space-y-4 mb-6">
                                                            <div className="space-y-2">
                                                                <Label>Prepayment Amount ($)</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g. 5000"
                                                                    value={prepayAmount}
                                                                    onChange={e => setPrepayAmount(e.target.value)}
                                                                    max={loan.outstandingPrincipal}
                                                                    className="h-12 bg-secondary/30 text-lg font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <Button onClick={handlePrepay} disabled={isProcessing} className="flex-1 bg-primary text-primary-foreground">
                                                                {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Payment'}
                                                            </Button>
                                                            <Button variant="ghost" onClick={() => setSelectedLoanForPrepay(null)}>Cancel</Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                                <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold mb-2">No Active Loans</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">You currently don't have any active loans with PrimeBank. Explore our loan options in the Apply tab!</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB: APPLY NEW */}
                    <TabsContent value="apply" className="focus:outline-none focus:ring-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Application Flow */}
                            <div className="lg:col-span-7">
                                <GlassCard className="p-8 border-border/50">
                                    <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
                                        <Landmark className="w-5 h-5 text-primary" /> New Loan Application
                                    </h2>

                                    {/* Steps Indicator */}
                                    <div className="flex items-center justify-between mb-8 relative">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary/50 -z-10 -translate-y-1/2" />
                                        {[1, 2, 3].map(step => (
                                            <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${appStep >= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                {step}
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleApplyNext}>
                                        <AnimatePresence mode="wait">
                                            {appStep === 1 && (
                                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                                    <h3 className="font-medium text-lg">1. Choose Loan Type</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {loanTypes.map(lt => (
                                                            <div
                                                                key={lt.id}
                                                                onClick={() => setAppType(lt.id)}
                                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all group ${appType === lt.id ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'}`}
                                                            >
                                                                <lt.icon className={`w-8 h-8 mb-3 ${appType === lt.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                                                <h4 className="font-medium">{lt.name}</h4>
                                                                <p className="text-xs text-muted-foreground mt-1">Starting from {lt.rate}% p.a.</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button type="submit" className="w-full h-12">Continue</Button>
                                                </motion.div>
                                            )}

                                            {appStep === 2 && (
                                                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <Button variant="ghost" size="icon" onClick={() => setAppStep(1)} className="rounded-full bg-secondary/30"><CheckCircle2 className="w-5 h-5" /></Button>
                                                        <h3 className="font-medium text-lg">2. Financial Details</h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>Requested Amount ($)</Label>
                                                            <Input type="number" required placeholder="10000" className="h-12 text-lg font-mono bg-background/50" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Preferred Tenure (Months)</Label>
                                                                <Select defaultValue="36">
                                                                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="12">12 Months</SelectItem>
                                                                        <SelectItem value="24">24 Months</SelectItem>
                                                                        <SelectItem value="36">36 Months</SelectItem>
                                                                        <SelectItem value="60">60 Months</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Employment Status</Label>
                                                                <Select defaultValue="salaried">
                                                                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="salaried">Salaried</SelectItem>
                                                                        <SelectItem value="business">Self-Employed / Business</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Purpose of Loan</Label>
                                                            <Input required placeholder="Brief description" className="h-12 bg-background/50" />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full h-12">Review Application</Button>
                                                </motion.div>
                                            )}

                                            {appStep === 3 && (
                                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 text-center">
                                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mt-4 mb-6 relative">
                                                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                                        <FileText className="w-10 h-10 text-primary relative z-10" />
                                                    </div>
                                                    <h3 className="font-semibold text-2xl">Ready to Submit</h3>
                                                    <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
                                                        By submitting this application, you authorize PrimeBank to conduct a soft credit pull to determine final eligibility and rates.
                                                    </p>

                                                    <div className="flex gap-4">
                                                        <Button variant="outline" onClick={() => setAppStep(2)} className="flex-1 h-12" disabled={isProcessing}>Back To Edit</Button>
                                                        <Button type="submit" className="flex-[2] h-12 shadow-[0_0_15px_rgba(0,255,255,0.1)]" disabled={isProcessing}>
                                                            {isProcessing ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : null}
                                                            {isProcessing ? 'Processing...' : 'Submit Final Application'}
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </GlassCard>
                            </div>

                            {/* Eligibility Checker */}
                            <div className="lg:col-span-5">
                                <GlassCard className="p-6 border-border/50 sticky top-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
                                        <Wallet className="w-5 h-5 text-primary" /> Instant Eligibility Check
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <Label>Monthly Net Income</Label>
                                                <span className="font-mono text-sm">${income}</span>
                                            </div>
                                            <Slider
                                                value={[Number(income)]}
                                                min={1000} max={25000} step={500}
                                                onValueChange={(val) => setIncome(val[0].toString())}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <Label>Current Total EMIs</Label>
                                                <span className="font-mono text-sm">${existingEmi}</span>
                                            </div>
                                            <Slider
                                                value={[Number(existingEmi)]}
                                                min={0} max={10000} step={100}
                                                onValueChange={(val) => setExistingEmi(val[0].toString())}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl mt-8">
                                            <h4 className="text-sm font-medium text-foreground/80 mb-4">You are eligible for approximately:</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Max Loan Amount</span>
                                                    <span className="text-3xl font-bold tracking-tight text-primary glow-text-subtle">{formatCurrency(eligibilityResult.maxLoan)}</span>
                                                </div>
                                                <div className="h-px bg-border/50" />
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Max New EMI capacity</span>
                                                    <span className="text-lg font-semibold text-foreground/90">{formatCurrency(eligibilityResult.maxEmi)}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                                                <p>This is an estimate based on 45% Debt-to-Income ratio and average rates. Actual eligibility depends on Full Credit Assessment.</p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: CALCULATORS */}
                    <TabsContent value="calculators" className="focus:outline-none focus:ring-0">
                        <GlassCard className="p-8 border-border/50 max-w-4xl mx-auto">
                            <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" /> Advanced EMI Calculator
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
                                            <Label className="pl-2">Principal Amount</Label>
                                            <Input type="number" value={calcPrincipal} onChange={e => setCalcPrincipal(Number(e.target.value))} className="w-32 h-8 text-right font-mono" />
                                        </div>
                                        <Slider value={[calcPrincipal]} min={5000} max={1000000} step={1000} onValueChange={(val) => setCalcPrincipal(val[0])} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
                                            <Label className="pl-2">Interest Rate (% p.a.)</Label>
                                            <Input type="number" value={calcRate} step={0.1} onChange={e => setCalcRate(Number(e.target.value))} className="w-24 h-8 text-right font-mono" />
                                        </div>
                                        <Slider value={[calcRate]} min={1} max={25} step={0.1} onValueChange={(val) => setCalcRate(val[0])} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg">
                                            <Label className="pl-2">Tenure (Months)</Label>
                                            <Input type="number" value={calcTenure} onChange={e => setCalcTenure(Number(e.target.value))} className="w-24 h-8 text-right font-mono" />
                                        </div>
                                        <Slider value={[calcTenure]} min={6} max={360} step={1} onValueChange={(val) => setCalcTenure(val[0])} />
                                    </div>
                                </div>

                                {/* Results Visualizer */}
                                <div className="bg-gradient-to-br from-secondary/50 to-background border border-border/50 rounded-2xl p-6 flex flex-col justify-center">
                                    <div className="text-center mb-8 pb-8 border-b border-border/50">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Monthly EMI</p>
                                        <p className="text-5xl font-bold tracking-tight text-primary glow-text-subtle">{formatCurrency(emiResults.emi)}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-foreground" /><span className="text-sm">Principal Amount</span></div>
                                            <span className="font-semibold">{formatCurrency(calcPrincipal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-sm">Total Interest</span></div>
                                            <span className="font-semibold">{formatCurrency(emiResults.totalInterest)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-border/30 flex justify-between items-center">
                                            <span className="text-sm font-medium">Total Payment</span>
                                            <span className="font-bold text-lg">{formatCurrency(emiResults.totalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Visual Bar */}
                                    <div className="mt-8 h-4 w-full bg-primary rounded-full overflow-hidden flex shadow-inner">
                                        <div className="h-full bg-foreground transition-all duration-300" style={{ width: `${(calcPrincipal / emiResults.totalAmount) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </TabsContent>
                </Tabs>

            </div>
        </DashboardLayout>
    );
}

// Fallback Icon component if needed inside form
const FileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);
