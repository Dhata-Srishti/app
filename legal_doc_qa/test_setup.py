#!/usr/bin/env python3
"""
Test script to verify the legal document Q&A application setup.
Run this script to check if all dependencies are installed correctly.
"""

import sys
import importlib
import os

def test_imports():
    """Test if all required packages can be imported."""
    required_packages = [
        'flask',
        'werkzeug',
        'PyPDF2',
        'docx',
        'transformers',
        'torch',
        'numpy',
        'requests'
    ]
    
    print("Testing package imports...")
    failed_imports = []
    
    for package in required_packages:
        try:
            if package == 'docx':
                importlib.import_module('docx')
            else:
                importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            failed_imports.append(package)
    
    return failed_imports

def test_directories():
    """Test if required directories exist."""
    print("\nTesting directory structure...")
    required_dirs = ['uploads', 'templates']
    missing_dirs = []
    
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ {dir_name}/ directory exists")
        else:
            print(f"❌ {dir_name}/ directory missing")
            missing_dirs.append(dir_name)
    
    return missing_dirs

def test_files():
    """Test if required files exist."""
    print("\nTesting required files...")
    required_files = [
        'main.py',
        'requirements.txt',
        'templates/index.html'
    ]
    missing_files = []
    
    for file_name in required_files:
        if os.path.exists(file_name):
            print(f"✅ {file_name}")
        else:
            print(f"❌ {file_name} missing")
            missing_files.append(file_name)
    
    return missing_files

def test_flask_app():
    """Test if the Flask app can be imported."""
    print("\nTesting Flask application...")
    try:
        from main import app, qa_system
        print("✅ Flask app imported successfully")
        print(f"✅ QA system initialized")
        return True
    except Exception as e:
        print(f"❌ Flask app import failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 50)
    print("Legal Document Q&A - Setup Test")
    print("=" * 50)
    
    # Test imports
    failed_imports = test_imports()
    
    # Test directories
    missing_dirs = test_directories()
    
    # Test files
    missing_files = test_files()
    
    # Test Flask app
    app_works = test_flask_app()
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    if not failed_imports and not missing_dirs and not missing_files and app_works:
        print("🎉 ALL TESTS PASSED!")
        print("\nYour setup is ready. You can now run:")
        print("python main.py")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        
        if failed_imports:
            print(f"\nMissing packages: {', '.join(failed_imports)}")
            print("Run: pip install -r requirements.txt")
        
        if missing_dirs:
            print(f"\nMissing directories: {', '.join(missing_dirs)}")
            print("Create them manually or re-run the setup")
        
        if missing_files:
            print(f"\nMissing files: {', '.join(missing_files)}")
            print("Make sure all files are in the correct location")
        
        if not app_works:
            print("\nFlask app failed to load. Check the error messages above.")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())
