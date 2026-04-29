from datetime import datetime, timedelta
from typing import List
from app.models import Account, DailyBalance, Transaction, InterestPreview
from app.services.fraud_service import FraudService

class InterestService:
    @staticmethod
    async def calculate_average_daily_balance(user_id: str, days: int = 90) -> float:
        """
        Calculate the Average Daily Balance for the specified period.
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        balances = await DailyBalance.find(
            DailyBalance.user_id == user_id,
            DailyBalance.date >= cutoff
        ).to_list()
        
        if not balances:
            # If no history, use current balance
            account = await Account.find_one(Account.user_id == user_id)
            return account.balance if account else 0.0
            
        total_balance = sum(b.balance for b in balances)
        return total_balance / len(balances)

    @staticmethod
    async def get_interest_preview(user_id: str, strategy: str = "reduce_50") -> InterestPreview:
        """
        Generate a preview of the interest calculation.
        """
        account = await Account.find_one(Account.user_id == user_id)
        if not account:
            raise ValueError("Account not found")

        # 1. Run Fraud Detection
        is_suspicious = await FraudService.detect_suspicious_activity(user_id)
        
        # 2. Calculate ADB
        adb = await InterestService.calculate_average_daily_balance(user_id)
        
        # 3. Base Calculation
        # interest = (average_balance * annual_rate * 0.25) / 100
        interest_rate = account.annual_interest_rate
        base_interest = (adb * interest_rate * 0.25) / 100
        
        final_interest = base_interest
        adjustment_applied = "none"

        # 4. Apply Fraud Logic
        if is_suspicious:
            if strategy == "reduce_50":
                final_interest = base_interest * 0.5
                adjustment_applied = "50% reduction due to suspicious activity"
            elif strategy == "exclude_recent":
                # Implementation: Subtract average amount of suspicious deposits from ADB
                suspicious_deposits = await FraudService.get_suspicious_deposits(user_id)
                suspicious_total = sum(d.amount for d in suspicious_deposits)
                adjusted_adb = max(0, adb - (suspicious_total / 90)) # Crude simplification
                final_interest = (adjusted_adb * interest_rate * 0.25) / 100
                adjustment_applied = "excluded suspicious deposits from ADB"

        return InterestPreview(
            user_id=user_id,
            average_daily_balance=adb,
            calculated_interest=round(final_interest, 2),
            interest_rate=interest_rate,
            is_suspicious=is_suspicious,
            adjustment_applied=adjustment_applied
        )

    @staticmethod
    async def apply_quarterly_interest(user_id: str, strategy: str = "reduce_50"):
        """
        Calculate and add interest to the user's account.
        """
        preview = await InterestService.get_interest_preview(user_id, strategy)
        
        account = await Account.find_one(Account.user_id == user_id)
        account.balance += preview.calculated_interest
        account.last_interest_at = datetime.utcnow()
        await account.save()
        
        return preview
