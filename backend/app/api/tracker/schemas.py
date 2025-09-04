# backend/app/api/tracker/schemas.py
from pydantic import BaseModel
from datetime import date

class TransactionCreate(BaseModel):
    amount: float
    category: str
    date: date
    description: str | None = None