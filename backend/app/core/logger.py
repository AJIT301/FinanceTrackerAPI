import logging

# Create a logger
logger = logging.getLogger("backend_logger")
logger.setLevel(logging.INFO)

# Console handler
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)

# Formatter (customize as needed)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
ch.setFormatter(formatter)

logger.addHandler(ch)

# Optional: add file handler
# fh = logging.FileHandler("logs/app.log")
# fh.setLevel(logging.INFO)
# fh.setFormatter(formatter)
# logger.addHandler(fh)