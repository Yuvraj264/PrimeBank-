import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Link, AlertCircle, CheckCircle2, Copy, RefreshCcw, ShieldAlert, Webhook } from 'lucide-react';
import { merchantService } from '@/services/merchantService';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const APIBanking = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [updatingWebhook, setUpdatingWebhook] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchConfig = async () => {
        try {
            const res = await merchantService.getApiConfig();
            setConfig(res.data.data);
            setWebhookUrl(res.data.data.webhookUrl || '');
        } catch (err: any) {
            // 404 is expected here during the very first run since BusinessProfile might not exist until they generate a key
            if (err.response?.status !== 404) {
                toast({
                    title: 'Error fetching config',
                    description: 'Failed to load API banking configuration.',
                    variant: 'destructive'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleGenerateKey = async () => {
        if (!window.confirm("WARNING: Generating a new key will instantly invalidate your old key. All active integrations will break until updated. Continue?")) {
            return;
        }

        setGenerating(true);
        try {
            const res = await merchantService.generateApiKey();
            setNewKey(res.data.data.apiKey);
            await fetchConfig();
            toast({
                title: 'API Key Generated',
                description: 'Please copy your new key immediately.',
            });
        } catch (err: any) {
            toast({
                title: 'Generation Failed',
                description: err.response?.data?.message || 'Failed to generate key',
                variant: 'destructive'
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateWebhook = async () => {
        if (!webhookUrl || !webhookUrl.startsWith('https://')) {
            toast({
                title: 'Invalid URL',
                description: 'Webhook URLs must start with https://',
                variant: 'destructive'
            });
            return;
        }

        setUpdatingWebhook(true);
        try {
            await merchantService.updateWebhook(webhookUrl);
            toast({
                title: 'Webhook Updated',
                description: 'Successfully registered new endpoint.',
            });
            fetchConfig();
        } catch (err: any) {
            toast({
                title: 'Update Failed',
                description: err.response?.data?.message || 'Failed to update webhook',
                variant: 'destructive'
            });
        } finally {
            setUpdatingWebhook(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: 'Copied to clipboard.',
            duration: 2000,
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">API Banking Hub</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your programmatic access keys and webhook endpoints.
                    </p>
                </div>

                {/* New Key Warning Modal / Banner */}
                {newKey && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-destructive/20 text-destructive mt-1">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-destructive mb-1">Store this key immediately!</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    For security reasons, this is the <strong>only time</strong> we will ever show you this full API key. If you lose it, you will need to generate a new one.
                                </p>

                                <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg">
                                    <code className="text-primary font-mono text-sm break-all flex-1">
                                        {newKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(newKey)}
                                        className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setNewKey(null)}
                                    className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                                >
                                    I have saved this key safely
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* API Keys Panel */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <Key className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold">Authentication</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                    Active API Prefix
                                </label>
                                <div className="flex items-center justify-between p-3 bg-accent/50 border border-border rounded-lg">
                                    <code className="text-sm font-mono text-muted-foreground">
                                        {config?.apiKey || 'No active key'}
                                    </code>
                                    {config?.apiKey && (
                                        <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium px-2 py-1 rounded-full bg-green-500/10">
                                            <CheckCircle2 className="w-3 h-3" /> Active
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                    Rate Limit
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl font-bold">{config?.apiRateLimit || 0}</div>
                                    <span className="text-sm text-muted-foreground">req / minute</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={generating}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {generating ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    ) : (
                                        <RefreshCcw className="w-4 h-4" />
                                    )}
                                    {config?.apiKey ? 'Rotate API Key' : 'Generate API Key'}
                                </button>
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    Rotating keys invalidates current integrations immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Webhooks Panel */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
                                <Webhook className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold">Webhooks</h2>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            We will send POST requests to this endpoint for critical business events like Bulk Payout completions, Vendor additions, and incoming transfers.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                                    Endpoint URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://api.yourdomain.com/webhooks/primebank"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <button
                                onClick={handleUpdateWebhook}
                                disabled={updatingWebhook}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                            >
                                {updatingWebhook && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>}
                                Save Webhook
                            </button>

                            <div className="mt-6 p-4 bg-accent/30 rounded-lg border border-border flex gap-3">
                                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Webhook endpoints must:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Be secured with <code>HTTPS</code></li>
                                        <li>Respond with a 2xx status code within 5 seconds</li>
                                        <li>Validate the PrimeBank signature hash headers</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default APIBanking;
