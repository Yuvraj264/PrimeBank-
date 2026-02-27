import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Play, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { merchantService } from '@/services/merchantService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';

const PayrollBulkFlow = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setResult(null); // Clear previous results
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv']
        },
        maxFiles: 1,
        multiple: false
    });

    const fetchHistory = async () => {
        try {
            const res = await merchantService.getProcessingJobs();
            setHistory(res.data.data.filter((j: any) => j.jobType === 'payroll'));
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleExecuteJob = async () => {
        if (!file) return;

        setProcessing(true);
        setResult(null);

        try {
            const response = await merchantService.uploadPayrollCSV(file);
            setResult(response.data.data);
            toast({
                title: 'Execution Complete',
                description: `Processed ${response.data.data.successfulRecords} records successfully.`,
            });
            fetchHistory(); // Refresh table
        } catch (err: any) {
            toast({
                title: 'Execution Failed',
                description: err.response?.data?.message || 'Failed to process bulk upload.',
                variant: 'destructive'
            });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10';
            case 'failed': return 'text-red-500 bg-red-500/10';
            case 'processing': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bulk Payroll Execution</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Upload CSV payloads to automate employee or vendor disbursements concurrently.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Uploader Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'} transition-colors`}>
                                    <UploadCloud className="w-8 h-8" />
                                </div>

                                {file ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-medium text-foreground flex items-center gap-2 justify-center">
                                            <FileSpreadsheet className="w-5 h-5 text-green-500" />
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">
                                            {isDragActive ? "Drop the CSV here..." : "Drag & drop your CSV file"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            or click to browse from your computer (Max 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Execution Controls */}
                        {file && !result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 glass-card rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-medium">Ready for execution</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExecuteJob}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {processing ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                        {processing ? 'Processing Rows...' : 'Execute Payroll'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Live Results Panel */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card rounded-xl p-6 border-l-4 border-l-primary"
                            >
                                <h3 className="text-lg font-semibold mb-4">Execution Report</h3>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="p-4 bg-accent/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Uploaded</p>
                                        <p className="text-2xl font-bold">{result.totalRecords}</p>
                                    </div>
                                    <div className="p-4 bg-green-500/10 rounded-lg">
                                        <p className="text-xs text-green-500 uppercase tracking-wider mb-1">Successful</p>
                                        <p className="text-2xl font-bold text-green-500">{result.successfulRecords}</p>
                                    </div>
                                    <div className="p-4 bg-red-500/10 rounded-lg">
                                        <p className="text-xs text-red-500 uppercase tracking-wider mb-1">Failed</p>
                                        <p className="text-2xl font-bold text-red-500">{result.failedRecords}</p>
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-lg">
                                        <p className="text-xs text-primary uppercase tracking-wider mb-1">Tax Deducted (TDS)</p>
                                        <p className="text-xl font-bold text-primary">{formatCurrency(result.tdsDeducted)}</p>
                                    </div>
                                </div>

                                {result.failedRecords > 0 && result.reportUrl && (
                                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                                        <div className="flex items-center gap-2 mb-3 text-destructive font-medium">
                                            <AlertTriangle className="w-4 h-4" />
                                            <h4>Error Logs (First 10)</h4>
                                        </div>
                                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded overflow-x-auto">
                                            {result.reportUrl}
                                        </pre>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end flex-wrap gap-4">
                                    <button
                                        onClick={() => { setFile(null); setResult(null); }}
                                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                                    >
                                        <RefreshCcw className="w-4 h-4" /> Load New Batch
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Guidelines Sidebar */}
                    <div className="glass-card p-6 h-fit">
                        <h3 className="text-base font-semibold mb-4">CSV Formatting Rules</h3>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>To ensure successful execution, your CSV headers must strictly match the following mapping:</p>

                            <ul className="list-disc pl-4 space-y-2">
                                <li><code className="bg-accent/50 px-1 py-0.5 rounded text-foreground">employeeId</code> - Unique identifier string.</li>
                                <li><code className="bg-accent/50 px-1 py-0.5 rounded text-foreground">accountId</code> - The internal PrimeBank Mongo ID of the target.</li>
                                <li><code className="bg-accent/50 px-1 py-0.5 rounded text-foreground">grossSalary</code> - Numeric value (e.g., 50000.00).</li>
                                <li><code className="bg-accent/50 px-1 py-0.5 rounded text-foreground">ifsc</code> - Standard Bank Code.</li>
                            </ul>

                            <div className="pt-4 border-t border-border">
                                <p className="text-xs flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>The system automatically simulates a 10% TDS deduction dynamically from the Gross parameter before transferring Net Pay.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit History Table */}
                <div className="glass-card p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-6">Historical Processing Jobs</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-accent/30 border-y border-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Job ID / File</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Records</th>
                                    <th className="px-4 py-3 font-medium text-right">TDS Simulated</th>
                                    <th className="px-4 py-3 font-medium text-right">Net Processed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {history.length > 0 ? (
                                    history.map((job) => (
                                        <tr key={job._id} className="hover:bg-accent/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{job.uploadFileName}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={job._id}>{job._id}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-green-500 font-medium">{job.successfulRecords}</span>
                                                {' / '}
                                                <span>{job.totalRecords}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-primary">
                                                {formatCurrency(job.tdsDeducted || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                {formatCurrency(job.totalAmount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            No bulk processing jobs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default PayrollBulkFlow;
