import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { adminService } from '@/services/adminService';
import { FileText, Download, Activity, AlertOctagon, Users, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegulatoryReports() {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (type: string, title: string) => {
        setDownloading(type);
        try {
            const blob = await adminService.downloadReport(type);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success(`${title} downloaded successfully.`);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error(`Failed to download ${title}.`);
        } finally {
            setDownloading(null);
        }
    };

    const reports = [
        {
            id: 'monthly-transactions',
            title: 'Monthly Transaction Summary',
            description: 'Extracts all system-wide deposits, withdrawals, and transfers for the current month. Essential for RBI volume tracking.',
            icon: Activity,
            color: 'text-blue-500'
        },
        {
            id: 'suspicious-activity',
            title: 'Suspicious Activity Report (SAR)',
            description: 'Aggregates all flagged transactions from the AML Compliance engine, including risk scores and admin remarks.',
            icon: ShieldAlert,
            color: 'text-warning'
        },
        {
            id: 'high-value-transactions',
            title: 'High-Value Transactions',
            description: 'Filters all ledger movements exceeding the regulatory threshold of $10,000 for mandatory government reporting.',
            icon: AlertOctagon,
            color: 'text-destructive'
        },
        {
            id: 'kyc-pending',
            title: 'KYC Pending Accounts',
            description: 'Lists all partially onboarded users pending Identity Verification. Required for AML timeline audits.',
            icon: Users,
            color: 'text-purple-500'
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Regulatory <span className="gradient-text">Reports</span></h1>
                    <p className="text-muted-foreground text-sm mt-1">Export mandatory compliance and audit summaries in CSV format.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report, index) => {
                        const isDownloading = downloading === report.id;
                        return (
                            <GlassCard key={report.id} delay={index * 0.1} className="relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:bg-primary/10"></div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-secondary/50 flex flex-shrink-0 items-center justify-center ${report.color}`}>
                                            <report.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{report.title}</h3>
                                            <p className="text-sm text-foreground/70 mt-1 mb-4 leading-relaxed">{report.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex justify-end">
                                        <button
                                            onClick={() => handleDownload(report.id, report.title)}
                                            disabled={isDownloading}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            {isDownloading ? 'Generating...' : 'Download CSV'}
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
