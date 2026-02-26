import { BaseRepository } from './BaseRepository';
import Account, { IAccount } from '../models/Account';

export class AccountRepository extends BaseRepository<IAccount> {
    constructor() {
        super(Account);
    }

    async findByUserId(userId: string): Promise<IAccount[]> {
        return await this.model.find({ userId: userId as any });
    }

    async findByIdAndUserId(id: string, userId: string): Promise<IAccount | null> {
        return await this.model.findOne({ _id: id, userId: userId as any });
    }
}

export const accountRepository = new AccountRepository();
