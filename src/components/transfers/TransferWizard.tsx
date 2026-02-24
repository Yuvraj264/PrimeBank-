import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransferState, initialTransferState } from './types';
import GlassCard from '@/components/shared/GlassCard';
import Step1TypeSelect from './steps/Step1TypeSelect';
import Step2Beneficiary from './steps/Step2Beneficiary';
import Step3Details from './steps/Step3Details';
import Step4Review from './steps/Step4Review';
import Step5Confirm from './steps/Step5Confirm';
import Step6Success from './steps/Step6Success';

const steps = [
    'Transfer Type',
    'Beneficiary',
    'Transfer Details',
    'Review',
    'Confirmation',
    'Success'
];

export default function TransferWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [transferData, setTransferData] = useState<TransferState>(initialTransferState);

    const updateData = (updates: Partial<TransferState>) => {
        setTransferData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const goToStep = (step: number) => setCurrentStep(step);

    const resetWizard = () => {
        setTransferData(initialTransferState);
        setCurrentStep(1);
    };

    const pageVariants = {
        initial: { opacity: 0, x: 20 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -20 }
    };

    const pageTransition: any = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.3
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Progress Bar */}
            {currentStep < 6 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {steps.slice(0, 5).map((stepLbl, index) => (
                            <div
                                key={index}
                                className={`text-xs font-medium ${currentStep > index + 1 ? 'text-primary' : currentStep === index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                                {stepLbl}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                        {steps.slice(0, 5).map((_, index) => (
                            <div
                                key={index}
                                className={`h-full flex-1 rounded-full transition-all duration-500 ease-in-out ${currentStep > index + 1
                                    ? 'bg-primary'
                                    : currentStep === index + 1
                                        ? 'bg-primary/70'
                                        : 'bg-transparent'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <GlassCard className="relative overflow-hidden min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="h-full"
                    >
                        {currentStep === 1 && <Step1TypeSelect data={transferData} updateData={updateData} onNext={nextStep} />}
                        {currentStep === 2 && <Step2Beneficiary data={transferData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 3 && <Step3Details data={transferData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 4 && <Step4Review data={transferData} onNext={nextStep} onPrev={prevStep} onEdit={goToStep} />}
                        {currentStep === 5 && <Step5Confirm data={transferData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 6 && <Step6Success data={transferData} onReset={resetWizard} />}
                    </motion.div>
                </AnimatePresence>
            </GlassCard>
        </div>
    );
}
