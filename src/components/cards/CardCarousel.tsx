import { useState } from 'react';
import { Card } from '@/services/cardService';
import CreditCardComponent from '@/components/shared/CreditCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    cards: Card[];
    activeCardId: string;
    onActiveCardChange: (id: string) => void;
    onCreateCard: () => void;
}

export default function CardCarousel({ cards, activeCardId, onActiveCardChange, onCreateCard }: Props) {
    const currentIndex = cards.findIndex(c => c.id === activeCardId);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setDirection(1);
            onActiveCardChange(cards[currentIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            onActiveCardChange(cards[currentIndex - 1].id);
        }
    };

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/50 rounded-2xl bg-secondary/10">
                <p className="text-muted-foreground mb-4">No active cards found</p>
                <Button onClick={onCreateCard}>Create Virtual Card</Button>
            </div>
        );
    }

    const activeCard = cards[currentIndex];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.9,
        }),
    };

    return (
        <div className="relative w-full max-w-[500px] mx-auto py-6">
            <div className="flex justify-between items-center mb-6 px-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8 opacity-70 hover:opacity-100"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1.5">
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'}`}
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-8 h-8 opacity-70 hover:opacity-100"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="relative h-[320px] flex justify-center items-center overflow-hidden [perspective:1000px]">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={activeCard.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute w-full"
                    >
                        <CreditCardComponent
                            cardNumber={activeCard.cardNumber}
                            cardHolder={activeCard.cardHolder}
                            expiryDate={activeCard.expiryDate}
                            cvv={activeCard.cvv}
                            type={activeCard.type}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
