# security_middleware.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from .sanitize_module import sanitize_input


class SanitizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Sanitize query parameters
        if request.query_params:
            sanitized_query_params = {}
            for key, value in request.query_params.items():
                context = {"source": "query_param", "param_name": key}
                sanitized_value, score, matches = sanitize_input(
                    value,
                    allow_unicode=True,
                    escape_html=True,
                    remove_specials="balanced",
                    log_suspicious=True,
                    context=context,
                )
                sanitized_query_params[key] = sanitized_value

            # Replace query params with sanitized versions
            request.scope["query_string"] = "&".join(
                [f"{k}={v}" for k, v in sanitized_query_params.items()]
            ).encode()

        # For form data, we'll rely on the Pydantic validation
        # For JSON bodies, we'll rely on the Pydantic validation

        response = await call_next(request)
        return response
