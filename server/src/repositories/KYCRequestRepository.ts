import { BaseRepository } from './BaseRepository';
import KYCRequest, { IKYCRequest } from '../models/KYCRequest';

export class KYCRequestRepository extends BaseRepository<IKYCRequest> {
    constructor() {
        super(KYCRequest);
    }
}

export const kycRequestRepository = new KYCRequestRepository();
