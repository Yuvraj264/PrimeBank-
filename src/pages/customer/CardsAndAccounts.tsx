import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import api from '@/lib/api';
import { accountService } from '@/services/accountService';
import { cardService, Card as CardType } from '@/services/cardService';
import { Account } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import CreditCardComponent from '@/components/shared/CreditCard';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, ArrowUpRight, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function CardsAndAccounts() {
    const { user } = useAppSelector((s) => s.auth);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cards, setCards] = useState<CardType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accData, cardData] = await Promise.all([
                    accountService.getMyAccounts(),
                    cardService.getMyCards()
                ]);
                setAccounts(accData);
                setCards(cardData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load cards and accounts");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user?.id]);

    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

    const handleCreateCard = async () => {
        try {
            setLoading(true);
            const newCard = await cardService.createCard();
            setCards([...cards, newCard]);
            toast.success("Virtual card created successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create card");
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeCard = async (cardId: string) => {
        try {
            const updatedCard = await cardService.toggleCardFreeze(cardId);
            setCards(cards.map(c => c.id === cardId ? updatedCard : c));
            toast.success(`Card ${updatedCard.status === 'active' ? 'unfrozen' : 'frozen'} successfully`);
        } catch (error: any) {
            toast.error("Failed to update card status");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Cards & Accounts</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your payment methods and banking accounts</p>
                    </div>
                    {cards.length === 0 && (
                        <Button className="gap-2" onClick={handleCreateCard}>
                            <Plus className="w-4 h-4" /> Add New
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cards Section */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" /> My Cards
                        </h2>

                        {cards.length > 0 ? (
                            <div className="space-y-6">
                                {cards.map((card) => (
                                    <div key={card.id} className="relative group">
                                        <CreditCardComponent
                                            cardNumber={card.cardNumber}
                                            cardHolder={card.cardHolder}
                                            expiryDate={card.expiryDate}
                                            cvv={card.cvv}
                                            type={card.type}
                                            variant="primary" // You could alternate variants here
                                        />
                                        <div className="absolute -bottom-10 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex gap-2 bg-background/80 backdrop-blur-md p-1 rounded-full border border-border shadow-lg">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Limits
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-8 text-xs gap-1 ${card.status === 'frozen' ? 'text-primary' : 'text-destructive hover:text-destructive'}`}
                                                    onClick={() => handleFreezeCard(card.id)}
                                                >
                                                    <Lock className="w-3 h-3" /> {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <GlassCard>
                                <div className="text-center py-8">
                                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-muted-foreground">No active cards found.</p>
                                    <Button variant="link" className="mt-2" onClick={handleCreateCard}>Apply for a Card</Button>
                                </div>
                            </GlassCard>
                        )}
                    </div>

                    {/* Accounts Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" /> Accounts Overview
                        </h2>

                        <div className="grid gap-4">
                            {/* Total Balance Summary */}
                            <GlassCard className="bg-primary/5 border-primary/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Net Worth</p>
                                        <AnimatedCounter
                                            value={totalBalance}
                                            prefix="$"
                                            decimals={2}
                                            className="text-3xl font-bold mt-1"
                                        />
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Account List */}
                            {accounts.map((acc) => (
                                <GlassCard key={acc.id} className="hover:bg-secondary/20 transition-colors cursor-pointer group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                <Wallet className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold capitalize text-lg">{acc.type.replace('_', ' ')} Account</h3>
                                                <p className="text-sm text-muted-foreground font-mono">**** **** **** {acc.accountNumber.slice(-4)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${acc.status === 'active' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                                                    {acc.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border/10 flex justify-between items-center">
                                        <div className="text-xs text-muted-foreground">
                                            Limit: ${acc.usedLimit.toLocaleString()} / ${acc.dailyLimit.toLocaleString()} used
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <ArrowUpRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
