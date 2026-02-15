import { useState, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Wifi, Eye, EyeOff, Loader2, Cpu } from 'lucide-react';
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

    // Mouse tilt effect
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const xSpring = useSpring(x);
    const ySpring = useSpring(y);
    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

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
            toast.success("Card details revealed");
            setTimeout(() => setIsRevealed(false), 30000);
        } catch (error: any) {
            toast.error(error || "Incorrect password");
        } finally {
            setVerifying(false);
        }
    };

    const maskCardNumber = (num: string) => {
        if (isRevealed) return num.match(/.{1,4}/g)?.join(' ') || num;
        return `${num.slice(0, 4)}    ••••    ••••    ${num.slice(-4)}`;
    };

    // Shared Card Content for Main and Reflection
    const CardContent = () => (
        <>
            {/* --- 1. Base: Brushed Metallic Black w/ subtle Hex --- */}
            <div className="absolute inset-0 bg-[#050505] rounded-2xl overflow-hidden">
                {/* Metal Brush Texture */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
                        backgroundSize: '4px 100%'
                    }}
                />
                {/* Hexagonal Pattern - Very Subtle Matte */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='28' viewBox='0 0 24 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0l12 7v14l-12 7L0 21V7z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '24px 28px'
                    }}
                />
                {/* Cinematic Spotlight (Top Right) */}
                <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-radial-gradient from-white/10 via-transparent to-transparent blur-3xl opacity-40 pointer-events-none" />
            </div>

            {/* --- 2. Beveled Edge & Rim Lights (Studio Lighting) --- */}
            {/* Top/Left White Rim Light */}
            <div className="absolute inset-0 rounded-2xl border-t border-l border-white/20 pointer-events-none mix-blend-overlay" />
            {/* Bottom/Right Blue Rim Light */}
            <div className="absolute inset-0 rounded-2xl border-b border-r border-cyan-500/30 pointer-events-none mix-blend-screen" />

            {/* Glossy Reflection Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-y-12 pointer-events-none opacity-30" />


            {/* --- Content Layer (Sharp Focus) --- */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 select-none">

                {/* Top: Name Logo */}
                <div className="flex justify-between items-start">
                    <h1 className="text-xl font-light tracking-[0.4em] uppercase text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        style={{
                            fontFamily: '"Michroma", "Segoe UI", sans-serif',
                            textShadow: '0 0 1px rgba(255,255,255,0.5)' // Sharp etching
                        }}
                    >
                        PRIME BANK
                    </h1>
                    <Wifi className="w-6 h-6 text-cyan-500 rotate-90 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] opacity-90" />
                </div>

                {/* Middle: The HERO Holographic Chip */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none perspective-500">
                    {/* Glowing Backdrop */}
                    <div className="absolute inset-0 bg-cyan-500 blur-[40px] opacity-20" />

                    <div className="w-16 h-12 rounded-lg bg-black/80 relative border border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,255,0.2)] overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        {/* Internal Circuitry */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-40 invert sepia hue-rotate-180 saturate-200" />

                        {/* Central Core */}
                        <div className="relative z-10 w-6 h-6 bg-cyan-900/40 border border-cyan-400 rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.6)_inset]">
                            <Cpu className="w-3 h-3 text-cyan-200 drop-shadow-[0_0_5px_white]" />
                        </div>

                        {/* Holographic Scan Line Animation */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-[200%] w-full animate-scan-fast pointer-events-none" />
                    </div>
                </div>

                {/* Bottom: Typography */}
                <div className="flex flex-col gap-5 mt-auto">
                    <div className="flex items-center justify-between">
                        <p
                            className="text-2xl tracking-[0.14em] text-cyan-50 font-light mix-blend-screen"
                            style={{
                                fontFamily: 'Consolas, monospace',
                                textShadow: '0 0 8px rgba(0, 200, 255, 0.3)'
                            }}
                        >
                            {isRevealed ? (cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber) : maskCardNumber(cardNumber)}
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
                        <div className="flex gap-6">
                            <div className="text-right">
                                <p className="text-[8px] text-cyan-100/40 uppercase tracking-[0.25em]">Exp</p>
                                <p className="font-mono font-light tracking-widest text-sm text-gray-200 shadow-black drop-shadow-md">
                                    {expiryDate}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-cyan-100/40 uppercase tracking-[0.25em]">CVV</p>
                                <p className="font-mono font-light tracking-widest text-sm text-gray-200 shadow-black drop-shadow-md min-w-[3ch]">
                                    {isRevealed ? cvv : '•••'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="scale-95 group perspective-1000">
            {/* Main Card with 3D Tilt */}
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transform }}
                className="relative w-full aspect-[1.586/1] rounded-2xl shadow-2xl transition-all duration-200 isolate bg-[#020202] text-white z-20"
            >
                <CardContent />

                {/* --- 4. "Depth of Field" Blur Overlay (Corners) --- */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.5) 100%)',
                    }}
                />
            </motion.div>

            {/* Reflection Container (The "Dark Reflective Surface") */}
            <div className="relative w-full h-8 mt-[2px] z-10 perspective-1000">
                <motion.div
                    style={{ transform }}
                    className="absolute top-0 left-0 w-full h-full opacity-30 blur-[2px] transition-all duration-200"
                >
                    {/* Inverted Card Content for Reflection */}
                    <div className="w-full aspect-[1.586/1] scale-y-[-1] origin-top opacity-50 mask-image-gradient-reflection">
                        <div className="relative w-full h-full bg-[#020202] rounded-2xl overflow-hidden">
                            <CardContent />
                        </div>
                    </div>
                </motion.div>
                {/* Fade out mask for reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-[#0a0a0a]" />
            </div>


            {/* Password Verification Modal (Unchanged) */}
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
