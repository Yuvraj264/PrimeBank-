import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Settings as SettingsIcon, Moon, Sun, Globe, Bell, Mail, Smartphone,
    ShieldCheck, Download, Trash2, EyeOff, Loader2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    // Theme & Display State
    const [isDarkMode, setIsDarkMode] = useState(true); // Default matching current app theme
    const [language, setLanguage] = useState('en');

    // Notification State
    const [pushNotifs, setPushNotifs] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);

    // Privacy State
    const [shareData, setShareData] = useState(false);
    const [publicProfile, setPublicProfile] = useState(false);
    const [isProcessingDownload, setIsProcessingDownload] = useState(false);

    // Closure State
    const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
    const [isProcessingClosure, setIsProcessingClosure] = useState(false);

    // Handlers
    const handleThemeToggle = (checked: boolean) => {
        setIsDarkMode(checked);
        // Note: Real implementation would toggle a 'dark' class on HTML element or use a ThemeProvider
        toast.info(`Theme set to ${checked ? 'Dark' : 'Light'} Mode (Simulation)`);
    };

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        toast.success("Language preference updated.");
    };

    const handleDownloadData = () => {
        setIsProcessingDownload(true);
        setTimeout(() => {
            setIsProcessingDownload(false);
            const blob = new Blob(['Mock User Data Archive'], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PrimeBank_Data_Archive_${new Date().toISOString().split('T')[0]}.zip`;
            a.click();
            toast.success("Data archive downloaded successfully!");
        }, 2500);
    };

    const handleCloseAccount = () => {
        setIsProcessingClosure(true);
        setTimeout(() => {
            setIsProcessingClosure(false);
            setIsClosureDialogOpen(false);
            toast.error("Account closure request submitted. An agent will contact you shortly.");
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center relative glow-primary">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Manage your display, notifications, and privacy preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">

                    {/* Theme and Display */}
                    <GlassCard className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                            {/* Theme Toggle */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    <h3 className="font-semibold text-lg">Appearance Theme</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 w-3/4">
                                    Customize how the PrimeBank dashboard looks on this device.
                                </p>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 max-w-xs">
                                    <Sun className={`w-4 h-4 ${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
                                    <Moon className={`w-4 h-4 ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                            </div>

                            <div className="w-px h-24 bg-border/50 hidden sm:block"></div>

                            {/* Language Selector */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                    <Globe className="w-5 h-5" />
                                    <h3 className="font-semibold text-lg">Language</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select your preferred region language.
                                </p>
                                <Select value={language} onValueChange={handleLanguageChange}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English (US)</SelectItem>
                                        <SelectItem value="es">Español (ES)</SelectItem>
                                        <SelectItem value="fr">Français (FR)</SelectItem>
                                        <SelectItem value="hi">हिन्दी (IN)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </GlassCard>

                    {/* Notification Preferences */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-orange-400">
                            <Bell className="w-5 h-5" />
                            <h3 className="font-semibold text-lg">Notification Preferences</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            Choose how you want to receive alerts for transactions, security, and updates.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><Bell className="w-4 h-4" /></div>
                                    <div>
                                        <Label className="text-base font-medium">Push Notifications</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Receive real-time alerts on this device.</p>
                                    </div>
                                </div>
                                <Switch checked={pushNotifs} onCheckedChange={(v) => { setPushNotifs(v); toast.success("Push preferences updated"); }} />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <Label className="text-base font-medium">Email Summaries</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Get weekly PDFs and important account notices.</p>
                                    </div>
                                </div>
                                <Switch checked={emailNotifs} onCheckedChange={(v) => { setEmailNotifs(v); toast.success("Email preferences updated"); }} />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><Smartphone className="w-4 h-4" /></div>
                                    <div>
                                        <Label className="text-base font-medium">SMS Text Alerts</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Standard carrier messaging rates may apply.</p>
                                    </div>
                                </div>
                                <Switch checked={smsNotifs} onCheckedChange={(v) => { setSmsNotifs(v); toast.success("SMS preferences updated"); }} />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Privacy & Data */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-purple-500">
                            <ShieldCheck className="w-5 h-5" />
                            <h3 className="font-semibold text-lg">Privacy & Data Controls</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            Manage who sees your information and how it's used to improve PrimeBank.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1"><EyeOff className="w-4 h-4 text-muted-foreground" /> <Label className="text-sm font-medium">Hide Public Profile</Label></div>
                                    <p className="text-xs text-muted-foreground max-w-sm">Prevent other users in PrimeBank from seeing you when searching to add beneficiaries.</p>
                                </div>
                                <Switch checked={publicProfile} onCheckedChange={(v) => { setPublicProfile(v); toast.success("Profile visibility updated"); }} />
                            </div>

                            <hr className="border-border/50" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium mb-1">Share Data for Personalization</Label>
                                    <p className="text-xs text-muted-foreground max-w-sm">Allow PrimeBank to use your anonymous transaction data to offer personalized financial advice.</p>
                                </div>
                                <Switch checked={shareData} onCheckedChange={(v) => { setShareData(v); toast.success("Data sharing preferences updated"); }} />
                            </div>

                            <div className="p-5 mt-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-medium text-sm text-primary mb-1">Download Your Account Data</h4>
                                    <p className="text-xs text-muted-foreground">Request a copy of all information PrimeBank holds on you, including transactions and logs.</p>
                                </div>
                                <Button onClick={handleDownloadData} disabled={isProcessingDownload} className="shrink-0 w-full sm:w-auto">
                                    {isProcessingDownload ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                    {isProcessingDownload ? "Compiling..." : "Export Archive"}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Danger Zone */}
                    <GlassCard className="p-6 border border-destructive/30 bg-destructive/5 mt-4">
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <Trash2 className="w-5 h-5" />
                            <h3 className="font-semibold text-lg">Danger Zone</h3>
                        </div>
                        <p className="text-sm text-foreground/80 mb-6 max-w-2xl">
                            Permanently delete your PrimeBank account. This action is irreversible and all your transaction history, beneficiaries, and active deposits will be lost. Please ensure your balance is $0.00 before proceeding.
                        </p>

                        <Button variant="destructive" onClick={() => setIsClosureDialogOpen(true)}>
                            Request Account Closure
                        </Button>

                        {/* Closure Confirmation Dialog */}
                        <AlertDialog open={isClosureDialogOpen} onOpenChange={setIsClosureDialogOpen}>
                            <AlertDialogContent className="border-destructive/30 bg-background/95 backdrop-blur-xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground pt-2">
                                        This action cannot be undone. This will permanently delete your account
                                        and erase all linked data from our servers. A PrimeBank representative will review your request within 24 hours.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel disabled={isProcessingClosure}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => { e.preventDefault(); handleCloseAccount(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isProcessingClosure}>
                                        {isProcessingClosure ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Confirm Deletion Request
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </GlassCard>

                </div>
            </div>
        </DashboardLayout>
    );
}
