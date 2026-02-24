import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { adminService } from '@/services/adminService';
import { Save, Globe, Shield, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>({
        maintenanceMode: false,
        allowNewRegistrations: true,
        require2FA: true,
        maxLoginAttempts: 3,
        sessionTimeoutMins: 30,
        minTransferLimit: 100,
        maxTransferLimit: 50000,
        systemEmail: 'admin@primebank.com'
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await adminService.getConfig();
                if (data.data) setConfig(data.data);
            } catch (error) {
                console.error('Failed to fetch config:', error);
                toast.error('Failed to load system configuration');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateConfig(config);
            toast.success("System configuration updated successfully");
        } catch (error) {
            console.error('Failed to save config:', error);
            toast.error('Failed to save system configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleClearCache = async () => {
        try {
            await adminService.clearSystemCache();
            toast.success("System cache cleared successfully");
        } catch (error) {
            toast.error("Failed to clear system cache");
        }
    };

    const handleResetSessions = async () => {
        if (!confirm("Are you sure? This will log out all users.")) return;
        try {
            await adminService.resetAllSessions();
            toast.success("All user sessions have been reset");
        } catch (error) {
            toast.error("Failed to reset sessions");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">System Configuration</h1>
                        <p className="text-muted-foreground text-sm mt-1">Global settings and parameters</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* General Settings */}
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" /> General Settings
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Disable user access for updates</p>
                                </div>
                                <Switch
                                    checked={config.maintenanceMode}
                                    onCheckedChange={(c) => setConfig({ ...config, maintenanceMode: c })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow New Registrations</Label>
                                    <p className="text-sm text-muted-foreground">Public sign-up availability</p>
                                </div>
                                <Switch
                                    checked={config.allowNewRegistrations}
                                    onCheckedChange={(c) => setConfig({ ...config, allowNewRegistrations: c })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>System Notification Email</Label>
                                <Input
                                    value={config.systemEmail}
                                    onChange={(e) => setConfig({ ...config, systemEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Security Settings */}
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-success" /> Security & Access
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Enforce 2FA</Label>
                                    <p className="text-sm text-muted-foreground">Require two-factor auth for all users</p>
                                </div>
                                <Switch
                                    checked={config.require2FA}
                                    onCheckedChange={(c) => setConfig({ ...config, require2FA: c })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Login Attempts</Label>
                                <Input
                                    type="number"
                                    value={config.maxLoginAttempts}
                                    onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Session Timeout (Minutes)</Label>
                                <Input
                                    type="number"
                                    value={config.sessionTimeoutMins}
                                    onChange={(e) => setConfig({ ...config, sessionTimeoutMins: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Transaction Limits */}
                    <GlassCard>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-warning" /> Transaction Limits
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min Transfer ($)</Label>
                                    <Input
                                        type="number"
                                        value={config.minTransferLimit}
                                        onChange={(e) => setConfig({ ...config, minTransferLimit: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Transfer ($)</Label>
                                    <Input
                                        type="number"
                                        value={config.maxTransferLimit}
                                        onChange={(e) => setConfig({ ...config, maxTransferLimit: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Danger Zone */}
                    <GlassCard className="border-destructive/30 bg-destructive/5">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" /> Danger Zone
                        </h3>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Irreversible system actions. Proceed with caution.</p>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="border-destructive/50 hover:bg-destructive/10 text-destructive"
                                    onClick={handleClearCache}
                                >
                                    Clear Cache
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleResetSessions}
                                >
                                    Reset All Sessions
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
