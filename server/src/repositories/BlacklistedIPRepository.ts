import { BaseRepository } from './BaseRepository';
import BlacklistedIP, { IBlacklistedIP } from '../models/BlacklistedIP';

export class BlacklistedIPRepository extends BaseRepository<IBlacklistedIP> {
    constructor() {
        super(BlacklistedIP);
    }
}

export const blacklistedIPRepository = new BlacklistedIPRepository();
