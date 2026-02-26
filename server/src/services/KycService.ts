import { kycRequestRepository } from '../repositories/KYCRequestRepository';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/appError';
import { IKYCRequest } from '../models/KYCRequest';

export class KycService {
    async submitKYC(userId: string, data: any): Promise<IKYCRequest> {
        const { documentType, documentNumber, documentUrl } = data;

        const existingRequest = await kycRequestRepository.findOne({ userId: userId as any, status: 'pending' });
        if (existingRequest) {
            throw new AppError('You already have a pending KYC request', 400);
        }

        const kycRequest = await kycRequestRepository.create({
            userId: userId as any,
            documentType,
            documentNumber,
            documentUrl
        });

        await userRepository.updateById(userId, { status: 'pending' as any } as any);

        return kycRequest;
    }

    async getAllKYCRequests(): Promise<IKYCRequest[]> {
        return await kycRequestRepository.model.find().populate('userId', 'name email').sort({ submittedAt: -1 });
    }

    async getPendingKYCRequests(): Promise<IKYCRequest[]> {
        return await kycRequestRepository.model.find({ status: 'pending' }).populate('userId', 'name email').sort({ submittedAt: 1 });
    }

    async updateKYCStatus(id: string, reviewerId: string, status: string, adminComment?: string): Promise<IKYCRequest> {
        if (!['approved', 'rejected'].includes(status)) {
            throw new AppError('Invalid status', 400);
        }

        const kycRequest = await kycRequestRepository.findById(id);
        if (!kycRequest) {
            throw new AppError('KYC Request not found', 404);
        }

        kycRequest.status = status as any;
        kycRequest.adminComment = adminComment;
        kycRequest.reviewedAt = new Date();
        kycRequest.reviewedBy = reviewerId as any;
        await kycRequestRepository.updateById(id, {
            status: kycRequest.status,
            adminComment: kycRequest.adminComment,
            reviewedAt: kycRequest.reviewedAt,
            reviewedBy: kycRequest.reviewedBy
        } as any);

        if (status === 'approved') {
            await userRepository.updateById(kycRequest.userId as any, {
                status: 'active',
                'identityDetails.verified': true
            } as any);
        } else if (status === 'rejected') {
            await userRepository.updateById(kycRequest.userId as any, { status: 'blocked' } as any);
        }

        return kycRequest;
    }
}

export const kycService = new KycService();
