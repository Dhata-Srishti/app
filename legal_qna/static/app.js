document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const uploadBtn = document.getElementById('uploadBtn');
    const loadTestBtn = document.getElementById('loadTestBtn');
    const askBtn = document.getElementById('askBtn');
    const documentFile = document.getElementById('documentFile');
    const uploadStatus = document.getElementById('uploadStatus');
    const qaSection = document.getElementById('qa-section');
    const questionInput = document.getElementById('question');
    const answerContainer = document.getElementById('answer-container');
    const answerElement = document.getElementById('answer');
    const contextElement = document.getElementById('context');
    const donutModelSwitch = document.getElementById('donutModelSwitch');
    const modelBadge = document.getElementById('modelBadge');
    
    // API endpoints
    const API_BASE_URL = '';  // Use relative URLs for same-origin requests
    const UPLOAD_URL = `${API_BASE_URL}/upload`;
    const ASK_URL = `${API_BASE_URL}/ask`;
    const LOAD_TEST_URL = `${API_BASE_URL}/load-test-file`;
    const TOGGLE_DONUT_URL = `${API_BASE_URL}/toggle-donut`;
    
    // Handle document upload
    uploadBtn.addEventListener('click', async function() {
        if (!documentFile.files[0]) {
            showMessage(uploadStatus, 'Please select a file first', 'danger');
            return;
        }
        
        const file = documentFile.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        showMessage(uploadStatus, '<div class="loading-spinner"></div> Processing document...', 'info');
        
        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const fileType = file.name.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png'].includes(fileType);
                const modelType = isImage && donutModelSwitch.checked ? 'Donut' : 'Text-based';
                
                showMessage(uploadStatus, `Document processed successfully! ${data.chunks_indexed} chunks indexed. Using ${modelType} model.`, 'success');
                // Enable QA section
                qaSection.style.display = 'block';
            } else {
                showMessage(uploadStatus, `Error: ${data.detail || 'Failed to process document'}`, 'danger');
            }
        } catch (error) {
            showMessage(uploadStatus, `Error: ${error.message}`, 'danger');
        }
    });
    
    // Handle loading test document
    loadTestBtn.addEventListener('click', async function() {
        showMessage(uploadStatus, '<div class="loading-spinner"></div> Loading test document...', 'info');
        
        try {
            const response = await fetch(LOAD_TEST_URL);
            const data = await response.json();
            
            if (response.ok) {
                showMessage(uploadStatus, `Test document loaded successfully! ${data.chunks_indexed} chunks indexed. Using text-based model.`, 'success');
                // Enable QA section
                qaSection.style.display = 'block';
            } else {
                showMessage(uploadStatus, `Error: ${data.detail || 'Failed to load test document'}`, 'danger');
            }
        } catch (error) {
            showMessage(uploadStatus, `Error: ${error.message}`, 'danger');
        }
    });
    
    // Handle asking questions
    askBtn.addEventListener('click', async function() {
        const question = questionInput.value.trim();
        
        if (!question) {
            alert('Please enter a question');
            return;
        }
        
        // Show loading state
        askBtn.disabled = true;
        askBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
        answerContainer.style.display = 'none';
        
        try {
            const response = await fetch(ASK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Display the answer and context
                answerElement.textContent = data.answer;
                
                // Format the context
                contextElement.innerHTML = '';
                if (data.context && data.context.length > 0) {
                    if (data.context[0] === "Visual document context (using Donut model)") {
                        const contextItem = document.createElement('div');
                        contextItem.className = 'mb-2 p-2 border-bottom';
                        contextItem.textContent = "This answer was generated using the Donut Visual Document QA model.";
                        contextElement.appendChild(contextItem);
                    } else {
                        data.context.forEach((ctx, index) => {
                            const contextItem = document.createElement('div');
                            contextItem.className = 'mb-2 p-2 border-bottom';
                            contextItem.textContent = ctx;
                            contextElement.appendChild(contextItem);
                        });
                    }
                } else {
                    contextElement.textContent = 'No context available';
                }
                
                // Show the answer container
                answerContainer.style.display = 'block';
            } else {
                alert(`Error: ${data.detail || 'Failed to process question'}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            // Reset button state
            askBtn.disabled = false;
            askBtn.textContent = 'Ask Question';
        }
    });
    
    // Handle model toggle switch
    donutModelSwitch.addEventListener('change', async function() {
        try {
            const response = await fetch(TOGGLE_DONUT_URL, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                modelBadge.textContent = donutModelSwitch.checked ? 'Donut Model' : 'Text-based Model';
                modelBadge.className = `badge ms-2 ${donutModelSwitch.checked ? 'bg-info' : 'bg-secondary'}`;
            } else {
                alert(`Error: ${data.detail || 'Failed to toggle model'}`);
                // Revert the switch state
                donutModelSwitch.checked = !donutModelSwitch.checked;
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
            // Revert the switch state
            donutModelSwitch.checked = !donutModelSwitch.checked;
        }
    });
    
    // Helper function to show messages
    function showMessage(element, message, type) {
        element.innerHTML = message;
        element.className = `alert alert-${type}`;
        element.style.display = 'block';
    }
    
    // Add enter key handler for question input
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askBtn.click();
        }
    });
});