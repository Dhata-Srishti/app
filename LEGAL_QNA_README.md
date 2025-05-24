# Legal Document QnA Integration Guide

This document explains how to set up and use the Legal Document QnA feature in the app. This feature allows users to upload legal documents (PDFs, images, or text files) and ask questions about them.

## Overview

The Legal Document QnA feature consists of:

1. A Flask backend service (`legal_qna`) that processes documents and answers questions
2. A frontend interface in the app (`doc.tsx`) to interact with the service

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install

# Install legal_qna dependencies
npm run legal-qna:install
```

### 2. Configure the Network Connection

For the frontend to communicate with the legal_qna service:

1. If you're testing on the web or iOS simulator, the default configuration should work.
2. If you're testing on a real device, you need to modify the `baseUrl` in `app/(tabs)/doc.tsx`:

```typescript
// Open app/(tabs)/doc.tsx and find this section:
constructor() {
  // For development testing on localhost
  this.baseUrl = 'http://localhost:8080';
  
  // Replace with your computer's actual IP address if using a real device
  // this.baseUrl = 'http://192.168.24.167:8080';
}
```

Replace `192.168.24.167` with your computer's actual IP address on the same network as your device.

### 3. Running the App

```bash
# Run everything in one command (backend, legal_qna service, and frontend)
npm run dev:full

# Or run the simplified version
npm run dev:simple
```

## Troubleshooting macOS Issues

If you encounter errors on macOS:

1. **Python not found**: Use `python3` instead of `python`
   ```bash
   # Instead of this:
   cd /Users/harshringsia/app && python legal_qna/app.py
   
   # Use this:
   cd /Users/harshringsia/app && python3 legal_qna/app.py
   ```

2. **Wrong directory**: Always run commands from the app directory
   ```bash
   cd /Users/harshringsia/app
   npm run dev:simple
   ```

3. **Manual service startup**: You can start each service separately
   ```bash
   # Start legal_qna service
   cd /Users/harshringsia/app && python3 legal_qna/app.py &
   
   # Start frontend
   cd /Users/harshringsia/app && npx expo start
   ```

## Using the Feature

1. Navigate to the Document Reader from the home screen
2. Select "Load Sample Document" to load a test contract, or "Select Document" to upload your own
3. After processing, you can ask questions about the document
4. The system will provide answers based on the document content
5. You can show/hide the context used to generate the answer

## Example Questions

For the sample consulting agreement, try asking:
- What is the retainer fee mentioned in the agreement?
- What is the term of the agreement?
- What services will the consultant provide?
- What are the confidentiality provisions?
- Who owns the intellectual property?

## Troubleshooting

### Upload Issues

If you're having problems uploading documents:

1. **"Network request failed" error**: The app is now configured to connect directly to the legal_qna service on port 8080 instead of using the backend proxy. This should resolve most connection issues.

2. **If you still have issues**:
   - Check that the legal_qna service is running (`python3 legal_qna/app.py`)
   - Verify the IP address in `doc.tsx` if testing on a real device
   - Check your firewall settings to ensure port 8080 is accessible
   - Try using the "Load Sample Document" button instead of uploading your own file

3. **Check the console logs** for more detailed error messages

### Connection Errors

If you see connection errors:

1. Make sure the legal_qna service is running (look for "Running on http://127.0.0.1:8080" in terminal)
2. Check that the IP address is correct if testing on a real device
3. Ensure there are no firewall issues blocking the connections

### Questions Not Being Answered Correctly

The simplified QnA engine has limited capabilities:

1. It works best with direct, factual questions
2. It may not understand complex or nuanced questions
3. The accuracy depends on the document quality and text extraction

## Technical Details

### Simplified Implementation

This implementation uses:

- A simplified Flask backend instead of FastAPI
- Basic text extraction from PDFs and images
- A rule-based QA engine instead of a full LLM
- Direct file processing instead of vector embeddings

For a production implementation, you would want to:

1. Use a proper vector database (like FAISS)
2. Integrate a real LLM for question answering
3. Improve the document processing pipeline
4. Add better error handling and user feedback

### Folder Structure

```
legal_qna/
├── app.py            # Flask application
├── extractor.py      # Text extraction from PDF/images
├── qa_engine.py      # Question answering logic
├── requirements.txt  # Dependencies
└── data/             # Storage for processed documents
```

## Credits

This feature uses:
- Flask for the backend service
- PyPDF2 for PDF text extraction (optional)
- pytesseract for image text extraction (optional)
- A rule-based QA engine for answering questions 