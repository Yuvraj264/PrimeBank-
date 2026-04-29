import asyncio
from datetime import datetime, timedelta
from app.database import init_db
from app.models import Account, Transaction, DailyBalance
from app.services.interest_service import InterestService

async def seed():
    # 1. Initialize DB
    await init_db()
    
    # Clean old data for fresh demo
    await Account.find_all().delete()
    await Transaction.find_all().delete()
    await DailyBalance.find_all().delete()
    
    print("Seeding test data...")
    
    # 2. Create Two Users
    # User 1: Steady saver (Normal behavior)
    user_steady = Account(
        user_id="user_steady_123",
        owner_name="Steady Saver",
        balance=10000.0,
        annual_interest_rate=4.5
    )
    await user_steady.insert()
    
    # User 2: Exploiter (Suspicious deposit)
    user_exploiter = Account(
        user_id="user_exploiter_456",
        owner_name="Interest Exploiter",
        balance=5000.0,
        annual_interest_rate=4.5
    )
    await user_exploiter.insert()
    
    # 3. Inject 90 days of daily balances
    # We'll simulate a steady balance for both
    for i in range(90):
        date = datetime.utcnow() - timedelta(days=i)
        
        # User 1: steady 10k
        await DailyBalance(user_id="user_steady_123", date=date, balance=10000.0).insert()
        
        # User 2: steady 5k
        await DailyBalance(user_id="user_exploiter_456", date=date, balance=5000.0).insert()
        
    # 4. Inject Transactions
    # User 1: Small deposit 60 days ago
    await Transaction(
        user_id="user_steady_123",
        type="deposit",
        amount=500.0,
        date=datetime.utcnow() - timedelta(days=60)
    ).insert()
    
    # User 2: SUSPICIOUS deposit 2 days ago (2k deposit on 5k balance is 40% > 30% threshold)
    suspicious_deposit = Transaction(
        user_id="user_exploiter_456",
        type="deposit",
        amount=2500.0,
        date=datetime.utcnow() - timedelta(days=2)
    )
    await suspicious_deposit.insert()
    
    # Update exploiter balance manually to reflect the deposit for ADB consistency
    user_exploiter.balance += 2500.0
    await user_exploiter.save()
    
    print("Seed complete.")
    
    # 5. Run Preview Test
    print("\n--- Interest Calculation Results ---")
    
    steady_preview = await InterestService.get_interest_preview("user_steady_123")
    print(f"User: {steady_preview.user_id}")
    print(f"ADB: {steady_preview.average_daily_balance}")
    print(f"Interest: {steady_preview.calculated_interest}")
    print(f"Suspicious: {steady_preview.is_suspicious}")
    print(f"Adjustment: {steady_preview.adjustment_applied}")
    
    print("\n")
    
    exploiter_preview = await InterestService.get_interest_preview("user_exploiter_456", strategy="reduce_50")
    print(f"User: {exploiter_preview.user_id}")
    print(f"ADB: {exploiter_preview.average_daily_balance}")
    print(f"Interest: {exploiter_preview.calculated_interest}")
    print(f"Suspicious: {exploiter_preview.is_suspicious}")
    print(f"Adjustment: {exploiter_preview.adjustment_applied}")

if __name__ == "__main__":
    asyncio.run(seed())
