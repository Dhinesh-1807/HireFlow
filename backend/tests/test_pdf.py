import os
import tempfile
import fitz
from app.services.pdf_service import pdf_service


def test_pdf_extraction():
    # Create temporary PDF file with sample text
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        doc = fitz.open()
        page1 = doc.new_page()
        page1.insert_text((50, 72), "Jane Doe\nSenior Backend Engineer\nSkills: Python, FastAPI, PostgreSQL, Docker\nExperience: 5 years at CloudScale Inc.")
        page2 = doc.new_page()
        page2.insert_text((50, 72), "Education: B.S. in Computer Science\nCertifications: AWS Certified Solutions Architect")
        doc.save(tmp_path)
        doc.close()

        # Extract using pdf_service
        result = pdf_service.extract_text_from_pdf(tmp_path)

        assert result["page_count"] == 2
        assert "Jane Doe" in result["full_text"]
        assert "FastAPI" in result["full_text"]
        assert "AWS Certified Solutions Architect" in result["full_text"]
        assert len(result["pages_data"]) == 2
        assert result["pages_data"][0]["page_number"] == 1
        assert result["pages_data"][1]["page_number"] == 2
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
