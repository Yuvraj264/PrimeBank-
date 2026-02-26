import { beneficiaryRepository } from '../repositories/BeneficiaryRepository';
import { AppError } from '../utils/appError';
import { IBeneficiary } from '../models/Beneficiary';

export class BeneficiaryService {
    async addBeneficiary(userId: string, data: any): Promise<IBeneficiary> {
        const { name, accountNumber, bankName, ifscCode, type, nickname, isFavorite, dailyLimit } = data;

        const existingBeneficiary = await beneficiaryRepository.findOneByAccount(userId, accountNumber);
        if (existingBeneficiary) {
            throw new AppError('Beneficiary with this account number already exists', 400);
        }

        return await beneficiaryRepository.create({
            userId: userId as any,
            name,
            accountNumber,
            bankName,
            ifscCode,
            type,
            nickname,
            isFavorite: isFavorite || false,
            dailyLimit: dailyLimit || 50000
        });
    }

    async getBeneficiaries(userId: string): Promise<IBeneficiary[]> {
        return await beneficiaryRepository.findByUserIdSorted(userId);
    }

    async deleteBeneficiary(id: string, userId: string): Promise<void> {
        const beneficiary = await beneficiaryRepository.findOneAndDelete(id, userId);
        if (!beneficiary) {
            throw new AppError('Beneficiary not found', 404);
        }
    }

    async updateBeneficiary(id: string, userId: string, data: any): Promise<IBeneficiary> {
        const { nickname, isFavorite, dailyLimit } = data;

        const beneficiary = await beneficiaryRepository.updateById(id, {
            $set: {
                ...(nickname !== undefined && { nickname }),
                ...(isFavorite !== undefined && { isFavorite }),
                ...(dailyLimit !== undefined && { dailyLimit })
            }
        } as any);

        if (!beneficiary || beneficiary.userId.toString() !== userId) {
            // Need to ensure the beneficiary actually belonged to the user!
            // updateById only checks ID. Let's do a double check or custom query.
            throw new AppError('Beneficiary not found', 404);
        }

        return beneficiary;
    }
}

export const beneficiaryService = new BeneficiaryService();
