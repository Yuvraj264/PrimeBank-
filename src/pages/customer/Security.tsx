import { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Shield, Smartphone, Lock, LogOut, KeyRound,
    History, MapPin, Globe, AlertTriangle, Snowflake, FileDown,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, subDays, subHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const loginActivity = [
    { id: 1, device: 'iPhone 13 Pro', location: 'San Francisco, US', browser: 'Safari Mobile', ip: '192.168.1.105', time: new Date(), status: 'success' },
    { id: 2, device: 'MacBook Pro', location: 'New York, US', browser: 'Chrome 114.0', ip: '203.0.113.42', time: subHours(new Date(), 4), status: 'success' },
    { id: 3, device: 'Unknown Device', location: 'Moscow, RU', browser: 'Firefox 92.0', ip: '45.12.33.2', time: subDays(new Date(), 1), status: 'failed' },
    { id: 4, device: 'Windows PC', location: 'London, UK', browser: 'Edge 110.0', ip: '82.10.43.121', time: subDays(new Date(), 5), status: 'success' },
];

export default function Security() {
    const [twoFactor, setTwoFactor] = useState(true);
    const [pin, setPin] = useState(['', '', '', '']);
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Freeze state
    const [isFrozen, setIsFrozen] = useState(false);
    const [isProcessingFreeze, setIsProcessingFreeze] = useState(false);

    // Download Log State
    const [isDownloading, setIsDownloading] = useState(false);

    // Handlers
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Password updated successfully');
    };

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto focus next
        if (value !== '' && index < 3) {
            pinRefs.current[index + 1]?.focus();
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
            pinRefs.current[index - 1]?.focus();
        }
    };

    const handleSavePin = () => {
        if (pin.some(p => p === '')) {
            toast.error("Please enter a 4-digit PIN");
            return;
        }
        toast.success("Transaction PIN updated successfully.");
        setPin(['', '', '', '']);
    };

    const handleFreezeToggle = () => {
        setIsProcessingFreeze(true);
        setTimeout(() => {
            setIsProcessingFreeze(false);
            setIsFrozen(!isFrozen);
            if (!isFrozen) {
                toast.success(<div className="flex flex-col"><span className="font-bold text-destructive">Account Frozen!</span><span className="text-sm">All outbound transactions have been temporarily blocked.</span></div>);
            } else {
                toast.success("Account unfrozen successfully.");
            }
        }, 1500);
    };

    const handleDownloadLogs = () => {
        setIsDownloading(true);
        setTimeout(() => {
            setIsDownloading(false);
            const blob = new Blob(['Mock Security Logs'], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Security_Logs_${new Date().getTime()}.pdf`;
            a.click();
            toast.success("Security logs downloaded!");
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Security Settings</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage your account security, passwords, and devices</p>
                    </div>
                    <Button variant="outline" onClick={handleDownloadLogs} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                        Download Security Logs
                    </Button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column (Passwords & PINs) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Change Password */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <Lock className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Change Password</h3>
                            </div>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input type="password" placeholder="••••••••" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input type="password" placeholder="••••••••" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input type="password" placeholder="••••••••" required />
                                </div>
                                <Button type="submit" className="w-full">Update Password</Button>
                            </form>
                        </GlassCard>

                        {/* Transaction PIN */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-4 text-purple-500">
                                <KeyRound className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Transaction PIN</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                                Set a secure 4-digit PIN required for all outbound fund transfers.
                            </p>
                            <div className="flex justify-center gap-3 mb-6">
                                {pin.map((digit, i) => (
                                    <Input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        className="w-12 h-14 text-center text-xl font-bold bg-background/50"
                                        value={digit}
                                        onChange={(e) => handlePinChange(i, e.target.value)}
                                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                                        ref={(el) => pinRefs.current[i] = el}
                                    />
                                ))}
                            </div>
                            <Button onClick={handleSavePin} className="w-full bg-purple-500 hover:bg-purple-600 text-white">Save PIN</Button>
                        </GlassCard>

                    </div>

                    {/* Right Column (Devices, Timeline, Freeze) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 2FA & Devices Group */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* 2FA */}
                            <GlassCard className="p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                                        <Shield className="w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Two-Factor (2FA)</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-6">
                                        Require an SMS or Authenticator code when logging in from a new device.
                                    </p>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 mt-auto">
                                    <span className="font-medium text-sm">Enable 2FA Protection</span>
                                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                                </div>
                            </GlassCard>

                            {/* Freeze Account (Danger Zone) */}
                            <GlassCard className={`p-6 border ${isFrozen ? 'border-primary shadow-[0_0_15px_rgba(0,255,255,0.2)] bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}>
                                <div className={`flex items-center gap-2 mb-2 ${isFrozen ? 'text-primary' : 'text-destructive'}`}>
                                    {isFrozen ? <Snowflake className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    <h3 className="font-semibold text-lg">{isFrozen ? 'Account Frozen' : 'Danger Zone'}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-6">
                                    If you suspect fraudulent activity, you can instantly block all outbound transfers and card payments.
                                </p>
                                <Button
                                    onClick={handleFreezeToggle}
                                    disabled={isProcessingFreeze}
                                    variant={isFrozen ? "default" : "destructive"}
                                    className="w-full mt-auto"
                                >
                                    {isProcessingFreeze ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        isFrozen ? <Lock className="w-4 h-4 mr-2" /> : <Snowflake className="w-4 h-4 mr-2" />}
                                    {isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                                </Button>
                            </GlassCard>
                        </div>

                        {/* Recent Login Activity */}
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-2 mb-6 text-orange-400">
                                <History className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Login Activity Timeline</h3>
                            </div>

                            <div className="space-y-6 pl-4 relative before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {loginActivity.map((log, index) => (
                                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                        {/* Timeline Dot */}
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${log.status === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'} absolute md:static -left-4 md:left-auto top-1/2 -translate-y-1/2`}>
                                            {log.status === 'success' ? <Globe className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                        </div>

                                        {/* Content Box */}
                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] ml-6 md:ml-0 p-4 rounded-xl border border-border/50 bg-secondary/20 shadow-sm transition-all hover:bg-secondary/40">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                                                <div className="flex items-center gap-2 font-semibold text-sm">
                                                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                                                    {log.device}
                                                    {index === 0 && <span className="px-1.5 py-0.5 rounded-sm bg-success/20 text-success text-[10px] ml-1 uppercase">Current</span>}
                                                </div>
                                                <time className="text-[10px] text-muted-foreground bg-background rounded-full px-2 py-0.5 whitespace-nowrap">
                                                    {formatDistanceToNow(log.time, { addSuffix: true })}
                                                </time>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {log.location}</div>
                                                <div className="flex justify-end gap-1.5">{log.browser}</div>
                                                <div className="flex items-center gap-1.5 col-span-2 mt-1 opacity-70">IP: {log.ip}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
