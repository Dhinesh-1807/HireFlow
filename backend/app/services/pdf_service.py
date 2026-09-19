import os
import fitz  # PyMuPDF
from typing import Dict, Any, List
from app.utils.text_cleaner import clean_text


class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
        """
        Extract full text and page-by-page structured data using PyMuPDF.
        Tracks page numbers for accurate evidence citation.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")

        doc = fitz.open(file_path)
        pages_data: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        try:
            for page_index in range(len(doc)):
                page = doc[page_index]
                page_num = page_index + 1
                page_raw_text = page.get_text("text")
                cleaned_page_text = clean_text(page_raw_text)

                pages_data.append({
                    "page_number": page_num,
                    "text": cleaned_page_text,
                })
                full_text_parts.append(cleaned_page_text)

            full_text = "\n\n".join(full_text_parts)

            return {
                "full_text": full_text,
                "page_count": len(doc),
                "pages_data": pages_data,
            }
        finally:
            doc.close()


pdf_service = PDFService()
