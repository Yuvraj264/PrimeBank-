import { cardRepository } from '../repositories/CardRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { AppError } from '../utils/appError';
import { ICard } from '../models/Card';

export class CardService {
    async createCard(userId: string, userName: string): Promise<ICard> {
        const existingCard = await cardRepository.findOne({
            userId: userId as any,
            status: { $in: ['active', 'frozen'] }
        } as any);

        if (existingCard) {
            throw new AppError('You already have an active card', 400);
        }

        const accounts = await accountRepository.findByUserId(userId);
        const account = accounts[0];
        if (!account) {
            throw new AppError('No eligible account found to link card', 404);
        }

        const today = new Date();
        const year = today.getFullYear() + 5;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const expiryDate = `${month}/${year.toString().slice(-2)}`;

        const cardNumber = account.accountNumber;
        const cvv = String(Math.floor(100 + Math.random() * 900));

        return await cardRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            cardNumber,
            cardHolder: userName.toUpperCase(),
            expiryDate,
            cvv,
            type: 'visa',
            status: 'active'
        });
    }

    async toggleCardFreeze(id: string, userId: string): Promise<ICard> {
        const card = await cardRepository.findOne({ _id: id, userId: userId as any } as any);

        if (!card) {
            throw new AppError('Card not found', 404);
        }

        card.status = card.status === 'active' ? 'frozen' : 'active';
        await cardRepository.updateById(card._id as any, { status: card.status } as any);

        return card;
    }

    async getMyCards(userId: string): Promise<ICard[]> {
        return await cardRepository.findByUserId(userId);
    }

    async getCardDetails(id: string, userId: string): Promise<ICard> {
        const card = await cardRepository.findOne({ _id: id, userId: userId as any } as any);

        if (!card) {
            throw new AppError('Card not found', 404);
        }

        return card;
    }
}

export const cardService = new CardService();
