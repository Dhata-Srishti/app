# Legal Document Q&A Assistant

A powerful AI-powered web application that allows users to upload legal documents and ask questions to get instant, intelligent answers. Built with Flask and advanced NLP models.

## 🚀 Features

- **Document Upload**: Support for PDF, DOCX, and TXT files (up to 16MB)
- **AI-Powered Q&A**: Uses state-of-the-art transformer models for question answering
- **Multiple Document Support**: Upload and manage multiple documents
- **Intelligent Text Processing**: Automatic text extraction and preprocessing
- **Confidence Scoring**: Get confidence levels for each answer
- **Fallback Search**: Keyword-based search when AI models aren't available
- **Modern UI**: Beautiful, responsive web interface
- **Drag & Drop**: Easy file upload with drag and drop support

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **AI/ML**: Transformers (Hugging Face), PyTorch
- **Document Processing**: PyPDF2, python-docx
- **Frontend**: HTML5, CSS3, JavaScript
- **UI**: Font Awesome icons, responsive design

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- At least 2GB RAM (for AI models)

## 🔧 Installation

1. **Clone or download the project**
   ```bash
   cd legal_doc_qa
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📖 Usage

### 1. Upload Documents
- Click the upload area or drag and drop files
- Supported formats: PDF, DOCX, TXT
- Maximum file size: 16MB
- The system will automatically extract and process text

### 2. Ask Questions
- Select an uploaded document from the dropdown
- Type your question in the text area
- Click "Get Answer" to receive an AI-generated response
- View confidence scores and answer quality indicators

### 3. Manage Documents
- View all uploaded documents in the documents list
- See document metadata (word count, upload time)
- Select documents directly from the list

## 🎯 Example Questions

Here are some example questions you can ask about legal documents:

- "What are the key terms of this contract?"
- "What is the termination clause?"
- "Who are the parties involved in this agreement?"
- "What are the payment terms?"
- "What are the liability limitations?"
- "When does this contract expire?"
- "What are the confidentiality requirements?"

## 🔍 How It Works

1. **Document Processing**: 
   - Text is extracted from uploaded files
   - Content is cleaned and preprocessed
   - Documents are stored with metadata

2. **Question Answering**:
   - Uses DistilBERT model fine-tuned on SQuAD dataset
   - Text is chunked for optimal processing
   - Multiple chunks are analyzed for best answers
   - Confidence scores are calculated

3. **Fallback System**:
   - If AI models fail, keyword-based search is used
   - Ensures users always get some form of response

## 🚨 Important Notes

### First Run
- The first time you run the application, it will download the AI model (~250MB)
- This may take a few minutes depending on your internet connection
- Subsequent runs will be much faster

### Performance
- Processing time depends on document size and question complexity
- Larger documents are automatically chunked for better performance
- GPU acceleration is used if available

### Security
- Documents are stored locally on your machine
- No data is sent to external services (except for model downloads)
- Uploaded files are stored in the `uploads/` directory

## 🔧 Configuration

You can modify these settings in `main.py`:

```python
# File upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

# Model settings
model_name = "distilbert-base-cased-distilled-squad"
```

## 🐛 Troubleshooting

### Common Issues

1. **Model Download Fails**
   - Check your internet connection
   - Try running again (downloads resume automatically)

2. **PDF Text Extraction Issues**
   - Some PDFs may have text as images (not supported)
   - Try converting to text format first

3. **Memory Issues**
   - Close other applications to free up RAM
   - Try smaller documents
   - Restart the application

4. **Port Already in Use**
   - Change the port in `main.py`: `app.run(port=5001)`

### Error Messages

- **"Document not found"**: Select a document before asking questions
- **"Question cannot be empty"**: Enter a question in the text area
- **"Invalid file type"**: Only PDF, DOCX, and TXT files are supported

## 📊 API Endpoints

The application provides these REST API endpoints:

- `GET /` - Main application page
- `POST /upload` - Upload a document
- `POST /ask` - Ask a question about a document
- `GET /documents` - List all uploaded documents
- `GET /document/<id>` - Get specific document details
- `GET /health` - Health check endpoint

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving documentation
- Submitting pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Hugging Face for the transformer models
- Flask team for the web framework
- PyPDF2 and python-docx for document processing
- Font Awesome for icons

---

**Note**: This application is designed for educational and research purposes. For production use in legal environments, additional security and compliance measures should be implemented.
