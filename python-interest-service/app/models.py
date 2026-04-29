from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import BaseModel, Field

class Account(Document):
    user_id: Indexed(str, unique=True)
    owner_name: str
    balance: float = 0.0
    annual_interest_rate: float = 5.0  # Default 5%
    is_fraud_detected: bool = False
    last_interest_at: Optional[datetime] = None

    class Settings:
        name = "accounts"

class Transaction(Document):
    user_id: Indexed(str)
    type: str  # "deposit" or "withdraw"
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    is_suspicious: bool = False

    class Settings:
        name = "transactions"

class DailyBalance(Document):
    user_id: Indexed(str)
    date: datetime
    balance: float

    class Settings:
        name = "daily_balances"

# For API Responses
class InterestPreview(BaseModel):
    user_id: str
    average_daily_balance: float
    calculated_interest: float
    interest_rate: float
    is_suspicious: bool
    adjustment_applied: str

class ConfigUpdate(BaseModel):
    interest_strategy: str = "reduce_50"  # "reduce_50" or "exclude_recent"
