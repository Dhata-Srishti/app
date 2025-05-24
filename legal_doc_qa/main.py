import os
import logging
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import PyPDF2
import docx
from transformers import pipeline, AutoTokenizer, AutoModelForQuestionAnswering
import torch
import re
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class LegalDocumentQA:
    def __init__(self):
        self.documents = {}
        self.qa_pipeline = None
        self.tokenizer = None
        self.model = None
        self.initialize_model()
    
    def initialize_model(self):
        """Initialize the question-answering model"""
        try:
            model_name = "distilbert-base-cased-distilled-squad"
            logger.info(f"Loading model: {model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForQuestionAnswering.from_pretrained(model_name)
            self.qa_pipeline = pipeline(
                "question-answering",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            # Fallback to a simpler approach if model loading fails
            self.qa_pipeline = None
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            return ""
    
    def extract_text_from_txt(self, file_path):
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error extracting text from TXT: {e}")
            return ""
    
    def extract_text(self, file_path, file_extension):
        """Extract text based on file extension"""
        if file_extension.lower() == 'pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension.lower() in ['docx', 'doc']:
            return self.extract_text_from_docx(file_path)
        elif file_extension.lower() == 'txt':
            return self.extract_text_from_txt(file_path)
        else:
            return ""
    
    def preprocess_text(self, text):
        """Clean and preprocess text"""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
    
    def chunk_text(self, text, max_length=512):
        """Split text into chunks for processing"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= max_length:
                current_chunk.append(word)
                current_length += len(word) + 1
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def answer_question(self, question, document_id):
        """Answer a question based on the document content"""
        if document_id not in self.documents:
            return {"error": "Document not found"}
        
        document_text = self.documents[document_id]['content']
        
        if not self.qa_pipeline:
            # Fallback: simple keyword search
            return self.simple_search(question, document_text)
        
        try:
            # Split document into chunks if it's too long
            chunks = self.chunk_text(document_text, max_length=512)
            best_answer = None
            best_score = 0
            
            for chunk in chunks:
                if len(chunk.strip()) < 10:  # Skip very short chunks
                    continue
                
                result = self.qa_pipeline(question=question, context=chunk)
                
                if result['score'] > best_score:
                    best_score = result['score']
                    best_answer = result
            
            if best_answer and best_score > 0.1:  # Confidence threshold
                return {
                    "answer": best_answer['answer'],
                    "confidence": best_score,
                    "start": best_answer.get('start', 0),
                    "end": best_answer.get('end', 0)
                }
            else:
                return self.simple_search(question, document_text)
                
        except Exception as e:
            logger.error(f"Error in question answering: {e}")
            return self.simple_search(question, document_text)
    
    def simple_search(self, question, text):
        """Simple keyword-based search as fallback"""
        question_words = question.lower().split()
        text_lower = text.lower()
        
        # Find sentences containing question keywords
        sentences = re.split(r'[.!?]+', text)
        relevant_sentences = []
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            score = sum(1 for word in question_words if word in sentence_lower)
            if score > 0:
                relevant_sentences.append((sentence.strip(), score))
        
        if relevant_sentences:
            # Sort by relevance score and return top result
            relevant_sentences.sort(key=lambda x: x[1], reverse=True)
            return {
                "answer": relevant_sentences[0][0],
                "confidence": 0.5,
                "method": "keyword_search"
            }
        else:
            return {
                "answer": "I couldn't find a relevant answer in the document.",
                "confidence": 0.0,
                "method": "no_match"
            }
    
    def add_document(self, file_path, filename):
        """Add a document to the system"""
        file_extension = filename.rsplit('.', 1)[1] if '.' in filename else ''
        text = self.extract_text(file_path, file_extension)
        
        if not text.strip():
            return None
        
        processed_text = self.preprocess_text(text)
        document_id = f"doc_{len(self.documents) + 1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.documents[document_id] = {
            'filename': filename,
            'content': processed_text,
            'upload_time': datetime.now().isoformat(),
            'word_count': len(processed_text.split())
        }
        
        return document_id

# Initialize the QA system
qa_system = LegalDocumentQA()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html', documents=qa_system.documents)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    if 'file' not in request.files:
        flash('No file selected')
        return redirect(request.url)
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process the document
        document_id = qa_system.add_document(file_path, filename)
        
        if document_id:
            flash(f'Document "{filename}" uploaded and processed successfully!')
            return jsonify({
                'success': True,
                'document_id': document_id,
                'filename': filename,
                'word_count': qa_system.documents[document_id]['word_count']
            })
        else:
            flash('Error processing the document. Please check the file format.')
            return jsonify({'success': False, 'error': 'Failed to process document'})
    else:
        flash('Invalid file type. Please upload PDF, DOCX, or TXT files.')
        return jsonify({'success': False, 'error': 'Invalid file type'})

@app.route('/ask', methods=['POST'])
def ask_question():
    """Handle question answering"""
    data = request.get_json()
    question = data.get('question', '').strip()
    document_id = data.get('document_id', '')
    
    if not question:
        return jsonify({'error': 'Question cannot be empty'})
    
    if not document_id or document_id not in qa_system.documents:
        return jsonify({'error': 'Please select a valid document'})
    
    # Get answer
    result = qa_system.answer_question(question, document_id)
    
    return jsonify(result)

@app.route('/documents')
def list_documents():
    """List all uploaded documents"""
    return jsonify(qa_system.documents)

@app.route('/document/<document_id>')
def get_document(document_id):
    """Get document details"""
    if document_id in qa_system.documents:
        return jsonify(qa_system.documents[document_id])
    else:
        return jsonify({'error': 'Document not found'}), 404

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': qa_system.qa_pipeline is not None,
        'documents_count': len(qa_system.documents)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
