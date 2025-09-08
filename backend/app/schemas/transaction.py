# backend/app/schemas/transaction.py
from pydantic import BaseModel, Field, validator
import datetime
from typing import Optional, Literal
from decimal import Decimal


class TransactionBase(BaseModel):
    amount: Decimal = Field(
        ..., max_digits=10, decimal_places=2, description="Transaction amount"
    )
    description: Optional[str] = Field(None, max_length=255)
    category: str = Field(..., max_length=100)
    date: datetime.date = Field(default_factory=datetime.date.today)
    transaction_type: Literal["income", "expense"] = "expense"
    location: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None)
    is_recurring: bool = Field(False)

    @validator("amount")
    def validate_amount(cls, v):
        if v == 0:
            raise ValueError("Amount cannot be zero")
        return v

    @validator("description")
    def validate_description(cls, v):
        if v is not None:
            return v.strip()
        return v


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime.date] = None
    transaction_type: Optional[Literal["income", "expense"]] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None

    @validator("amount")
    def validate_amount(cls, v):
        if v is not None and v == 0:
            raise ValueError("Amount cannot be zero")
        return v


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# Quick add templates for common transactions
class QuickAddTemplate(BaseModel):
    name: str
    amount: Decimal = Field(..., max_digits=10, decimal_places=2) 
    category: str
    description: str
    transaction_type: Literal["income", "expense"] = "expense"


# Categories enum for better UX
EXPENSE_CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Personal Care",
    "Groceries",
    "Gas",
    "Other",
]

INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Refund",
    "Other Income",
]
