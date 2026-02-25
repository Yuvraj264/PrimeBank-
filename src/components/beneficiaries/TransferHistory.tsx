import { useState, useMemo } from 'react';
import { Transaction, Beneficiary } from '@/types';
import { ArrowUpRight, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
    beneficiary: Beneficiary;
    transactions: Transaction[];
}

export default function TransferHistory({ beneficiary, transactions }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter transactions specifically sent to this beneficiary's account
    const history = useMemo(() => {
        return transactions.filter(t =>
            t.type === 'transfer' && t.toAccountId === beneficiary.accountNumber
        ).sort((a, b) => new Date(b.date || b.createdAt || '').getTime() - new Date(a.date || a.createdAt || '').getTime());
    }, [transactions, beneficiary.accountNumber]);

    const filteredHistory = history.filter(t =>
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.amount.toString().includes(searchTerm)
    );

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 rounded-xl border border-dashed border-border/50">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <h4 className="font-semibold">No Transfer History</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                    You haven't made any transfers to {beneficiary.name} yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search past transfers..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredHistory.map((txn, i) => (
                    <div key={txn.id + i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm capitalize">{txn.description || 'Fund Transfer'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(txn.date || txn.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold tabular-nums">-${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] text-success font-medium uppercase tracking-wider">{txn.status}</p>
                        </div>
                    </div>
                ))}

                {filteredHistory.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No matches found for "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
