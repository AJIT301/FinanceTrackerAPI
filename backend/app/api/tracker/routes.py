# backend/app/api/tracker/routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, extract
from typing import List, Optional
import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    QuickAddTemplate,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


def get_user_transaction(
    db: Session, transaction_id: int, user_id: int
) -> Optional[Transaction]:
    """Get a transaction that belongs to the specified user"""
    return (
        db.query(Transaction)
        .filter(and_(Transaction.id == transaction_id, Transaction.user_id == user_id))
        .first()
    )


@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new transaction"""
    # Get the amount as float and apply sign based on transaction type
    amount_value = float(transaction.amount)
    if transaction.transaction_type == "expense" and amount_value > 0:
        amount_value = -amount_value
    elif transaction.transaction_type == "income" and amount_value < 0:
        amount_value = abs(amount_value)

    db_transaction = Transaction(
        amount=amount_value,
        description=transaction.description,
        category=transaction.category,
        date=transaction.date,
        transaction_type=transaction.transaction_type,
        location=transaction.location,
        notes=transaction.notes,
        is_recurring=transaction.is_recurring,
        user_id=current_user.id,  # type: ignore
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's transactions with optional filtering"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)  # type: ignore

    # Apply filters
    if category:
        query = query.filter(Transaction.category == category)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    # Order by date (most recent first) and apply pagination
    transactions = (
        query.order_by(desc(Transaction.date), desc(Transaction.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific transaction"""
    transaction = get_user_transaction(db, transaction_id, current_user.id)  # type: ignore
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a transaction"""
    db_transaction = get_user_transaction(db, transaction_id, current_user.id)  # type: ignore
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    # Update fields that are provided
    update_data = transaction_update.dict(exclude_unset=True)

    # Handle amount and transaction_type update
    if "amount" in update_data or "transaction_type" in update_data:
        # Get current values safely
        current_amount = getattr(db_transaction, "amount", 0.0)  # type: ignore
        current_type = getattr(db_transaction, "transaction_type", "expense")  # type: ignore

        # Get new values
        new_amount = update_data.get("amount", abs(float(current_amount)))
        new_type = update_data.get("transaction_type", current_type)

        # Apply correct sign
        amount_value = abs(float(new_amount))
        if new_type == "expense":
            amount_value = -amount_value

        update_data["amount"] = amount_value

    # Update the transaction
    for field, value in update_data.items():
        setattr(db_transaction, field, value)

    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a transaction"""
    db_transaction = get_user_transaction(db, transaction_id, current_user.id)  # type: ignore
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )

    db.delete(db_transaction)
    db.commit()

    return {"message": "Transaction deleted successfully"}


@router.get("/categories/list")
async def get_categories():
    """Get available categories for transactions"""
    return {
        "expense_categories": EXPENSE_CATEGORIES,
        "income_categories": INCOME_CATEGORIES,
    }


@router.get("/templates/quick-add")
async def get_quick_add_templates():
    """Get predefined templates for quick transaction entry"""
    templates = [
        {
            "name": "Coffee",
            "amount": 4.50,
            "category": "Food & Dining",
            "description": "Coffee",
            "transaction_type": "expense",
        },
        {
            "name": "Lunch",
            "amount": 12.00,
            "category": "Food & Dining",
            "description": "Lunch",
            "transaction_type": "expense",
        },
        {
            "name": "Gas",
            "amount": 40.00,
            "category": "Transportation",
            "description": "Gas fill-up",
            "transaction_type": "expense",
        },
        {
            "name": "Groceries",
            "amount": 75.00,
            "category": "Groceries",
            "description": "Grocery shopping",
            "transaction_type": "expense",
        },
        {
            "name": "Salary",
            "amount": 3000.00,
            "category": "Salary",
            "description": "Monthly salary",
            "transaction_type": "income",
        },
    ]
    return templates


@router.post("/quick-add")
async def quick_add_transaction(
    template: QuickAddTemplate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quickly add a transaction using a template"""
    # Create transaction data with all required fields
    transaction_data = TransactionCreate(
        amount=template.amount,
        description=template.description,
        category=template.category,
        transaction_type=template.transaction_type,
        location=None,  # ADD THIS
        notes=None,  # ADD THIS
        is_recurring=False,  # ADD THIS
        # All other fields will use their defaults from the schema
    )

    return await create_transaction(transaction_data, db, current_user)
