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
        const accounts = await accountRepository.findByUserId(userId);
        const accountIds = accounts.map(acc => acc._id.toString());

        const card = await cardRepository.findOne({ _id: id } as any);

        if (!card) throw new AppError('Card not found', 404);
        if (!accountIds.includes(card.accountId.toString())) throw new AppError('You do not have permission to modify this card', 403);
        if (card.status === 'blocked') throw new AppError('Cannot freeze/unfreeze a permanently blocked card', 400);

        card.isFrozen = !card.isFrozen;
        card.status = card.isFrozen ? 'frozen' : 'active';
        await cardRepository.updateById(card._id as any, { isFrozen: card.isFrozen, status: card.status } as any);

        return card;
    }

    async updateCardLimits(id: string, userId: string, limits: any): Promise<ICard> {
        const accounts = await accountRepository.findByUserId(userId);
        const accountIds = accounts.map(acc => acc._id.toString());

        const card = await cardRepository.findOne({ _id: id } as any);
        if (!card) throw new AppError('Card not found', 404);
        if (!accountIds.includes(card.accountId.toString())) throw new AppError('You do not have permission to modify this card', 403);
        if (card.status === 'blocked') throw new AppError('Cannot update limits on a blocked card', 400);

        const { dailyLimit, onlineLimit, atmLimit, internationalEnabled } = limits;

        if (dailyLimit !== undefined) card.dailyLimit = dailyLimit;
        if (onlineLimit !== undefined) card.onlineLimit = onlineLimit;
        if (atmLimit !== undefined) card.atmLimit = atmLimit;
        if (internationalEnabled !== undefined) card.internationalEnabled = internationalEnabled;

        await cardRepository.updateById(card._id as any, {
            dailyLimit: card.dailyLimit,
            onlineLimit: card.onlineLimit,
            atmLimit: card.atmLimit,
            internationalEnabled: card.internationalEnabled
        } as any);

        return card;
    }

    async createVirtualCard(userId: string, accountId: string, userName: string): Promise<ICard> {
        const account = await accountRepository.findByIdAndUserId(accountId, userId);
        if (!account) throw new AppError('Account not found or does not belong to user', 404);

        const today = new Date();
        const year = today.getFullYear() + 3; // Virtual cards usually have shorter expiry
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const expiryDate = `${month}/${year.toString().slice(-2)}`;

        // Generate mock virtual PAN
        let virtualPAN = '4'; // Visa
        for (let i = 0; i < 15; i++) {
            virtualPAN += Math.floor(Math.random() * 10).toString();
        }
        const cvv = String(Math.floor(100 + Math.random() * 900));

        // Note: CardSchema handles encryption of cardNumber and cvv natively in the model definition via custom setters
        return await cardRepository.create({
            userId: userId as any,
            accountId: account._id as any,
            cardNumber: virtualPAN,
            cardHolder: userName.toUpperCase(),
            expiry: expiryDate,
            expiryDate: expiryDate,
            cvv,
            type: 'visa',
            cardType: 'debit',
            status: 'active',
            isFrozen: false
        });
    }

    async reportLostCard(id: string, userId: string): Promise<ICard> {
        const accounts = await accountRepository.findByUserId(userId);
        const accountIds = accounts.map(acc => acc._id.toString());

        const card = await cardRepository.findOne({ _id: id } as any);
        if (!card) throw new AppError('Card not found', 404);
        if (!accountIds.includes(card.accountId.toString())) throw new AppError('You do not have permission to modify this card', 403);
        if (card.status === 'blocked') throw new AppError('Card is already permanently blocked', 400);

        card.status = 'blocked';
        card.isFrozen = true;

        await cardRepository.updateById(card._id as any, { status: card.status, isFrozen: card.isFrozen } as any);

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
