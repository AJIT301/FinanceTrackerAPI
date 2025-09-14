# sanitize_utils.py
from typing import Optional, Dict, Any
from sanitize_module import sanitize_input


def sanitize_field(
    value: str, field_name: str, context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Helper function to sanitize a single field with appropriate settings
    based on the field type.
    """
    if not value or not isinstance(value, str):
        return value

    # Ensure context is never None - provide empty dict as fallback
    safe_context = context or {}

    # Configure sanitization based on field type
    if field_name in ["full_name", "name", "title"]:
        # For names, allow unicode but be strict about special characters
        sanitized, score, matches = sanitize_input(
            value,
            allow_unicode=True,
            escape_html=False,
            remove_specials="strict",
            log_suspicious=True,
            context=safe_context,
        )
    elif field_name in ["email", "username"]:
        # For emails and usernames, be more permissive with special chars
        sanitized, score, matches = sanitize_input(
            value,
            allow_unicode=False,  # Email should be ASCII
            escape_html=False,
            remove_specials="balanced",
            log_suspicious=True,
            context=safe_context,
        )
    elif field_name == "password":
        # For passwords, minimal sanitization (just remove control chars)
        sanitized, score, matches = sanitize_input(
            value,
            allow_unicode=False,
            escape_html=False,
            remove_specials="none",  # Passwords need special chars
            log_suspicious=True,
            context=safe_context,
        )
    else:
        # Default sanitization for other fields
        sanitized, score, matches = sanitize_input(
            value,
            allow_unicode=True,
            escape_html=True,  # Escape HTML by default
            remove_specials="balanced",
            log_suspicious=True,
            context=safe_context,
        )

    # Optionally handle high scores (you might want to reject the request)
    if score > 5:  # Threshold for highly suspicious input
        # Log or take action for highly suspicious input
        pass

    return sanitized