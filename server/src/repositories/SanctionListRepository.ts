import { BaseRepository } from './BaseRepository';
import SanctionList, { ISanctionList } from '../models/SanctionList';

export class SanctionListRepository extends BaseRepository<ISanctionList> {
    constructor() {
        super(SanctionList);
    }

    async findByName(name: string): Promise<ISanctionList[]> {
        // Simple regex text search for names
        return await this.model.find({ name: { $regex: name, $options: 'i' } });
    }
}

export const sanctionListRepository = new SanctionListRepository();
