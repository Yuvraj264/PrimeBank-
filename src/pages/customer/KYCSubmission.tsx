import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { kycService } from '@/services/kycService';

export default function KYCSubmission() {
    const navigate = useNavigate();
    const [idType, setIdType] = useState('aadhaar');
    const [documentNumber, setDocumentNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !documentNumber) {
            toast.error("Please provide all details");
            return;
        }
        setIsSubmitting(true);

        try {
            // Note: In a real app, we would upload the file first then send URL
            // For this demo, we are sending metadata only as backend doesn't support file upload yet
            await kycService.submitKYC({
                documentType: idType,
                documentNumber: documentNumber,
                documentUrl: file.name // Placeholder
            } as any);
            toast.success("KYC Documents submitted successfully!");
            navigate('/customer');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">KYC Verification</h1>
                    <p className="text-muted-foreground text-sm mt-1">Submit your identity documents to unlock full account features</p>
                </div>

                <div className="grid gap-6">
                    {/* Status Card */}
                    <GlassCard className="border-l-4 border-l-warning bg-warning/5">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-warning-foreground">Verification Pending</h3>
                                <p className="text-sm text-foreground/80 mt-1">
                                    Your account is currently limited. Complete KYC to enable international transfers and higher limits.
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Submission Form */}
                    <GlassCard>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Document Type</Label>
                                <Select value={idType} onValueChange={setIdType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                        <SelectItem value="pan">PAN Card</SelectItem>
                                        <SelectItem value="passport">Passport</SelectItem>
                                        <SelectItem value="driving_license">Driving License</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Document Number</Label>
                                <Input
                                    placeholder="Enter Document Number"
                                    value={documentNumber}
                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Upload Document (Front & Back)</Label>
                                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-secondary/20 transition-colors text-center cursor-pointer relative">
                                    <Input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            {file ? (
                                                <p className="font-medium text-primary">{file.name}</p>
                                            ) : (
                                                <>
                                                    <p className="font-medium">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="w-4 h-4 text-success" />
                                    Your data is encrypted and secure
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="gap-2">
                                    {isSubmitting ? 'Uploading...' : 'Submit for Verification'}
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </DashboardLayout>
    );
}
