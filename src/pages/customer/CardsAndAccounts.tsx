import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { accountService } from '@/services/accountService';
import { cardService, Card as CardType } from '@/services/cardService';
import { Account, Transaction } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, Flame, CirclePlus } from 'lucide-react';
import { toast } from 'sonner';

import CardCarousel from '@/components/cards/CardCarousel';
import CardControls from '@/components/cards/CardControls';
import { transactionService } from '@/services/transactionService';

export default function CardsAndAccounts() {
    const navigate = useNavigate();
    const { user } = useAppSelector((s) => s.auth);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeCardId, setActiveCardId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accData, cardData, txnData] = await Promise.all([
                    accountService.getMyAccounts(),
                    cardService.getMyCards(),
                    transactionService.getMyTransactions()
                ]);
                setAccounts(accData);
                setCards(cardData);
                setTransactions(txnData);
                if (cardData.length > 0) setActiveCardId(cardData[0].id);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load cards and accounts");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleCreateCard = async () => {
        try {
            setLoading(true);
            const newCard = await cardService.createCard();
            const updatedCards = [...cards, newCard];
            setCards(updatedCards);
            setActiveCardId(newCard.id);
            toast.success("Virtual card created successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create card");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCard = (updatedCard: CardType) => {
        setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
    };

    const activeCardData = useMemo(() => cards.find(c => c.id === activeCardId), [cards, activeCardId]);

    // Derived mock stats
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const upcomingBill = 450.00; // Mock derived value for UI

    const recentCardTxns = useMemo(() => {
        return transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal' || t.category === 'shopping').slice(0, 3);
    }, [transactions]);

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Interactive Cards</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage physical and virtual cards securely</p>
                    </div>
                    <Button className="gap-2" onClick={handleCreateCard} disabled={loading}>
                        <CirclePlus className="w-4 h-4" /> Create Virtual Card
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
                    {/* Left Column: Interactive Cards & Bills */}
                    <div className="xl:col-span-5 space-y-6">

                        <div className="bg-card/40 border border-border/50 rounded-3xl p-4 overflow-hidden shadow-2xl relative">
                            {/* Ambient reflection */}
                            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-primary/20 blur-[100px] pointer-events-none rounded-full mix-blend-screen" />

                            <CardCarousel
                                cards={cards}
                                activeCardId={activeCardId}
                                onActiveCardChange={setActiveCardId}
                                onCreateCard={handleCreateCard}
                            />
                        </div>

                        {/* Quick Upcoming Bill Widget */}
                        {activeCardData && (
                            <GlassCard className="p-5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-orange-500/80 font-medium">Upcoming Bill</p>
                                        <p className="font-bold text-lg">${upcomingBill.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">Due in 5 Days</p>
                                    <Button variant="link" className="p-0 h-auto text-orange-500" onClick={() => navigate('/customer/bills')}>Pay Now <ArrowRight className="w-3 h-3 ml-1" /></Button>
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Middle & Right Column: Controls & History */}
                    <div className="xl:col-span-7 space-y-6">
                        {activeCardData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Configuration Panel */}
                                <div>
                                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                        <ShieldCheck className="w-5 h-5 text-primary" /> Card Controls
                                    </h2>
                                    <CardControls
                                        card={activeCardData}
                                        onUpdateCard={handleUpdateCard}
                                        onRequestReplacement={() => toast.success("Replacement request sent to processing")}
                                        onReportLost={() => {
                                            toast.error("Card marked as LOST. System frozen.");
                                            handleUpdateCard({ ...activeCardData, status: 'blocked' });
                                        }}
                                    />
                                </div>

                                {/* Transactions & Accounts side */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold">Recent Card Activity</h2>
                                            <Button variant="ghost" size="sm" onClick={() => navigate('/customer/transactions')}>View All</Button>
                                        </div>
                                        <GlassCard className="p-2 space-y-2">
                                            {recentCardTxns.length > 0 ? recentCardTxns.map((txn, i) => {
                                                const isIncoming = txn.category === 'income' || txn.type === 'deposit';
                                                return (
                                                    <div key={txn.id + i} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/20 transition-colors">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${isIncoming ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                                {isIncoming ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-sm truncate">{txn.description}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{new Date(txn.date || txn.createdAt || '').toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold tabular-nums text-sm shrink-0 text-right">
                                                            {isIncoming ? '+' : '-'}${Math.abs(txn.amount).toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">No recent activity detected on this card.</div>
                                            )}
                                        </GlassCard>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                            <Wallet className="w-5 h-5 text-primary" /> Connected Accounts
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {accounts.slice(0, 2).map((acc) => (
                                                <div key={acc.id} onClick={() => navigate(`/customer/transactions?accountId=${acc.id}`)} className="cursor-pointer group">
                                                    <GlassCard className="p-4 bg-primary/5 hover:bg-primary/10 transition-colors h-full">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                                <Wallet className="w-4 h-4" />
                                                            </div>
                                                            <h3 className="font-semibold text-sm capitalize">{acc.type.replace('_', ' ')}</h3>
                                                        </div>
                                                        <p className="font-mono text-xs text-muted-foreground mb-1">**** {acc.accountNumber.slice(-4)}</p>
                                                        <p className="font-bold text-lg">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                    </GlassCard>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-border/50 rounded-3xl bg-secondary/5">
                                <Wallet className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-semibold opacity-80">No Active Profile</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm text-center">Select or create a virtual card to access limits, settings, and full transaction controls.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
