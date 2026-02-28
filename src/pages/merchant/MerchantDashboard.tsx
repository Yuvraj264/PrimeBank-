import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt, Wallet, AlertCircle, RefreshCcw, Building } from 'lucide-react';
import { merchantService } from '@/services/merchantService';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/store';
import { Link } from 'react-router-dom';

const MerchantDashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAppSelector(s => s.auth);
    const { toast } = useToast();

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await merchantService.getGSTSummary();
            setSummary(res.data.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                // Business Profile doesn't exist yet, this is expected on first load until they generate an API key or get onboarded
            } else {
                toast({ title: 'Error fetching GST Summary', variant: 'destructive' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Pre-onboarding state
    if (!summary) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 glow-primary">
                        <Building className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Welcome to PrimeBank Business</h2>
                    <p className="text-muted-foreground mb-8">
                        Your merchant profile has not been initialized yet. To begin using the Business Hub, please activate your profile by generating your first API Key.
                    </p>
                    <Link to="/merchant/api" className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                        Activate Business Profile
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const { summary: stats, businessName, gstNumber, pan } = summary;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Business Hub Overview</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Real-time aggregation of your enterprise transaction flows and Tax Liability.
                        </p>
                    </div>
                    <button
                        onClick={fetchSummary}
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" /> Refresh Data
                    </button>
                </div>

                {/* Business Profile Ribbon */}
                <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-center gap-6 border-l-4 border-l-primary">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{businessName}</h2>
                            <p className="text-sm text-muted-foreground font-mono mt-0.5">PAN: {pan}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">GSTIN Registry</p>
                            <p className="font-mono font-medium bg-accent/50 px-3 py-1 rounded border border-border/50">{gstNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Applicable Tax Rate</p>
                            <p className="font-bold text-lg text-primary">{stats.gstRateApplied}</p>
                        </div>
                    </div>
                </div>

                {/* Volume Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-muted-foreground">Volume In (Sales)</h3>
                        </div>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(stats.grossIncoming)}</p>
                        <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                            <span>+ GST Collected: {formatCurrency(stats.gstCollected)}</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-muted-foreground">Volume Out (Expenses)</h3>
                        </div>
                        <p className="text-3xl font-bold mb-2">{formatCurrency(stats.grossOutgoing)}</p>
                        <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                            <span>- GST Paid: {formatCurrency(stats.gstPaid)}</span>
                        </div>
                    </motion.div>
                </div>

                {/* GST Liability Main Hero */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border text-sm font-medium mb-6 relative z-10">
                        <Receipt className="w-4 h-4 text-primary" />
                        Net GST Liability
                    </div>

                    <div className="relative z-10">
                        <h2 className={`text-5xl md:text-7xl font-black tracking-tight mb-6 ${stats.netGstLiability > 0 ? 'text-destructive' : 'text-green-500'}`}>
                            {formatCurrency(Math.abs(stats.netGstLiability))}
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {stats.netGstLiability > 0
                                ? "You have collected more GST than you have paid out. This remaining balance constitutes your tax liability to the regulatory authorities."
                                : stats.netGstLiability < 0
                                    ? "You have paid out more GST via expenses than you collected. You are eligible to claim Input Tax Credit (ITC) for this surplus."
                                    : "Your Incoming GST perfectly balances your Outgoing GST. You currently have zero net liability."}
                        </p>

                        <div className="mt-10 flex justify-center gap-4">
                            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                                Generate Full Report
                            </button>
                            <button className="px-6 py-3 border border-border text-foreground hover:bg-accent rounded-lg font-medium transition-all">
                                Pay Liability Offline
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default MerchantDashboard;
