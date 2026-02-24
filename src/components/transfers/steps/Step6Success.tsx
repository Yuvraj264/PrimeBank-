import { TransferState } from '../types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Share2, Copy, ArrowRight, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Props {
    data: TransferState;
    onReset: () => void;
}

export default function Step6Success({ data, onReset }: Props) {
    const navigate = useNavigate();
    const txId = `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const date = new Date().toLocaleString();

    const handleCopy = () => {
        navigator.clipboard.writeText(txId);
        toast.success('Transaction ID copied to clipboard');
    };

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 pt-6">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Transfer Successful!</h2>
                <p className="text-muted-foreground">
                    Your transfer of <span className="font-semibold text-foreground">${Number(data.amount).toFixed(2)}</span> to <span className="font-semibold text-foreground">{data.beneficiary?.name}</span> has been processed.
                </p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 max-w-sm mx-auto space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-2 font-medium">
                        {txId}
                        <button onClick={handleCopy} className="text-primary hover:text-primary/80 transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium">{date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Completed
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button variant="outline" className="gap-2 text-muted-foreground">
                    <Download className="w-4 h-4" /> Receipt
                </Button>
                <Button variant="outline" className="gap-2 text-muted-foreground">
                    <Share2 className="w-4 h-4" /> Share
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-border mt-8">
                <Button variant="secondary" className="gap-2 w-full" onClick={onReset}>
                    Make Another Transfer <ArrowRight className="w-4 h-4" />
                </Button>
                <Button className="gap-2 w-full" onClick={() => navigate('/customer')}>
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Button>
            </div>
        </div>
    );
}
