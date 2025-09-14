from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re
from app.core.sanitize.sanitize_module import sanitize_input
from app.core.sanitize.sanitize_utils import sanitize_field

router = APIRouter(prefix="/auth", tags=["authentication"])


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str

    @validator("full_name")
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be empty")

        # Use your sanitizer with context about the field
        context = {"field": "full_name", "validator": "RegisterRequest"}
        sanitized_name = sanitize_field(v, "full_name", context)

        # Additional validation after sanitization
        if len(sanitized_name) < 2:
            raise ValueError("Full name must be at least 2 characters long")
        if len(sanitized_name) > 100:
            raise ValueError("Full name cannot exceed 100 characters")

        return sanitized_name

    @validator("email")
    def validate_email(cls, v):
        # Sanitize email
        context = {"field": "email", "validator": "RegisterRequest"}
        sanitized_email = sanitize_field(v, "email", context)

        # Additional email validation if needed
        if not re.match(
            r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", sanitized_email
        ):
            raise ValueError("Please enter a valid email address")

        return sanitized_email

    @validator("password")
    def validate_password(cls, v):
        # Sanitize password (minimal sanitization)
        context = {"field": "password", "validator": "RegisterRequest"}
        sanitized_password = sanitize_field(v, "password", context)

        # Password strength validation
        if len(sanitized_password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", sanitized_password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", sanitized_password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", sanitized_password):
            raise ValueError("Password must contain at least one number")

        # Check for common weak passwords
        weak_passwords = ["password", "12345678", "qwertyui", "letmein"]
        if sanitized_password.lower() in weak_passwords:
            raise ValueError("Password is too common")

        return sanitized_password

    @validator("confirm_password")
    def validate_confirm_password(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(register_data: RegisterRequest, request: Request):
    """
    Register a new user with validation and sanitization
    """
    try:
        # Add request context to logging
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")

        # Final sanitization with request context
        context = {
            "endpoint": "/auth/register",
            "client_ip": client_host,
            "user_agent": user_agent,
        }

        final_full_name = sanitize_field(register_data.full_name, "full_name", context)
        final_email = sanitize_field(register_data.email, "email", context)

        # Check if email already exists in database
        # if await email_exists(final_email):
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Email already registered"
        #     )

        # Hash the password before storing
        hashed_password = hash_password(register_data.password)

        # Store user in database
        # user_id = await create_user({
        #     "full_name": final_full_name,
        #     "email": final_email,
        #     "password": hashed_password
        # })

        # For now, we'll return a success message
        return {
            "message": "User registered successfully",
            "user": {"full_name": final_full_name, "email": final_email},
        }

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Helper functions (you'll need to implement these)
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Example with bcrypt:
    # import bcrypt
    # return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return f"hashed_{password}"  # Placeholder


async def email_exists(email: str) -> bool:
    """Check if email already exists in database"""
    # Implementation depends on your database
    return False


async def create_user(user_data: dict) -> int:
    """Create a new user in the database"""
    # Implementation depends on your database
    return 1  # Placeholder user ID
