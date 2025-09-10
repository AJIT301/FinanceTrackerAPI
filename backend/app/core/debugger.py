import os
from typing import Any, Optional


class Debugger:
    """Centralized debug utility with levels and categories"""

    LEVELS = {1: "ERROR", 2: "WARNING", 3: "INFO", 4: "DEBUG"}

    def __init__(self):
        self._debug_enabled = os.getenv("_DEBUG", "False").lower() in (
            "true",
            "1",
            "yes",
            "on",
        )
        self._debug_level = int(os.getenv("_DEBUG_LEVEL", 4))
        if self._debug_enabled:
            self.print("Debug mode ENABLED", level=4)

    @property
    def is_enabled(self) -> bool:
        return self._debug_enabled

    def print(self, *args, level: int = 3, category: Optional[str] = None, **kwargs):
        if not self._debug_enabled or level > self._debug_level:
            return
        prefix = f"[DEBUG L{level}]"
        if category:
            prefix += f" [{category}]"
        print(prefix, *args, **kwargs)

    def cors_config(self, origins: Any, level: int = 3):
        self.print(f"CORS allowed origins: {origins}", level=level, category="cors")
        self.print(f"CORS origins type: {type(origins)}", level=level, category="cors")
        if isinstance(origins, list):
            self.print(
                f"CORS origins count: {len(origins)}", level=level, category="cors"
            )
            for i, origin in enumerate(origins):
                self.print(f"  [{i}]: '{origin}'", level=level, category="cors")

    def validator_input(self, field_name: str, value: Any, level: int = 3):
        self.print(
            f"Validator input '{field_name}': {value} (type: {type(value)})",
            level=level,
            category="validator",
        )

    def validator_result(
        self, field_name: str, result: Any, method: str = "", level: int = 3
    ):
        method_text = f" via {method}" if method else ""
        self.print(
            f"Validator result '{field_name}'{method_text}: {result}",
            level=level,
            category="validator",
        )

    def validator_error(
        self,
        field_name: str,
        error: Exception | None = None,
        fallback: Any = None,
        level: int = 1,
    ):
        if error:
            self.print(
                f"Validator error '{field_name}': {error}",
                level=level,
                category="validator",
            )
        if fallback is not None:
            self.print(
                f"Using fallback '{fallback}' for '{field_name}'",
                level=level,
                category="validator",
            )

    def json_parsing(
        self,
        original: str,
        converted: str,
        success: bool,
        result: Any = None,
        error: Exception | None = None,
        level: int = 4,
    ):
        self.print(f"JSON parsing attempt:", level=level, category="json")
        self.print(f"  Original: {original}", level=level, category="json")
        self.print(f"  Converted: {converted}", level=level, category="json")
        if success and result is not None:
            self.print(f"  Success: {result}", level=level, category="json")
        elif error:
            self.print(f"  Failed: {error}", level=level, category="json")

    def settings_loaded(self, settings_instance: Any, level: int = 3):
        self.print("Settings loaded successfully", level=level, category="settings")
        if hasattr(settings_instance, "ALLOWED_ORIGINS"):
            self.print(
                f"ALLOWED_ORIGINS: {settings_instance.ALLOWED_ORIGINS}",
                level=level,
                category="settings",
            )


# Global debugger instance
debugger = Debugger()
