# backend/app/api/tracker/routes.py
from fastapi import APIRouter, Depends
from . import schemas

router = APIRouter()

@router.get("/transactions")
def get_transactions():
    return {"message": "Here will be the list of transactions"}

@router.post("/transactions")
def add_transaction(transaction: schemas.TransactionCreate):
    return {"message": "Transaction added", "data": transaction.dict()}