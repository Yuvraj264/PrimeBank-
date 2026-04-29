import uvicorn
from fastapi import FastAPI
from app.api.routes import router
from app.database import init_db
from app.jobs.scheduler import start_scheduler

app = FastAPI(
    title="PrimeBank Interest Calculation Service",
    description="Python backend for quarterly interest calculation and fraud detection.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    # Initialize Database
    await init_db()
    
    # Start Scheduler
    start_scheduler()

# Include API Routes
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "service": "PrimeBank Interest Service",
        "status": "online",
        "endpoints": {
            "interest_preview": "/api/v1/interest/{user_id}",
            "run_interest": "/api/v1/run-interest",
            "transactions": "/api/v1/transactions/{user_id}",
            "daily_balances": "/api/v1/daily-balance/{user_id}"
        }
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
