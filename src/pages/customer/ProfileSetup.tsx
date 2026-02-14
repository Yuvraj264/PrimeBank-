import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight, ChevronLeft, User, MapPin, Briefcase, Heart, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Address', icon: MapPin },
    { id: 3, title: 'Professional', icon: Briefcase },
    { id: 4, title: 'Nominee', icon: Heart },
];

export default function ProfileSetup() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const { register, handleSubmit, trigger, setValue, formState: { errors } } = useForm({
        mode: "onChange"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useDispatch();
    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const response = await api.patch('/auth/profile', data);
            dispatch(setUser(response.data.data));
            toast.success("Profile setup completed successfully!");
            navigate('/customer');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = ['personalDetails.fullName', 'personalDetails.dob', 'personalDetails.fatherName', 'personalDetails.gender', 'personalDetails.maritalStatus'];
                break;
            case 2:
                fieldsToValidate = ['address.street', 'address.city', 'address.state', 'address.zip', 'address.country'];
                break;
            case 3:
                fieldsToValidate = ['professionalDetails.occupation', 'professionalDetails.incomeSource', 'professionalDetails.annualIncome'];
                break;
            case 4:
                fieldsToValidate = ['nominee.name', 'nominee.relation', 'nominee.dob'];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Helper to access nested errors safely
    const getError = (path: string) => {
        return path.split('.').reduce((obj, key) => obj && obj[key], errors);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Complete Your Profile
                            </CardTitle>
                            <CardDescription>
                                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                            </CardDescription>
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                            {Math.round((currentStep / steps.length) * 100)}%
                        </div>
                    </div>
                    <Progress value={(currentStep / steps.length) * 100} className="h-2" />

                    {/* Stepper Icons */}
                    <div className="flex justify-between mt-8 px-2 md:px-12 relative">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 z-10 relative">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                        ${isActive ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/25' :
                                            isCompleted ? 'bg-primary/20 text-primary border-primary' :
                                                'bg-secondary text-muted-foreground border-border'}
                                    `}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-0" />
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-primary -z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="mt-6">
                    <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentStep === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Full Name (as per ID)</Label>
                                            <Input {...register('personalDetails.fullName', { required: true })} placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date of Birth</Label>
                                            <Input type="date" {...register('personalDetails.dob', { required: true })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Select onValueChange={(v) => register('personalDetails.gender').onChange({ target: { value: v } })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Marital Status</Label>
                                            <Select onValueChange={(v) => register('personalDetails.maritalStatus').onChange({ target: { value: v } })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">Single</SelectItem>
                                                    <SelectItem value="married">Married</SelectItem>
                                                    <SelectItem value="divorced">Divorced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Father's Name</Label>
                                            <Input {...register('personalDetails.fatherName', { required: true })} placeholder="Robert Doe" />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Street Address</Label>
                                            <Input {...register('address.street', { required: 'Street Address is required' })} placeholder="123 Main St, Apt 4B" />
                                            {getError('address.street') && <p className="text-xs text-destructive">{getError('address.street')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input {...register('address.city', { required: 'City is required' })} placeholder="Mumbai" />
                                            {getError('address.city') && <p className="text-xs text-destructive">{getError('address.city')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input {...register('address.state', { required: 'State is required' })} placeholder="Maharashtra" />
                                            {getError('address.state') && <p className="text-xs text-destructive">{getError('address.state')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ZIP / Postal Code</Label>
                                            <Input {...register('address.zip', { required: 'ZIP Code is required' })} placeholder="400001" />
                                            {getError('address.zip') && <p className="text-xs text-destructive">{getError('address.zip')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Input {...register('address.country', { required: 'Country is required' })} defaultValue="India" />
                                            {getError('address.country') && <p className="text-xs text-destructive">{getError('address.country')?.message as string}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Occupation</Label>
                                            <Input {...register('professionalDetails.occupation', { required: 'Occupation is required' })} placeholder="Software Engineer" />
                                            {getError('professionalDetails.occupation') && <p className="text-xs text-destructive">{getError('professionalDetails.occupation')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Source of Income</Label>
                                            <Select onValueChange={(v) => setValue('professionalDetails.incomeSource', v, { shouldValidate: true })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="salary">Salary</SelectItem>
                                                    <SelectItem value="business">Business</SelectItem>
                                                    <SelectItem value="freelance">Freelance</SelectItem>
                                                    <SelectItem value="investments">Investments</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" {...register('professionalDetails.incomeSource', { required: 'Income Source is required' })} />
                                            {getError('professionalDetails.incomeSource') && <p className="text-xs text-destructive">{getError('professionalDetails.incomeSource')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Annual Income (Estimate)</Label>
                                            <Input type="number" {...register('professionalDetails.annualIncome', { required: 'Annual Income is required' })} placeholder="1500000" />
                                            {getError('professionalDetails.annualIncome') && <p className="text-xs text-destructive">{getError('professionalDetails.annualIncome')?.message as string}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Nominee Name</Label>
                                            <Input {...register('nominee.name', { required: 'Nominee Name is required' })} placeholder="Jane Doe" />
                                            {getError('nominee.name') && <p className="text-xs text-destructive">{getError('nominee.name')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Relationship</Label>
                                            <Input {...register('nominee.relation', { required: 'Relationship is required' })} placeholder="Mother" />
                                            {getError('nominee.relation') && <p className="text-xs text-destructive">{getError('nominee.relation')?.message as string}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nominee DOB</Label>
                                            <Input type="date" {...register('nominee.dob', { required: 'Nominee DOB is required' })} />
                                            {getError('nominee.dob') && <p className="text-xs text-destructive">{getError('nominee.dob')?.message as string}</p>}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border/30 pt-6">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} className="gap-2">
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? 'Submitting...' : 'Complete Setup'} <CheckCircle2 className="w-4 h-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
