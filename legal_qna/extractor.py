"""
Simple text extraction from PDF and image files
"""
import os

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    
    This is a simplified version that uses PyPDF2 if available,
    otherwise returns a placeholder message.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text
    """
    try:
        import PyPDF2
        
        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n\n"
        
        return text
    except ImportError:
        print("PyPDF2 not installed. Using placeholder text.")
        return """This is placeholder text because PyPDF2 is not installed.
        To install PyPDF2, run: pip install PyPDF2
        
        CONSULTING AGREEMENT
        
        This Consulting Agreement (the "Agreement") is made and entered into as of January 15, 2023,
        by and between ABC Consulting, Inc. and XYZ Corporation.
        
        1. SERVICES
        Consultant shall provide consulting services to Client.
        
        2. COMPENSATION
        Client shall pay Consultant a retainer fee of $5,000 per month for the Services.
        
        3. TERM AND TERMINATION
        This Agreement shall commence on the Effective Date and continue for 12 months.
        """
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return f"Error extracting text from PDF: {e}"

def extract_text_from_image(image_path):
    """
    Extract text from an image file.
    
    This is a simplified version that uses pytesseract if available,
    otherwise returns a placeholder message.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Extracted text
    """
    try:
        import pytesseract
from PIL import Image
        
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except ImportError:
        print("pytesseract not installed. Using placeholder text.")
        return """This is placeholder text because pytesseract is not installed.
        To install pytesseract, run: pip install pytesseract
        
        CONSULTING AGREEMENT
        
        This Consulting Agreement (the "Agreement") is made and entered into as of January 15, 2023,
        by and between ABC Consulting, Inc. and XYZ Corporation.
        
        1. SERVICES
        Consultant shall provide consulting services to Client.
        
        2. COMPENSATION
        Client shall pay Consultant a retainer fee of $5,000 per month for the Services.
        
        3. TERM AND TERMINATION
        This Agreement shall commence on the Effective Date and continue for 12 months.
        """
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return f"Error extracting text from image: {e}" 