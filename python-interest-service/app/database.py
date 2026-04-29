import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from app.models import Account, Transaction, DailyBalance

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/primebank")

async def init_db():
    # Create Motor client
    client = AsyncIOMotorClient(MONGO_URI)
    
    # Initialize beanie with the Document class list
    await init_beanie(
        database=client.get_default_database(),
        document_models=[Account, Transaction, DailyBalance]
    )
    print(f"Connected to MongoDB: {MONGO_URI}")
