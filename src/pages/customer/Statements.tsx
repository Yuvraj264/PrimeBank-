import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Download, FileText, Calendar, Mail, FileSpreadsheet,
    Calculator, Receipt, Loader2, Filter, FileCheck2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { accountService } from '@/services/accountService';
import { toast } from 'sonner';

export default function Statements() {
    // Data State
    const [accounts, setAccounts] = useState<any[]>([]);
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedAccount, setSelectedAccount] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [yearFilter, setYearFilter] = useState('2024');

    // Async simulated states
    const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | 'email' | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [accData, stmtData] = await Promise.all([
                    accountService.getMyAccounts(),
                    accountService.getStatements()
                ]);
                setAccounts(accData);
                setStatements(stmtData);
                if (accData.length > 0) setSelectedAccount(accData[0].id);
            } catch (error) {
                toast.error('Failed to load accounts and statements');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Simulated Export Actions
    const handleSimulatedExport = async (type: 'pdf' | 'excel' | 'email') => {
        if (!selectedAccount) return toast.error("Please select an account first");
        if (type !== 'email' && (!fromDate || !toDate)) return toast.error("Please select a date range");

        setIsGenerating(type);

        try {
            // Simulate network/generation processing time
            await new Promise(res => setTimeout(res, 2000));

            if (type === 'email') {
                toast.success('Statement successfully sent to your registered email address.');
            } else {
                // Generate a dummy file object to trigger browser download
                const dummyContent = `Mock Statement Data for ${selectedAccount}\nFrom: ${fromDate}\nTo: ${toDate}`;
                const blob = new Blob([dummyContent], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `PrimeBank_Statement_${Date.now()}.${type === 'pdf' ? 'pdf' : 'csv'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success(`${type.toUpperCase()} Statement downloaded successfully`);
            }
        } catch (e) {
            toast.error(`Failed to process ${type} request`);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleQuickDownload = async (month: string, year: number, type: 'pdf' | 'excel' = 'pdf') => {
        toast.info(`Generating ${month} ${year} ${type.toUpperCase()}...`);
        // Simulate quick download
        setTimeout(() => {
            toast.success(`${month} ${year} Statement downloaded`);
        }, 1500);
    };

    // Derived Mock Summaries based on selected account
    const activeAccount = accounts.find(a => a.id === selectedAccount);
    const mockCredits = activeAccount ? Math.max(0, activeAccount.balance * 1.4) : 0;
    const mockDebits = activeAccount ? Math.max(0, activeAccount.balance * 0.4) : 0;
    const mockGst = activeAccount ? Math.max(0, (mockCredits * 0.01)) : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Account Statements</h1>
                        <p className="text-muted-foreground text-sm mt-1">Generate custom date range reports or download monthly statements</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column - Custom Generation & Monthly */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Custom Generation Widget */}
                        <GlassCard className="p-6 border-border/50">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary" /> Generate Custom Statement
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Select Account</Label>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                        <SelectTrigger className="h-12 bg-background/50">
                                            <SelectValue placeholder="Choose an account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loading ? (
                                                <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                                            ) : (
                                                accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.type.replace('_', ' ')} Account (...{acc.accountNumber.slice(-4)}) - ${acc.balance.toLocaleString()}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>From Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={fromDate}
                                            onChange={e => setFromDate(e.target.value)}
                                            className="pl-9 h-11 bg-background/50 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>To Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={toDate}
                                            onChange={e => setToDate(e.target.value)}
                                            min={fromDate}
                                            className="pl-9 h-11 bg-background/50 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
                                <Button
                                    className="flex-1 h-11 gap-2 shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]"
                                    onClick={() => handleSimulatedExport('pdf')}
                                    disabled={isGenerating !== null}
                                >
                                    {isGenerating === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 gap-2"
                                    onClick={() => handleSimulatedExport('excel')}
                                    disabled={isGenerating !== null}
                                >
                                    {isGenerating === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                                    Export Excel
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="flex-1 h-11 gap-2 bg-secondary/50 hover:bg-secondary border-transparent"
                                    onClick={() => handleSimulatedExport('email')}
                                    disabled={isGenerating !== null || !selectedAccount}
                                >
                                    {isGenerating === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    Email to Me
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Monthly Statements History */}
                        <GlassCard className="border-border/50">
                            <div className="flex justify-between items-center p-6 border-b border-border/50">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <FileCheck2 className="w-5 h-5 text-primary" /> Monthly Statements
                                </h3>
                                <div className="w-[120px]">
                                    <Select value={yearFilter} onValueChange={setYearFilter}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2024">2024</SelectItem>
                                            <SelectItem value="2023">2023</SelectItem>
                                            <SelectItem value="2022">2022</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-4 space-y-2">
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                ) : statements.filter(s => s.year.toString() === yearFilter).length > 0 ? (
                                    statements
                                        .filter(s => s.year.toString() === yearFilter)
                                        .map((stmt) => (
                                            <div key={stmt.id} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-background/40 hover:bg-secondary/20 hover:border-border/60 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{stmt.month} {stmt.year}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>1st - 30th {stmt.month.substring(0, 3)}</span>
                                                            <span>•</span>
                                                            <span className="font-mono">{stmt.size}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary hover:bg-primary/10 text-muted-foreground" onClick={() => handleQuickDownload(stmt.month, stmt.year, 'excel')} title="Download Excel">
                                                        <FileSpreadsheet className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5" onClick={() => handleQuickDownload(stmt.month, stmt.year, 'pdf')}>
                                                        <Download className="w-3.5 h-3.5" /> PDF
                                                    </Button>
                                                </div>
                                                {/* Mobile fallback button */}
                                                <Button size="icon" variant="ghost" className="h-8 w-8 md:hidden text-primary" onClick={() => handleQuickDownload(stmt.month, stmt.year, 'pdf')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-10 bg-secondary/10 rounded-xl border border-dashed border-border/50">
                                        No statements generated for {yearFilter}.
                                    </p>
                                )}
                            </div>
                        </GlassCard>

                    </div>


                    {/* Right Column - Summaries */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Financial Year Summary */}
                        <GlassCard className="p-0 border-border/50 overflow-hidden relative">
                            {/* Decorative background pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                            <div className="p-6">
                                <h3 className="font-semibold flex items-center gap-2 mb-6">
                                    <Calculator className="w-4 h-4 text-primary" /> Tax Year Summary {yearFilter}
                                </h3>

                                {activeAccount ? (
                                    <div className="space-y-5">
                                        <div className="bg-background/50 border border-border/50 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 text-success" /> Total Credits</span>
                                            </div>
                                            <span className="text-xl font-bold tracking-tight text-foreground/90">${mockCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        <div className="bg-background/50 border border-border/50 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-muted-foreground flex items-center gap-1.5"><ArrowDownRight className="w-3 h-3 text-destructive" /> Total Debits</span>
                                            </div>
                                            <span className="text-xl font-bold tracking-tight text-foreground/90">${mockDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground text-sm">Select an account to view summary</div>
                                )}
                            </div>

                            <div className="bg-secondary/30 p-4 border-t border-border/50 mt-2">
                                <Button variant="ghost" className="w-full text-xs h-8 gap-2 hover:bg-background/50" disabled={!activeAccount} onClick={() => handleQuickDownload('Fiscal', parseInt(yearFilter), 'pdf')}>
                                    <Download className="w-3.5 h-3.5" /> Download Tax Report
                                </Button>
                            </div>
                        </GlassCard>

                        {/* GST Summary */}
                        <GlassCard className="p-0 border-border/50 overflow-hidden">
                            <div className="p-6">
                                <h3 className="font-semibold flex items-center gap-2 mb-6">
                                    <Receipt className="w-4 h-4 text-primary" /> GST Summary {yearFilter}
                                </h3>

                                {activeAccount ? (
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Total GST Paid</p>
                                            <p className="text-3xl font-bold font-mono tracking-tight glow-text-subtle">${mockGst.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                            <Receipt className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-muted-foreground text-sm">Select an account</div>
                                )}
                            </div>

                            <div className="bg-secondary/30 p-4 border-t border-border/50 mt-2">
                                <Button variant="ghost" className="w-full text-xs h-8 gap-2 hover:bg-background/50" disabled={!activeAccount} onClick={() => handleQuickDownload('GST', parseInt(yearFilter), 'excel')}>
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export GST Breakdown
                                </Button>
                            </div>
                        </GlassCard>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
