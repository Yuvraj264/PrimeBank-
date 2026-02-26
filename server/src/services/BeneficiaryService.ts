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
        const beneficiary = await beneficiaryRepository.model.findOneAndDelete({ _id: id, userId: userId as any });
        if (!beneficiary) {
            throw new AppError('Beneficiary not found or you do not have permission', 404);
        }
    }

    async updateBeneficiary(id: string, userId: string, data: any): Promise<IBeneficiary> {
        const { nickname, isFavorite, dailyLimit } = data;

        const beneficiary = await beneficiaryRepository.model.findOneAndUpdate(
            { _id: id, userId: userId as any },
            {
                $set: {
                    ...(nickname !== undefined && { nickname }),
                    ...(isFavorite !== undefined && { isFavorite }),
                    ...(dailyLimit !== undefined && { dailyLimit })
                }
            },
            { new: true, runValidators: true }
        );

        if (!beneficiary) {
            throw new AppError('Beneficiary not found or you do not have permission', 404);
        }

        return beneficiary;
    }
}

export const beneficiaryService = new BeneficiaryService();
