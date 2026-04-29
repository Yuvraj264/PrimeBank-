from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models import Transaction, DailyBalance, Account, InterestPreview, ConfigUpdate
from app.services.interest_service import InterestService

router = APIRouter()

@router.get("/interest/{user_id}", response_model=InterestPreview)
async def get_interest_preview(
    user_id: str, 
    strategy: str = Query("reduce_50", enum=["reduce_50", "exclude_recent"])
):
    """
    Returns a preview of the interest to be paid, including fraud analysis.
    """
    try:
        return await InterestService.get_interest_preview(user_id, strategy)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/run-interest")
async def run_quarterly_calculation(config: ConfigUpdate):
    """
    Manually triggers the quarterly interest calculation for all users.
    """
    accounts = await Account.find_all().to_list()
    results = []
    
    for account in accounts:
        result = await InterestService.apply_quarterly_interest(account.user_id, config.interest_strategy)
        results.append(result)
        
    return {"message": f"Processed interest for {len(accounts)} accounts", "results": results}

@router.get("/transactions/{user_id}", response_model=List[Transaction])
async def get_transactions(user_id: str):
    """
    Fetch all transactions for a specific user.
    """
    return await Transaction.find(Transaction.user_id == user_id).to_list()

@router.get("/daily-balance/{user_id}", response_model=List[DailyBalance])
async def get_daily_balances(user_id: str):
    """
    Fetch all daily balance snapshots for a specific user.
    """
    return await DailyBalance.find(DailyBalance.user_id == user_id).to_list()

# Helper endpoints for demonstration
@router.post("/accounts")
async def create_account(account: Account):
    await account.insert()
    return account

@router.post("/transactions")
async def create_transaction(transaction: Transaction):
    # Update account balance accordingly
    account = await Account.find_one(Account.user_id == transaction.user_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if transaction.type == "deposit":
        account.balance += transaction.amount
    else:
        account.balance -= transaction.amount
        
    await account.save()
    await transaction.insert()
    return transaction
