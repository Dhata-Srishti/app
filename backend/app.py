import os
from flask import Flask, render_template, request, jsonify, send_file
import dwani
import tempfile
import io
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for React Native frontend
CORS(app, origins=["*"])

# Set up Dwani API credentials from environment variables only
dwani.api_key = os.getenv("DWANI_API_KEY", "harshringsia18@gmail.com_dwani")
dwani.api_base = os.getenv("DWANI_API_BASE_URL", "https://dwani-dwani-api.hf.space")

# Validate that required environment variables are set
if not dwani.api_key:
    raise ValueError("DWANI_API_KEY environment variable is required")
if not dwani.api_base:
    raise ValueError("DWANI_API_BASE_URL environment variable is required")

# Language code mapping for Dwani API
DWANI_LANGUAGE_MAP = {
    'english': 'eng_Latn',
    'en': 'eng_Latn',
    'hindi': 'hin_Deva',
    'hi': 'hin_Deva',
    'kannada': 'kan_Knda',
    'kn': 'kan_Knda',
    'assamese': 'asm_Beng',
    'as': 'asm_Beng',
    'bengali': 'ben_Beng',
    'bn': 'ben_Beng',
    'gujarati': 'guj_Gujr',
    'gu': 'guj_Gujr',
    'malayalam': 'mal_Mlym',
    'ml': 'mal_Mlym',
    'marathi': 'mar_Deva',
    'mr': 'mar_Deva',
    'odia': 'ori_Orya',
    'or': 'ori_Orya',
    'punjabi': 'pan_Guru',
    'pa': 'pan_Guru',
    'tamil': 'tam_Taml',
    'ta': 'tam_Taml',
    'telugu': 'tel_Telu',
    'te': 'tel_Telu',
}

def map_to_dwani_language(lang_code):
    """
    Map frontend language codes to Dwani API language codes
    """
    if not lang_code:
        return 'eng_Latn'  # Default to English
    
    lang_code = lang_code.lower()
    return DWANI_LANGUAGE_MAP.get(lang_code, 'eng_Latn')

