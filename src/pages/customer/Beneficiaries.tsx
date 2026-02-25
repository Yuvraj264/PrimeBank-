import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Edit2, Search, Star, Send, ShieldCheck, Banknote, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiaryService';
import { transactionService } from '@/services/transactionService';
import { useAppSelector } from '@/store';
import { Beneficiary, Transaction } from '@/types';
import BeneficiaryModal from '@/components/beneficiaries/BeneficiaryModal';
import TransferHistory from '@/components/beneficiaries/TransferHistory';

export default function Beneficiaries() {
    const navigate = useNavigate();
    const { user } = useAppSelector((s) => s.auth);

    // Data State
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<Beneficiary | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bens, txns] = await Promise.all([
                    beneficiaryService.getBeneficiaries(),
                    transactionService.getMyTransactions()
                ]);
                setBeneficiaries(bens);
                setTransactions(txns);
                if (bens.length > 0) setSelectedId(bens[0]._id);
            } catch (error) {
                toast.error('Failed to load beneficiary data');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const activeBeneficiary = useMemo(() =>
        beneficiaries.find(b => b._id === selectedId),
        [beneficiaries, selectedId]);

    const filteredBeneficiaries = useMemo(() => {
        return beneficiaries
            .filter(b =>
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.nickname && b.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                b.bankName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                // Favorites first, then alphabetical
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return a.name.localeCompare(b.name);
            });
    }, [beneficiaries, searchTerm]);

    const handleSuccess = (ben: Beneficiary, isEdit: boolean) => {
        if (isEdit) {
            setBeneficiaries(prev => prev.map(b => b._id === ben._id ? ben : b));
        } else {
            setBeneficiaries(prev => [ben, ...prev]);
        }
        setSelectedId(ben._id);
    };

    const handleDelete = async (id: string) => {
        try {
            await beneficiaryService.deleteBeneficiary(id);
            setBeneficiaries(prev => prev.filter(b => b._id !== id));
            if (selectedId === id) {
                const remaining = beneficiaries.filter(b => b._id !== id);
                setSelectedId(remaining.length > 0 ? remaining[0]._id : null);
            }
            toast.success('Beneficiary removed securely');
        } catch (error) {
            toast.error('Failed to remove beneficiary');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, ben: Beneficiary) => {
        e.stopPropagation();
        try {
            const updated = await beneficiaryService.updateBeneficiary(ben._id, { isFavorite: !ben.isFavorite });
            setBeneficiaries(prev => prev.map(b => b._id === ben._id ? updated : b));
            toast.success(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites');
        } catch (error) {
            toast.error('Failed to update favorite status');
        }
    };

    const handleQuickTransfer = () => {
        if (activeBeneficiary) {
            navigate(`/customer/transfers?beneficiary=${activeBeneficiary.accountNumber}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage saved contacts and transfer limits</p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => {
                            setBeneficiaryToEdit(undefined);
                            setIsModalOpen(true);
                        }}
                    >
                        <UserPlus className="w-4 h-4" /> Add Contact
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                    {/* Left Pane: Contacts List */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-h-0">
                        <GlassCard className="p-4 flex-1 flex flex-col min-h-0 border-border/50">
                            <div className="relative mb-4 shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search contacts..."
                                    className="pl-9 h-10 bg-background/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center text-muted-foreground py-8">Loading contacts...</div>
                                ) : filteredBeneficiaries.length > 0 ? (
                                    filteredBeneficiaries.map((ben) => (
                                        <div
                                            key={ben._id}
                                            onClick={() => setSelectedId(ben._id)}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative
                                                ${selectedId === ben._id
                                                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(0,255,255,0.05)]'
                                                    : 'border-border/50 bg-background/30 hover:bg-secondary/20'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {ben.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm truncate">{ben.nickname || ben.name}</h3>
                                                    {ben.nickname && <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-secondary/50 border border-border/50">{ben.name.split(' ')[0]}</span>}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{ben.accountNumber}</p>
                                            </div>
                                            <button
                                                onClick={(e) => handleToggleFavorite(e, ben)}
                                                className="absolute right-3 p-1 rounded hover:bg-background/50 transition-colors"
                                            >
                                                <Star className={`w-4 h-4 ${ben.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/50'}`} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground py-8 text-sm">
                                        No contacts found.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Pane: Selected Details */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
                        {activeBeneficiary ? (
                            <GlassCard className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto custom-scrollbar border-border/50">
                                {/* Header Details */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/50 pb-6 shrink-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-lg shadow-primary/5">
                                            {activeBeneficiary.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold tracking-tight">{activeBeneficiary.nickname || activeBeneficiary.name}</h2>
                                                {activeBeneficiary.isFavorite && <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />}
                                            </div>
                                            <p className="text-muted-foreground">{activeBeneficiary.nickname ? activeBeneficiary.name : 'Verified Recipient'}</p>

                                            <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                                                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md border border-border/30">
                                                    <Building2 className="w-3.5 h-3.5 text-primary" /> {activeBeneficiary.bankName}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md border border-border/30">
                                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {activeBeneficiary.ifscCode}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 hover:bg-secondary/40"
                                            onClick={() => {
                                                setBeneficiaryToEdit(activeBeneficiary);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                            onClick={() => handleDelete(activeBeneficiary._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    {/* Info & Limits */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                                <ShieldCheck className="w-4 h-4 text-primary" /> Configuration
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Account Number</p>
                                                        <p className="font-mono text-sm mt-0.5">{activeBeneficiary.accountNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Daily Transfer Limit</p>
                                                        <p className="font-semibold text-sm mt-0.5">${(activeBeneficiary.dailyLimit || 50000).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-12 text-md shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-shadow"
                                            onClick={handleQuickTransfer}
                                        >
                                            <Send className="w-5 h-5 mr-2 -ml-1" /> Quick Transfer
                                        </Button>
                                    </div>

                                    {/* History */}
                                    <div>
                                        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                            <Banknote className="w-4 h-4 text-primary" /> Transfer History
                                        </h3>
                                        <TransferHistory beneficiary={activeBeneficiary} transactions={transactions} />
                                    </div>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard className="flex-1 flex items-center justify-center p-8 text-center border-dashed border-border/50">
                                <div>
                                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                                        <UserPlus className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-semibold opacity-80">No Contact Selected</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm">Select a beneficiary from the list to view their details, limits, and transfer history.</p>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </div>

            <BeneficiaryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                beneficiaryToEdit={beneficiaryToEdit}
                onSuccess={handleSuccess}
            />
        </DashboardLayout>
    );
}
