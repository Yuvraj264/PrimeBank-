import logging
from datetime import datetime, timedelta
from app.models import Transaction, Account

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FraudService:
    @staticmethod
    async def detect_suspicious_activity(user_id: str) -> bool:
        """
        Check last 7 days of transactions for any deposit > 30% of current balance.
        """
        # Get current balance
        account = await Account.find_one(Account.user_id == user_id)
        if not account:
            return False
            
        current_balance = account.balance
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        # Fetch deposits in the last 7 days
        recent_deposits = await Transaction.find(
            Transaction.user_id == user_id,
            Transaction.type == "deposit",
            Transaction.date >= seven_days_ago
        ).to_list()
        
        is_suspicious = False
        threshold = current_balance * 0.30
        
        for deposit in recent_deposits:
            if deposit.amount > threshold:
                is_suspicious = True
                deposit.is_suspicious = True
                await deposit.save()
                
                logger.warning(
                    f"FRAUD ALERT: User {user_id} made a suspicious deposit of {deposit.amount} "
                    f"(Threshold: {threshold:.2f}, Balance: {current_balance})"
                )
        
        # Update account flag
        if is_suspicious:
            account.is_fraud_detected = True
            await account.save()
            
        return is_suspicious

    @staticmethod
    async def get_suspicious_deposits(user_id: str, days: int = 7) -> list:
        """
        Helper to return specific suspicious deposits.
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        return await Transaction.find(
            Transaction.user_id == user_id,
            Transaction.is_suspicious == True,
            Transaction.date >= cutoff
        ).to_list()
