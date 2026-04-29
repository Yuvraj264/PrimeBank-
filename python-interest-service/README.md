# Banking Interest Service

This service is a Python-based backend feature for quarterly interest calculation with fraud-aware logic, integrated with the existing PrimeBank infrastructure.

## Project Structure

The service is located in the `python-interest-service/` directory:

```
python-interest-service/
├── app/
│   ├── api/
│   │   └── routes.py         # API endpoints
│   ├── jobs/
│   │   └── scheduler.py      # Cron jobs (Daily/Quarterly)
│   ├── services/
│   │   ├── fraud_service.py  # Suspicious activity detection
│   │   └── interest_service.py # ADB and interest calculation
│   ├── database.py           # MongoDB initialization
│   ├── main.py               # FastAPI entry point
│   └── models.py             # Beanie/Pydantic models
├── seed_data.py              # Test data generation script
├── requirements.txt
└── .env
```

## Key Features Implemented

### 1. Interest Calculation with ADB
The system calculates interest based on the **Average Daily Balance (ADB)** over the last 90 days, fulfilling the requirement to mimic real banking behavior.

### 2. Fraud-Aware Logic (30% Rule)
Before calculating interest, the system checks the last 7 days of transactions. If any deposit exceeds **30% of the current balance**, it is flagged as suspicious.

### 3. Configurable Interest Adjustment
If a user is flagged for fraud, the system can:
- **Default**: Reduce final interest by **50%**.
- **Optional**: **Exclude** the suspicious deposit from the ADB calculation.

### 4. Automated & Manual Jobs
- **Daily Snapshots**: Captures balance snapshots every midnight.
- **Quarterly Job**: Runs every 3 months for automated payouts.
- **Manual Trigger**: `POST /api/v1/run-interest` allows immediate execution for auditing.

## How to Run

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Service**:
   ```bash
   python -m app.main
   ```

3. **Seed Test Data**:
   To see the fraud logic in action, run the seed script:
   ```bash
   python seed_data.py
   ```

## Verification Results

The `seed_data.py` script validates the following scenarios:

| User Type | Behavior | Status | Interest Strategy | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Steady Saver** | Normal saving | `Normal` | None | Full Interest Paid |
| **Exploiter** | 40% Large Deposit | `Suspicious` | `reduce_50` | 50% Penalty Applied |

> [!TIP]
> You can visit `http://localhost:8000/docs` once the server is running to interactive with the API via Swagger UI.
