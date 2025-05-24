# Legal Document QA System

A FastAPI application that extracts text from legal documents (PDFs, images) and answers questions using a local LLM.

## Features

- Extract text from PDFs and images
- Chunk text and build a FAISS vector index
- Answer user questions using a local LLM

## Directory Structure

```
legal_qna/
├── app.py            # FastAPI server
├── extractor.py      # Text extraction from PDF/Image
├── indexer.py        # Chunking & FAISS index
├── qa_engine.py      # Local LLM QA pipeline
├── requirements.txt  # Python dependencies
└── data/             # Stores chunks.json, index.faiss, uploaded docs
```

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Install Tesseract OCR (for image text extraction):

```bash
# MacOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download installer from https://github.com/UB-Mannheim/tesseract/wiki
```

## Running the Application

```bash
python -m uvicorn app:app --reload --port 8080
```

The application will be available at http://localhost:8080.

## API Endpoints

- `GET /`: Check if the API is running
- `POST /upload`: Upload and index a document (PDF, image, or text file)
- `POST /ask`: Ask a question about the uploaded document
- `GET /load-test-file`: Load a pre-defined test file for demonstration

## Usage Example

1. Load the sample test document:

```bash
curl http://localhost:8080/load-test-file
```

2. Ask a question about the document:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"question":"What is the retainer fee mentioned in the agreement?"}' http://localhost:8080/ask
```

## Future Improvements

- Use a model fine-tuned for question answering tasks
- Implement better chunking strategies
- Add support for more document formats
- Improve answer quality with better prompting
- Add a web UI for easier interaction