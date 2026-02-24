import { useState } from 'react';
import { Transaction } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/shared/StatusBadge';
import { Download, Printer, Tag, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTempMeta: (id: string, note: string, tags: string[]) => void;
}

export default function TransactionModal({ transaction, isOpen, onClose, onUpdateTempMeta }: Props) {
    const [note, setNote] = useState(transaction?.note || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(transaction?.tags || []);

    if (!transaction) return null;

    const isIncoming = transaction.category === 'income' || transaction.type === 'deposit';

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            if (!tags.includes(tagInput.trim())) {
                const newTags = [...tags, tagInput.trim()];
                setTags(newTags);
                onUpdateTempMeta(transaction.id, note, newTags);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter(t => t !== tagToRemove);
        setTags(newTags);
        onUpdateTempMeta(transaction.id, note, newTags);
    };

    const handleNoteSave = () => {
        onUpdateTempMeta(transaction.id, note, tags);
        toast.success('Note saved successfully');
    };

    const handleDownloadPDF = () => {
        // In a real app, logic to generate PDF jsPDF. For now, trigger standard browser print
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4 print:pt-0">
                    <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-xl border border-border">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isIncoming ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {isIncoming ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight mb-2">
                            {isIncoming ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h3>
                        <StatusBadge status={transaction.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Date & Time</p>
                            <p className="font-medium">{new Date(transaction.date || transaction.createdAt || '').toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Reference Number</p>
                            <p className="font-medium">{transaction.reference || transaction.id.slice(0, 10).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Transaction Type</p>
                            <p className="font-medium capitalize">{transaction.type?.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Description</p>
                            <p className="font-medium">{transaction.description}</p>
                        </div>
                        {(transaction.senderName || transaction.receiverName) && (
                            <div className="col-span-2 pt-2 border-t border-border mt-2">
                                <p className="text-muted-foreground mb-1 text-xs">{isIncoming ? 'From Sender' : 'To Beneficiary'}</p>
                                <p className="font-medium">{isIncoming ? transaction.senderName : transaction.receiverName}</p>
                            </div>
                        )}
                    </div>

                    {/* User Metadata Section - Hidden when printing */}
                    <div className="space-y-4 pt-4 border-t border-border print:hidden">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                <Tag className="w-3.5 h-3.5" /> Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                                        {tag} <span className="opacity-50 hover:opacity-100">×</span>
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                placeholder="Type tag and press Enter..."
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
                                <FileText className="w-3.5 h-3.5" /> Personal Note
                            </label>
                            <Textarea
                                placeholder="Add a private note to this transaction..."
                                className="min-h-[80px] text-sm resize-none"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                onBlur={handleNoteSave}
                            />
                        </div>
                    </div>

                    {/* Action Buttons - Hidden when printing */}
                    <div className="flex justify-between items-center pt-2 print:hidden">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="gap-2" onClick={handleDownloadPDF}>
                                <Printer className="w-4 h-4" /> Print PDF
                            </Button>
                            <Button className="gap-2" onClick={() => toast.success('Receipt download started')}>
                                <Download className="w-4 h-4" /> Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
