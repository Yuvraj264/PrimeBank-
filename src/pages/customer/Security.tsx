import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Smartphone, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Security() {
    const [twoFactor, setTwoFactor] = useState(true);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Password updated successfully');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Security Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your account security and devices</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Change Password */}
                    <GlassCard>
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

                    {/* 2FA & Devices */}
                    <div className="space-y-6">
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4 text-purple-400">
                                <Shield className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable 2FA</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Require a code when logging in from a new device.
                                    </p>
                                </div>
                                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4 text-blue-400">
                                <Smartphone className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Active Sessions</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                            <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">iPhone 13 Pro</p>
                                            <p className="text-[10px] text-muted-foreground">San Francisco, US • Current Device</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded-full">Active</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between opacity-60">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center text-muted-foreground">
                                            <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">MacBook Pro</p>
                                            <p className="text-[10px] text-muted-foreground">New York, US • 2 days ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
