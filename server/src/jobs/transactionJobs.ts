import mongoose from 'mongoose';
import { transactionRepository } from '../repositories/TransactionRepository';
import { accountRepository } from '../repositories/AccountRepository';
import { notificationRepository } from '../repositories/NotificationRepository';

export const processScheduledTransfers = async () => {
    console.log('[Worker] Checking for pending scheduled transactions...');
    try {
        const now = new Date();
        const pendingTransactions = await transactionRepository.model.find({
            status: 'pending',
            scheduledDate: { $lte: now }
        });

        if (pendingTransactions.length === 0) {
            return;
        }

        console.log(`[Worker] Found ${pendingTransactions.length} pending transaction(s) to process.`);

        for (const tx of pendingTransactions) {
            if (tx.type === 'transfer') {
                const session = await mongoose.startSession();
                session.startTransaction();

                try {
                    const senderAccount = await accountRepository.model.findById(tx.accountId).session(session);
                    if (!senderAccount) throw new Error('Sender account missing');

                    const transferAmount = Math.abs(tx.amount);
                    if (senderAccount.balance < transferAmount) {
                        throw new Error('Insufficient balance');
                    }

                    const today = new Date();
                    const lastReset = new Date(senderAccount.lastLimitResetDate || 0);
                    if (today.toDateString() !== lastReset.toDateString()) {
                        senderAccount.usedLimit = 0;
                        senderAccount.lastLimitResetDate = today;
                    }

                    const usedLimit = senderAccount.usedLimit || 0;
                    const dailyLimit = senderAccount.dailyLimit || 50000;
                    if (usedLimit + transferAmount > dailyLimit) {
                        throw new Error('Daily limit exceeded');
                    }

                    senderAccount.balance -= transferAmount;
                    senderAccount.usedLimit = (senderAccount.usedLimit || 0) + transferAmount;
                    await senderAccount.save({ session });

                    if (tx.receiverAccountId) {
                        const receiverAccount = await accountRepository.model.findOne({ accountNumber: tx.receiverAccountId }).session(session);
                        if (receiverAccount) {
                            receiverAccount.balance += transferAmount;
                            await receiverAccount.save({ session });

                            await transactionRepository.model.create([{
                                userId: receiverAccount.userId as any,
                                accountId: receiverAccount._id as any,
                                type: 'transfer',
                                amount: transferAmount,
                                currency: receiverAccount.currency,
                                status: 'completed',
                                senderName: 'Scheduled Transfer Sender',
                                description: `Received Scheduled Transfer`,
                                category: 'income'
                            }], { session });

                            await notificationRepository.model.create([{
                                userId: receiverAccount.userId as any,
                                type: 'transaction_alert',
                                message: `You received a scheduled transfer of ${transferAmount} ${receiverAccount.currency}.`
                            }], { session });
                        }
                    }

                    tx.status = 'completed';
                    await tx.save({ session });

                    await notificationRepository.model.create([{
                        userId: tx.userId as any,
                        type: 'transaction_alert',
                        message: `Your scheduled transfer of ${transferAmount} ${senderAccount.currency} to ${tx.receiverAccountId || 'external account'} was completed successfully.`
                    }], { session });

                    await session.commitTransaction();
                    session.endSession();
                    console.log(`[Worker] Processed scheduled transaction ${tx._id} successfully.`);
                } catch (error: any) {
                    await session.abortTransaction();
                    session.endSession();
                    console.error(`[Worker] Failed to process transaction ${tx._id}: ${error.message}`);

                    tx.status = 'failed';
                    await tx.save();

                    await notificationRepository.model.create([{
                        userId: tx.userId as any,
                        type: 'transaction_alert',
                        message: `Your scheduled transfer to ${tx.receiverAccountId || 'external account'} failed. Reason: ${error.message}`
                    }]);
                }
            }
        }
    } catch (error) {
        console.error('[Worker] Error during scheduled jobs run:', error);
    }
};
