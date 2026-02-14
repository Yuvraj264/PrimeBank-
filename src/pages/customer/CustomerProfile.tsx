import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/shared/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User as UserIcon, MapPin, Briefcase, Heart, Mail, Phone, Edit2, Save, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

export default function CustomerProfile() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.data) {
                    dispatch(setUser(response.data.data));
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [dispatch]);

    // Reset form when entering edit mode or when user data changes
    useEffect(() => {
        if (user) {
            reset({
                department: 'Engineering', // example field, likely not needed but good for structure
                personalDetails: user.personalDetails,
                address: user.address,
                professionalDetails: user.professionalDetails,
                nominee: user.nominee
            });
        }
    }, [user, isEditing, reset]);

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            const response = await api.patch('/auth/profile', data);
            dispatch(setUser(response.data.data));
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            reset(); // Reset changes if cancelling
        }
        setIsEditing(!isEditing);
    };

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Profile Card */}
                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
                    <div className="relative pt-12 px-6 pb-6 flex flex-col md:flex-row items-end gap-6">
                        <div className="flex items-center gap-6 flex-1">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 mb-2">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" /> {user.phone}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={user.profileCompleted ? "default" : "secondary"}>
                                        {user.profileCompleted ? "Profile Completed" : "Setup Pending"}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={toggleEdit} disabled={isSaving} className="gap-2">
                                        <X className="w-4 h-4" /> Cancel
                                    </Button>
                                    <Button onClick={handleSubmit(onSubmit)} disabled={isSaving} className="gap-2">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={toggleEdit} className="gap-2">
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </GlassCard>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[400px] mb-6">
                            <TabsTrigger value="personal">Personal</TabsTrigger>
                            <TabsTrigger value="address">Address</TabsTrigger>
                            <TabsTrigger value="professional">Work</TabsTrigger>
                            <TabsTrigger value="nominee">Nominee</TabsTrigger>
                        </TabsList>

                        {/* Personal Details Tab */}
                        <TabsContent value="personal" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-primary" /> Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableField
                                        isEditing={isEditing} label="Full Name" name="personalDetails.fullName"
                                        register={register} value={user.personalDetails?.fullName || user.name}
                                    />

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label>Date of Birth</Label>
                                            <Input type="date" {...register('personalDetails.dob')} />
                                        </div>
                                    ) : (
                                        <InfoItem label="Date of Birth" value={user.personalDetails?.dob ? format(new Date(user.personalDetails.dob), 'PPP') : 'N/A'} />
                                    )}

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Controller
                                                name="personalDetails.gender"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <InfoItem label="Gender" value={user.personalDetails?.gender} className="capitalize" />
                                    )}

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label>Marital Status</Label>
                                            <Controller
                                                name="personalDetails.maritalStatus"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="single">Single</SelectItem>
                                                            <SelectItem value="married">Married</SelectItem>
                                                            <SelectItem value="divorced">Divorced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <InfoItem label="Marital Status" value={user.personalDetails?.maritalStatus} className="capitalize" />
                                    )}

                                    <EditableField
                                        isEditing={isEditing} label="Father's Name" name="personalDetails.fatherName"
                                        register={register} value={user.personalDetails?.fatherName}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Address Details Tab */}
                        <TabsContent value="address" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" /> Address Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableField
                                        isEditing={isEditing} label="Street" name="address.street"
                                        register={register} value={user.address?.street} className="md:col-span-2"
                                    />
                                    <EditableField
                                        isEditing={isEditing} label="City" name="address.city"
                                        register={register} value={user.address?.city}
                                    />
                                    <EditableField
                                        isEditing={isEditing} label="State" name="address.state"
                                        register={register} value={user.address?.state}
                                    />
                                    <EditableField
                                        isEditing={isEditing} label="ZIP Code" name="address.zip"
                                        register={register} value={user.address?.zip}
                                    />
                                    <EditableField
                                        isEditing={isEditing} label="Country" name="address.country"
                                        register={register} value={user.address?.country}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Professional Details Tab */}
                        <TabsContent value="professional" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-primary" /> Professional Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableField
                                        isEditing={isEditing} label="Occupation" name="professionalDetails.occupation"
                                        register={register} value={user.professionalDetails?.occupation}
                                    />

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label>Income Source</Label>
                                            <Controller
                                                name="professionalDetails.incomeSource"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <InfoItem label="Income Source" value={user.professionalDetails?.incomeSource} className="capitalize" />
                                    )}

                                    <EditableField
                                        isEditing={isEditing} label="Annual Income" name="professionalDetails.annualIncome"
                                        register={register} value={user.professionalDetails?.annualIncome} type="number"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Nominee Details Tab */}
                        <TabsContent value="nominee" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-primary" /> Nominee Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableField
                                        isEditing={isEditing} label="Nominee Name" name="nominee.name"
                                        register={register} value={user.nominee?.name}
                                    />
                                    <EditableField
                                        isEditing={isEditing} label="Relationship" name="nominee.relation"
                                        register={register} value={user.nominee?.relation}
                                    />

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Label>Nominee DOB</Label>
                                            <Input type="date" {...register('nominee.dob')} />
                                        </div>
                                    ) : (
                                        <InfoItem label="Date of Birth" value={user.nominee?.dob ? format(new Date(user.nominee.dob), 'PPP') : 'N/A'} />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </DashboardLayout>
    );
}

function EditableField({
    isEditing,
    label,
    value,
    register,
    name,
    placeholder,
    type = "text",
    required = false,
    className = ""
}: any) {
    if (isEditing) {
        return (
            <div className={`space-y-2 ${className}`}>
                <Label>{label}</Label>
                <Input type={type} {...register(name, { required })} placeholder={placeholder || label} defaultValue={value} />
            </div>
        );
    }
    return <InfoItem label={label} value={value} className={className} />;
}

function InfoItem({ label, value, className = '' }: { label: string, value?: string | number, className?: string }) {
    return (
        <div className={className}>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="font-medium text-foreground">{value || 'Not Provided'}</p>
        </div>
    );
}
