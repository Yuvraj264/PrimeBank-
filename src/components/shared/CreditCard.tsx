import { useState, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Wifi, Eye, EyeOff, Loader2, Cpu, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from '@/store';
import { verifyPassword } from '@/store/authSlice';

interface CreditCardProps {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    type?: 'visa' | 'mastercard';
    variant?: 'primary' | 'secondary' | 'dark' | 'gold';
}

export default function CreditCard({
    cardNumber,
    cardHolder,
    expiryDate,
    cvv,
}: CreditCardProps) {
    const dispatch = useAppDispatch();
    const [isRevealed, setIsRevealed] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false); // Controls 3D flipping
    const flipMotion = useSpring(0, { stiffness: 200, damping: 20 });

    useEffect(() => {
        flipMotion.set(isFlipped ? 180 : 0);
    }, [isFlipped, flipMotion]);

    // Mouse tilt effect
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const xSpring = useSpring(x);
    const ySpring = useSpring(y);
    const computedTransform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(calc(${ySpring}deg + ${flipMotion}deg))`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = (e.clientX - rect.left) * 32.5;
        const mouseY = (e.clientY - rect.top) * 32.5;
        const rX = (mouseY / height - 32.5 / 2) * -1;
        const rY = (mouseX / width - 32.5 / 2);
        x.set(rX);
        y.set(rY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const handleVerifyPassword = async () => {
        if (!password) {
            toast.error("Please enter your password");
            return;
        }

        setVerifying(true);
        try {
            await dispatch(verifyPassword(password)).unwrap();
            setIsRevealed(true);
            setShowPasswordModal(false);
            setPassword('');
            toast.success("Card data decrypted");
            setTimeout(() => {
                setIsRevealed(false);
                setIsFlipped(false);
            }, 30000);
        } catch (error: any) {
            toast.error(error || "Incorrect password");
        } finally {
            setVerifying(false);
        }
    };

    const normalizedCardNumber = cardNumber.length >= 16
        ? cardNumber.slice(0, 16)
        : cardNumber.length > 4
            ? cardNumber.slice(0, cardNumber.length - 4).padEnd(12, '0') + cardNumber.slice(-4)
            : cardNumber.padEnd(16, '0');

    const maskCardNumber = (num: string) => {
        if (isRevealed) return num.match(/.{1,4}/g)?.join(' ') || num;
        return `${num.slice(0, 4)}    ••••    ••••    ${num.slice(-4)}`;
    };

    const BaseCardStyles = () => (
        <>
            <div className="absolute inset-0 bg-[#050505] rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
                        backgroundSize: '4px 100%'
                    }}
                />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='28' viewBox='0 0 24 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0l12 7v14l-12 7L0 21V7z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '24px 28px'
                    }}
                />
            </div>
            <div className="absolute inset-0 rounded-2xl border-t border-l border-white/20 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-0 rounded-2xl border-b border-r border-cyan-500/30 pointer-events-none mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-y-12 pointer-events-none opacity-30" />
        </>
    );

    const FrontContent = () => (
        <div className="relative z-10 h-full flex flex-col justify-between p-8 select-none border border-transparent rounded-2xl bg-[#020202]">
            <BaseCardStyles />
            <div className="relative z-20 flex justify-between items-start">
                <h1 className="text-xl font-light tracking-[0.4em] uppercase text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: '"Michroma", "Segoe UI", sans-serif', textShadow: '0 0 1px rgba(255,255,255,0.5)' }}
                >
                    PRIME
                </h1>
                <div className="flex gap-4">
                    <Wifi className="w-6 h-6 text-cyan-500 rotate-90 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] opacity-90" />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                        onClick={() => setIsFlipped(true)}
                        title="Flip Card"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none perspective-500 z-10">
                <div className="absolute inset-0 bg-cyan-500 blur-[40px] opacity-20" />
                <div className="w-16 h-12 rounded-lg bg-black/80 relative border border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,255,0.2)] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-[200%] w-full animate-scan-fast pointer-events-none" />
                </div>
            </div>

            <div className="relative z-20 flex flex-col gap-5 mt-auto">
                <div className="flex items-center justify-between">
                    <p
                        className="text-2xl tracking-[0.14em] text-cyan-50 font-light mix-blend-screen"
                        style={{ fontFamily: 'Consolas, monospace', textShadow: '0 0 8px rgba(0, 200, 255, 0.3)' }}
                    >
                        {isRevealed ? (normalizedCardNumber.match(/.{1,4}/g)?.join(' ') || normalizedCardNumber) : maskCardNumber(normalizedCardNumber)}
                    </p>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-cyan-400/40 hover:text-cyan-200 hover:bg-cyan-900/10 rounded-full"
                        onClick={() => isRevealed ? setIsRevealed(false) : setShowPasswordModal(true)}
                    >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <div>
                        <p className="text-[8px] text-cyan-100/40 uppercase tracking-[0.25em]">Cardholder</p>
                        <p className="font-light tracking-[0.12em] uppercase text-sm text-gray-200 shadow-black drop-shadow-md">
                            {cardHolder}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const BackContent = () => (
        <div className="relative z-10 w-full h-full flex flex-col select-none rounded-2xl bg-[#020202] overflow-hidden">
            <BaseCardStyles />
            {/* Magnetic Stripe */}
            <div className="relative z-20 w-full h-12 bg-black mt-6 shadow-[inset_0_-1px_3px_rgba(255,255,255,0.1)]" />

            <div className="relative z-20 px-8 py-4 flex-1 flex flex-col">
                <div className="flex justify-between mt-auto mb-4 items-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                        onClick={() => setIsFlipped(false)}
                        title="Flip Card"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>

                    <div className="flex bg-white/10 p-2 rounded items-center gap-4 w-2/3 backdrop-blur-md">
                        <div className="flex-1 italic text-right text-black/50 tracking-widest bg-white h-7 flex items-center justify-end px-2" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)' }}>
                            <span className="font-mono text-xs">{normalizedCardNumber.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <p className="text-[10px] text-cyan-100/40 uppercase tracking-[0.2em]">CVV</p>
                            <p className="font-mono text-sm tracking-widest text-cyan-400 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-cyan-900/50 min-w-[34px] text-center">
                                {isRevealed ? cvv : '•••'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2 mb-2">
                    <p>Customer Service: 1-800-000-0000</p>
                    <p className="font-mono">EXP {expiryDate}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="group perspective-1000 w-full max-w-[500px] mx-auto">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: computedTransform,
                    transformStyle: 'preserve-3d'
                }}
                className="relative w-full aspect-[1.586/1] rounded-2xl shadow-2xl z-20"
            >
                {/* Front face */}
                <div
                    className="absolute inset-0"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        zIndex: isFlipped ? 0 : 10,
                        pointerEvents: isFlipped ? 'none' : 'auto'
                    }}
                >
                    <FrontContent />
                </div>

                {/* Back face */}
                <div
                    className="absolute inset-0"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        zIndex: isFlipped ? 10 : 0,
                        pointerEvents: isFlipped ? 'auto' : 'none'
                    }}
                >
                    <BackContent />
                </div>
            </motion.div>

            {/* Depth of Field Blur Overlay (Corners) */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-overlay"
                style={{ background: 'radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.5) 100%)' }}
            />

            {/* Password Verification Modal */}
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <DialogContent className="sm:max-w-md bg-black border border-cyan-900/50 text-white shadow-[0_0_100px_rgba(0,100,255,0.15)]">
                    <DialogHeader>
                        <DialogTitle className="font-light text-cyan-400 tracking-wider">SYSTEM AUTH</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Identity verification required for decryption.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="password"
                            placeholder="Passcode"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                            className="bg-gray-950 border-gray-800 text-cyan-100 focus:ring-1 focus:ring-cyan-500 transition-all font-mono tracking-widest"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white">Cancel</Button>
                        <Button onClick={handleVerifyPassword} disabled={verifying} className="bg-cyan-950 text-cyan-400 border border-cyan-900 hover:bg-cyan-900 hover:text-white transition-all shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                            {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            AUTHENTICATE
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
