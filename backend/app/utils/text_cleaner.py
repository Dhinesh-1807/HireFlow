import re
from typing import List, Dict, Any


def clean_text(text: str) -> str:
    """Normalize whitespace and remove non-printable characters."""
    if not text:
        return ""
    # Normalize multiple newlines and carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace weird unicode spaces or tabs
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def find_quote_page(quote: str, pages_data: List[Dict[str, Any]]) -> int:
    """
    Find which page contains the given quote/snippet.
    Returns 1-based page number, or 1 if not found.
    """
    if not quote or not pages_data:
        return 1
    
    clean_q = re.sub(r"\s+", " ", quote.strip().lower())
    for item in pages_data:
        p_num = item.get("page_number", 1)
        p_text = re.sub(r"\s+", " ", item.get("text", "").lower())
        if clean_q[:40] in p_text:
            return p_num

    return 1