@app.route('/')
def index():
    """Home page route"""
    return jsonify({
        "message": "Dhata Backend API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "text_query": "/api/text_query",
            "vision_query": "/api/vision_query",
            "asr": "/api/asr",
            "translate": "/api/translate",
            "tts": "/api/tts",
            "extract_document": "/api/extract_document"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running"""
    return jsonify({
        "status": "healthy",
        "message": "Dhata API is running",
        "api_base": dwani.api_base,
        "api_key_configured": bool(dwani.api_key)
    })

@app.route('/api/text_query', methods=['POST'])
def text_query():
    """
    Text-based chat query endpoint
    Required fields: prompt, src_lang, tgt_lang
    """
    try:
        # Check if request is JSON or form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
        
        prompt = data.get('prompt')
        src_lang = data.get('src_lang', 'en')
        tgt_lang = data.get('tgt_lang', 'en')
        
        # Validate required fields
        if not prompt:
            return jsonify({
                "success": False,
                "error": "Missing required field: prompt"
            }), 400
        
        resp = dwani.Chat.create(prompt=prompt, src_lang=src_lang, tgt_lang=tgt_lang)
        return jsonify({
            "success": True,
            "data": resp
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/vision_query', methods=['POST'])
def vision_query():
    """
    Vision-based query endpoint with image upload
    Required fields: query, src_lang, tgt_lang, image (file)
    """
    try:
        query = request.form.get('query')
        src_lang = request.form.get('src_lang', 'en')
        tgt_lang = request.form.get('tgt_lang', 'en')
        
        # Validate required fields
        if not query:
            return jsonify({
                "success": False,
                "error": "Missing required field: query"
            }), 400
        
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided"
            }), 400
        
        # Save uploaded file
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No image file selected"
            }), 400
        
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        file.save(temp_file.name)
        
        result = dwani.Vision.caption(
            file_path=temp_file.name,
            query=query,
            src_lang=src_lang,
            tgt_lang=tgt_lang
        )
        os.unlink(temp_file.name)  # Delete the temporary file
        
        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)  # Delete the temporary file
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/asr', methods=['POST'])
def asr():
    """
    Automatic Speech Recognition endpoint
    Required fields: language, audio (file)
    """
    try:
        language = request.form.get('language', 'en')
        
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided"
            }), 400
        
        # Save uploaded file
        file = request.files['audio']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No audio file selected"
            }), 400
        
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        file.save(temp_file.name)
        
        result = dwani.ASR.transcribe(file_path=temp_file.name, language=language)
        os.unlink(temp_file.name)  # Delete the temporary file
        
        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)  # Delete the temporary file
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/translate', methods=['POST'])
def translate():
    """
    Text translation endpoint
    Required fields: text, src_lang, tgt_lang
    """
    try:
        # Check if request is JSON or form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
        
        text = data.get('text')
        src_lang = data.get('src_lang', 'english')
        tgt_lang = data.get('tgt_lang', 'kannada')
        
        # Validate required fields
        if not text:
            return jsonify({
                "success": False,
                "error": "Missing required field: text"
            }), 400
        
        # Map language codes to Dwani API format
        dwani_src_lang = map_to_dwani_language(src_lang)
        dwani_tgt_lang = map_to_dwani_language(tgt_lang)
        
        resp = dwani.Translate.run_translate(sentences=[text], src_lang=dwani_src_lang, tgt_lang=dwani_tgt_lang)
        return jsonify({
            "success": True,
            "data": resp
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/tts', methods=['POST'])
def tts():
    """
    Text-to-Speech endpoint
    Required fields: input_text
    Optional fields: src_lang (defaults to 'english'), return_translation (defaults to False)
    Returns: MP3 audio file, or JSON with audio and translation if return_translation=True
    Note: Always converts text to Kannada before TTS generation as TTS only works with Kannada
    """
    try:
        # Check if request is JSON or form data
        if request.is_json:
            data = request.get_json()
            input_text = data.get('input_text')
            src_lang = data.get('src_lang', 'english')
            return_translation = data.get('return_translation', False)
        else:
            input_text = request.form.get('input_text')
            src_lang = request.form.get('src_lang', 'english')
            return_translation = request.form.get('return_translation', 'false').lower() == 'true'
        
        # Validate required fields
        if not input_text:
            return jsonify({
                "success": False,
                "error": "Missing required field: input_text"
            }), 400
        
        # Translate input text to Kannada (TTS only works with Kannada)
        try:
            # Map language codes to Dwani API format
            dwani_src_lang = map_to_dwani_language(src_lang)
            dwani_tgt_lang = map_to_dwani_language('kannada')  # Always translate to Kannada for TTS
            
            print(f"=== TTS TRANSLATION DEBUG ===")
            print(f"Input text: '{input_text}'")
            print(f"Source language: {src_lang} -> Dwani format: {dwani_src_lang}")
            print(f"Target language: kannada -> Dwani format: {dwani_tgt_lang}")
            
            # Use the same translation call as the working translate endpoint
            translation_resp = dwani.Translate.run_translate(sentences=[input_text], src_lang=dwani_src_lang, tgt_lang=dwani_tgt_lang)
            print(f"Raw translation response: {translation_resp}")
            print(f"Translation response type: {type(translation_resp)}")
            
            # Parse the response the same way as the translate endpoint
            kannada_text = input_text  # Default fallback
            
            if isinstance(translation_resp, dict):
                # Check for direct 'translations' field (direct API response)
                if 'translations' in translation_resp:
                    translations = translation_resp['translations']
                    if isinstance(translations, list) and len(translations) > 0:
                        kannada_text = translations[0]
                        print(f"Successfully extracted from direct response: '{kannada_text}'")
                    else:
                        print(f"Translations not in expected format: {translations}")
                # Check for nested 'data.translations' field (wrapped response)
                elif 'data' in translation_resp:
                    data = translation_resp['data']
                    if isinstance(data, dict) and 'translations' in data:
                        translations = data['translations']
                        if isinstance(translations, list) and len(translations) > 0:
                            kannada_text = translations[0]
                            print(f"Successfully extracted from nested response: '{kannada_text}'")
                        else:
                            print(f"Translations not in expected format: {translations}")
                    else:
                        print(f"Data field not in expected format: {data}")
                else:
                    print(f"No 'translations' or 'data' field in response: {translation_resp}")
            elif isinstance(translation_resp, list) and len(translation_resp) > 0:
                kannada_text = translation_resp[0]
                print(f"Extracted from list: '{kannada_text}'")
            else:
                print(f"Unexpected response format: {translation_resp}")
            
            print(f"Final Kannada text for TTS: '{kannada_text}'")
            print(f"=== END TTS TRANSLATION DEBUG ===")
            
        except Exception as translation_error:
            print(f"Translation error: {str(translation_error)}")
            kannada_text = input_text  # Fallback to original text if translation fails
            print(f"Using original text due to error: {kannada_text}")
        
        # Use the translated Kannada text for TTS
        response = dwani.Audio.speech(input=kannada_text, response_format="mp3")
        
        # If return_translation is True, return JSON with both audio and translation
        if return_translation:
            import base64
            
            # Convert audio to base64
            audio_base64 = base64.b64encode(response).decode('utf-8')
            
            return jsonify({
                "success": True,
                "audio_base64": audio_base64,
                "kannada_text": kannada_text,
                "original_text": input_text,
                "src_lang": src_lang
            })
        
        # Default behavior: return MP3 file directly
        buffer = io.BytesIO(response)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype="audio/mp3",
            as_attachment=False,
            download_name="output.mp3"
        )
    except Exception as e:
        print(f"TTS error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/extract_document', methods=['POST'])
def extract_document():
    """
    Document extraction endpoint
    Required fields: page_number, src_lang, tgt_lang, document (file)
    """
    try:
        page_number = request.form.get('page_number', '1')
        src_lang = request.form.get('src_lang', 'en')
        tgt_lang = request.form.get('tgt_lang', 'en')
        
        try:
            page_number = int(page_number)
        except ValueError:
            return jsonify({
                "success": False,
                "error": "page_number must be a valid integer"
            }), 400
        
        if 'document' not in request.files:
            return jsonify({
                "success": False,
                "error": "No document file provided"
            }), 400
        
        # Save uploaded file
        file = request.files['document']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No document file selected"
            }), 400
        
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        file.save(temp_file.name)
        
        result = dwani.Documents.run_extract(
            file_path=temp_file.name,
            page_number=page_number,
            src_lang=src_lang,
            tgt_lang=tgt_lang
        )
        os.unlink(temp_file.name)  # Delete the temporary file
        
        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        if 'temp_file' in locals():
            os.unlink(temp_file.name)  # Delete the temporary file
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Legacy endpoints for backward compatibility
@app.route('/text_query', methods=['POST'])
def legacy_text_query():
    """Legacy endpoint - redirects to new API"""
    return text_query()

@app.route('/vision_query', methods=['POST'])
def legacy_vision_query():
    """Legacy endpoint - redirects to new API"""
    return vision_query()

@app.route('/asr', methods=['POST'])
def legacy_asr():
    """Legacy endpoint - redirects to new API"""
    return asr()

@app.route('/translate', methods=['POST'])
def legacy_translate():
    """Legacy endpoint - redirects to new API"""
    return translate()

@app.route('/tts', methods=['POST'])
def legacy_tts():
    """Legacy endpoint - redirects to new API"""
    return tts()

@app.route('/extract_document', methods=['POST'])
def legacy_extract_document():
    """Legacy endpoint - redirects to new API"""
    return extract_document()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 