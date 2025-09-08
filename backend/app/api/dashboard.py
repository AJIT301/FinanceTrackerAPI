# backend/app/api/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date
from typing import Dict, List

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get dashboard summary data for the current user"""

    # Current month calculations
    current_month = datetime.now().month
    current_year = datetime.now().year

    # Base query for current user's transactions
    base_query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    # Current month transactions
    current_month_query = base_query.filter(
        and_(
            extract("month", Transaction.date) == current_month,
            extract("year", Transaction.date) == current_year,
        )
    )

    # Calculate monthly totals
    monthly_income = (
        current_month_query.filter(Transaction.amount > 0)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
        or 0
    )

    monthly_expenses = abs(
        current_month_query.filter(Transaction.amount < 0)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
        or 0
    )

    monthly_balance = monthly_income - monthly_expenses

    # Overall totals (all time)
    total_income = (
        base_query.filter(Transaction.amount > 0)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
        or 0
    )

    total_expenses = abs(
        base_query.filter(Transaction.amount < 0)
        .with_entities(func.coalesce(func.sum(Transaction.amount), 0))
        .scalar()
        or 0
    )

    # Transaction count
    total_transactions = base_query.count()

    # Recent transactions (last 5)
    recent_transactions = (
        base_query.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
        .all()
    )

    # Category breakdown for current month (expenses only)
    category_spending = (
        current_month_query.filter(Transaction.amount < 0)
        .with_entities(
            Transaction.category, func.sum(func.abs(Transaction.amount)).label("total")
        )
        .group_by(Transaction.category)
        .order_by(func.sum(func.abs(Transaction.amount)).desc())
        .all()
    )

    return {
        "monthly_summary": {
            "income": round(monthly_income, 2),
            "expenses": round(monthly_expenses, 2),
            "balance": round(monthly_balance, 2),
            "month": current_month,
            "year": current_year,
        },
        "overall_summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "total_transactions": total_transactions,
        },
        "recent_transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "description": t.description,
                "category": t.category,
                "date": t.date.isoformat(),
                "transaction_type": t.transaction_type,
            }
            for t in recent_transactions
        ],
        "category_breakdown": [
            {"category": category, "amount": round(float(total), 2)}
            for category, total in category_spending
        ],
    }


@router.get("/monthly-trends")
async def get_monthly_trends(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get monthly income/expense trends for the last N months"""

    # Get monthly aggregates
    monthly_data = (
        db.query(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.coalesce(
                func.sum(
                    func.case([(Transaction.amount > 0, Transaction.amount)], else_=0)
                ),
                0,
            ).label("income"),
            func.coalesce(
                func.abs(
                    func.sum(
                        func.case(
                            [(Transaction.amount < 0, Transaction.amount)], else_=0
                        )
                    )
                ),
                0,
            ).label("expenses"),
        )
        .filter(Transaction.user_id == current_user.id)
        .group_by(extract("year", Transaction.date), extract("month", Transaction.date))
        .order_by(
            extract("year", Transaction.date).desc(),
            extract("month", Transaction.date).desc(),
        )
        .limit(months)
        .all()
    )

    return {
        "trends": [
            {
                "year": int(row.year),
                "month": int(row.month),
                "income": round(float(row.income), 2),
                "expenses": round(float(row.expenses), 2),
                "balance": round(float(row.income) - float(row.expenses), 2),
            }
            for row in reversed(monthly_data)
        ]
    }
