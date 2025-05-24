"""
Legal Document Q&A System - Simplified Flask Implementation
"""
import os
import json
import tempfile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from qa_engine import generate_answer
from extractor import extract_text_from_pdf, extract_text_from_image
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes - this is important for mobile/web access
CORS(app, origins=["*"])

# Create data directory if it doesn't exist
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)

# Path to store chunks.json
CHUNKS_PATH = os.path.join(DATA_DIR, 'chunks.json')

# Global state
chunks = []
index = None
model = None

def reset_index():
    """Reset the global state"""
    global chunks, index, model
    chunks = []
    index = None
    model = None

def save_chunks():
    """Save chunks to disk"""
    global chunks
    with open(CHUNKS_PATH, 'w') as f:
        json.dump(chunks, f)

def load_chunks():
    """Load chunks from disk if they exist"""
    global chunks
    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, 'r') as f:
            chunks = json.load(f)
    return chunks

def extract_text_from_file(file_path):
    """Extract text from a file based on its extension"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.pdf']:
        return extract_text_from_pdf(file_path)
    elif ext in ['.jpg', '.jpeg', '.png']:
        return extract_text_from_image(file_path)
    elif ext in ['.txt']:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return ""

def process_document(file_path):
    """Process a document and create chunks"""
    global chunks, index, model
    
    # Extract text from the document
    text = extract_text_from_file(file_path)
    
    # Split text into chunks (simple implementation)
    chunk_size = 1000
    overlap = 200
    chunks = []
    
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        if chunk:
            chunks.append(chunk)
    
    # Save chunks
    save_chunks()
    
    # Generate vector index
    # Here we're just storing the chunks, not creating a real vector index
    index = chunks
    
    return len(chunks)

@app.route('/')
def index_route():
    """Home page"""
    return jsonify({"message": "Legal QnA API is running"})

@app.route('/upload', methods=['POST'])
def upload_document():
    """Upload and process a document"""
    try:
        # Print request info for debugging
        print("=== Upload Request ===")
        print(f"Headers: {request.headers}")
        print(f"Files: {request.files}")
        
        # Check if a file was uploaded
        if 'file' not in request.files:
            print("No file part in request")
            return jsonify({"detail": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("No selected filename")
            return jsonify({"detail": "No selected file"}), 400
        
        print(f"Processing file: {file.filename}")
        
        # Save the file temporarily
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(file_path)
        
        # Process the document
        chunks_indexed = process_document(file_path)
        
        # Clean up
        os.unlink(file_path)
        os.rmdir(temp_dir)
        
        print(f"Successfully indexed {chunks_indexed} chunks")
        return jsonify({"chunks_indexed": chunks_indexed})
    except Exception as e:
        print(f"Error in upload: {str(e)}")
        return jsonify({"detail": str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Answer a question about the uploaded document"""
    try:
        # Load chunks if they're not already loaded
        global chunks
        if not chunks:
            chunks = load_chunks()
        
        # Get the question from the request
        data = request.json
        if not data or 'question' not in data:
            return jsonify({"detail": "No question provided"}), 400
        
        question = data['question']
        
        # Generate an answer
        if not chunks:
            return jsonify({
                "answer": "Please upload a document first.",
                "context": []
            })

        # Simple implementation: just return the chunks that contain the question words
        context = []
        for chunk in chunks:
            if any(word.lower() in chunk.lower() for word in question.split()):
                context.append(chunk)
        
        # Generate a simple answer (in a real implementation, this would use an LLM)
        answer = generate_answer(question, context)
        
        return jsonify({
            "answer": answer,
            "context": context[:3]  # Limit to 3 context chunks
        })
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

@app.route('/load-test-file', methods=['GET'])
def load_test_file():
    """Load a test document"""
    try:
        # Path to a test document
        test_file = os.path.join(DATA_DIR, 'test_document.txt')
        
        # Create a test document if it doesn't exist
        if not os.path.exists(test_file):
            with open(test_file, 'w') as f:
                f.write("""
                CONSULTING AGREEMENT

                This Consulting Agreement (the "Agreement") is made and entered into as of January 15, 2023 (the "Effective Date"),
                by and between ABC Consulting, Inc., a Delaware corporation with offices at 123 Main Street, Anytown, USA ("Consultant"),
                and XYZ Corporation, a California corporation with offices at 456 Business Avenue, Somewhere, USA ("Client").

                1. SERVICES
                Consultant shall provide the following services to Client (the "Services"):
                - Strategic business planning and market analysis
                - Financial modeling and forecasting
                - Operational efficiency recommendations
                - Project management and implementation support

                2. COMPENSATION
                Client shall pay Consultant a retainer fee of $5,000 per month for the Services. Additional services beyond the scope
                of this Agreement shall be billed at Consultant's standard rate of $150 per hour. Consultant shall invoice Client monthly,
                and payment shall be due within 30 days of invoice date.

                3. TERM AND TERMINATION
                This Agreement shall commence on the Effective Date and continue for an initial term of 12 months. Thereafter, this
                Agreement shall automatically renew for successive one-month periods unless either party provides written notice of
                non-renewal at least 30 days prior to the end of the then-current term.

                4. CONFIDENTIALITY
                Consultant acknowledges that during the engagement, Consultant will have access to confidential information of Client.
                Consultant agrees to maintain the confidentiality of all such information and not to disclose it to any third party
                without Client's express written consent.

                5. INTELLECTUAL PROPERTY
                All materials, documents, reports, and deliverables created by Consultant for Client under this Agreement shall be the
                sole property of Client. Consultant hereby assigns all right, title, and interest in such materials to Client.

                IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

                ABC Consulting, Inc.
                By: [Signature]
                Name: John Smith
                Title: CEO

                XYZ Corporation
                By: [Signature]
                Name: Jane Doe
                Title: COO
                """)
        
        # Process the test document
        chunks_indexed = process_document(test_file)
        
        return jsonify({"chunks_indexed": chunks_indexed})
    except Exception as e:
        return jsonify({"detail": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)