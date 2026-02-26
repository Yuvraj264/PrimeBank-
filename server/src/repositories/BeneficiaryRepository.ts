import { BaseRepository } from './BaseRepository';
import Beneficiary, { IBeneficiary } from '../models/Beneficiary';

export class BeneficiaryRepository extends BaseRepository<IBeneficiary> {
    constructor() {
        super(Beneficiary);
    }

    async findByUserIdSorted(userId: string): Promise<IBeneficiary[]> {
        return await this.model.find({ userId: userId as any }).sort({ createdAt: -1 });
    }

    async findOneByAccount(userId: string, accountNumber: string): Promise<IBeneficiary | null> {
        return await this.model.findOne({ userId: userId as any, accountNumber });
    }

    async findOneAndDelete(id: string, userId: string): Promise<IBeneficiary | null> {
        return await this.model.findOneAndDelete({ _id: id, userId: userId as any });
    }
}

export const beneficiaryRepository = new BeneficiaryRepository();
