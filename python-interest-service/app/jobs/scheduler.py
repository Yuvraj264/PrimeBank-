from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from app.models import Account, DailyBalance
from app.services.interest_service import InterestService

scheduler = AsyncIOScheduler()

async def take_daily_snapshot():
    """
    Job to capture the daily balance for every account.
    """
    print(f"[{datetime.utcnow()}] Running daily balance snapshot...")
    accounts = await Account.find_all().to_list()
    for account in accounts:
        snapshot = DailyBalance(
            user_id=account.user_id,
            date=datetime.utcnow(),
            balance=account.balance
        )
        await snapshot.insert()
    print(f"Captured {len(accounts)} snapshots.")

async def run_quarterly_interest():
    """
    Job to calculate and apply interest every 3 months.
    """
    print(f"[{datetime.utcnow()}] Running quarterly interest calculation...")
    accounts = await Account.find_all().to_list()
    for account in accounts:
        # Default strategy: reduce_50
        await InterestService.apply_quarterly_interest(account.user_id, "reduce_50")
    print(f"Applied interest to {len(accounts)} accounts.")

def start_scheduler():
    # Schedule daily snapshot at midnight
    scheduler.add_job(take_daily_snapshot, 'cron', hour=0, minute=0)
    
    # Schedule quarterly interest (Jan, Apr, Jul, Oct)
    scheduler.add_job(run_quarterly_interest, 'cron', month='1,4,7,10', day=1, hour=0, minute=0)
    
    scheduler.start()
    print("Scheduler started.")
