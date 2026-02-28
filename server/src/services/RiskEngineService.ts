import mongoose from 'mongoose';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import Loan from '../models/Loan';

export interface RiskAnalysisResult {
    approvalProbability: number;
    maxLoanLimit: number;
    riskScore: number;
    assignedInterestRate: number;
    approved: boolean;
}

export interface EMIScheduleItem {
    month: number;
    principalComponent: number;
    interestComponent: number;
    remainingBalance: number;
}

export class RiskEngineService {

    /**
     * Advanced Risk Scoring Algorithm to determine loan eligibility.
     */
    async evaluateRisk(
        userId: string,
        requestedPrincipal: number,
        tenureMonths: number,
        declaredIncome: number
    ): Promise<RiskAnalysisResult> {

        // 1. Fetch User Data
        const user = await User.findById(userId);
        const accounts = await Account.find({ userId: userId as any });
        const existingLoans = await Loan.find({ userId: userId as any, status: 'approved' });

        // Calculate Existing EMI burden
        let totalMonthlyEMI = 0;
        existingLoans.forEach(loan => {
            if (loan.remainingBalance > 0) {
                totalMonthlyEMI += loan.emiAmount;
            }
        });

        // Calculate Credit Usage vs Balance
        let totalBalance = 0;
        accounts.forEach(acc => totalBalance += acc.balance);

        const accountAgeDays = user ? Math.floor((new Date().getTime() - new Date((user as any).createdAt).getTime()) / (1000 * 3600 * 24)) : 30;

        // Base score starts at 600
        let riskScore = 600;

        // Factor 1: Income to EMI Ratio (DTI - Debt to Income)
        const proposedEMI = (requestedPrincipal / tenureMonths) * 1.05; // rough estimate with interest
        const totalProjectedEMI = totalMonthlyEMI + proposedEMI;
        const dtiRatio = (totalProjectedEMI / (declaredIncome || 1)) * 100;

        if (dtiRatio < 30) riskScore += 100;
        else if (dtiRatio < 50) riskScore += 50;
        else if (dtiRatio > 70) riskScore -= 100;

        // Factor 2: Account Age (Loyalty)
        if (accountAgeDays > 365) riskScore += 50;
        if (accountAgeDays > 1000) riskScore += 50;

        // Factor 3: AML Risk Check (Lower score reduces loan risk score)
        if (user && user.riskLevel === 'high') riskScore -= 200;
        if (user && user.riskLevel === 'medium') riskScore -= 50;

        // Factor 4: Liquidity
        if (totalBalance > requestedPrincipal * 0.2) riskScore += 50; // good liquidity

        // Bound validation
        riskScore = Math.max(300, Math.min(850, riskScore));

        // Generate Probability (Logistic mapping)
        let approvalProbability = 0;
        if (riskScore >= 750) approvalProbability = 95;
        else if (riskScore >= 650) approvalProbability = 75;
        else if (riskScore >= 550) approvalProbability = 40;
        else approvalProbability = 10;

        // Max Loan Limit Cap (E.g. 50x monthly income, capped at 10M)
        let maxLoanLimit = (declaredIncome * 50);
        if (riskScore < 600) maxLoanLimit *= 0.2;
        maxLoanLimit = Math.min(maxLoanLimit, 10000000);

        // Dynamic Interest Pricing
        let assignedInterestRate = 12.0; // Base rate
        if (riskScore >= 800) assignedInterestRate = 7.5;
        else if (riskScore >= 700) assignedInterestRate = 9.0;
        else if (riskScore >= 600) assignedInterestRate = 14.5;

        // Final Approval Decision based on Probability
        const approved = approvalProbability >= 50 && requestedPrincipal <= maxLoanLimit;

        return {
            approvalProbability,
            maxLoanLimit,
            riskScore,
            assignedInterestRate,
            approved
        };
    }

    /**
     * EMI Schedule Generator
     * Generates a full amortization table.
     */
    generateEMISchedule(principal: number, annualInterestRate: number, tenureMonths: number): EMIScheduleItem[] {
        const schedule: EMIScheduleItem[] = [];

        let remainingBalance = principal;

        // Monthly interest mapping
        const r = (annualInterestRate / 12) / 100;

        let emiAmount = 0;
        if (r > 0) {
            emiAmount = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
        } else {
            emiAmount = principal / tenureMonths;
        }

        // Round EMI once
        emiAmount = Math.round(emiAmount * 100) / 100;

        for (let month = 1; month <= tenureMonths; month++) {
            let interestComponent = remainingBalance * r;
            let principalComponent = emiAmount - interestComponent;

            // Adjust last month rounding
            if (month === tenureMonths) {
                principalComponent = remainingBalance;
                emiAmount = principalComponent + interestComponent;
            }

            interestComponent = Math.round(interestComponent * 100) / 100;
            principalComponent = Math.round(principalComponent * 100) / 100;

            remainingBalance -= principalComponent;
            if (remainingBalance < 0) remainingBalance = 0;

            schedule.push({
                month,
                principalComponent,
                interestComponent,
                remainingBalance: Math.round(remainingBalance * 100) / 100
            });
        }

        return schedule;
    }
}

export const riskEngineService = new RiskEngineService();
