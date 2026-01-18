// ============================================
// Chatbot Functionality
// ============================================
// 
// HOW IT WORKS:
// 1. When user types a message and clicks Send (or presses Enter):
//    - Message is captured from the input field
//    - User message is displayed in the chat window
//    - A POST request is sent to: http://localhost:3000/api/chat
//    - Request body: { "message": "user's message here" }
//
// 2. Backend API receives the request and responds with JSON:
//    { "reply": "Bot's response text", "source": "knowledge_base" }
//
// 3. The response is displayed as a bot message in the chat window
//
// 4. Typing indicator shows while waiting for API response
//
// ============================================

(function() {
    'use strict';

    // API endpoint - Production URL
    // This is where messages are sent via POST request
    const API_URL = 'https://portfolio-chatbot-api-bay.vercel.app/api/chat';

    // DOM Elements (will be initialized after DOM loads)
    let chatbotButton;
    let chatbotContainer;
    let chatbotClose;
    let chatbotMessages;
    let chatbotInput;
    let chatbotSend;
    let chatbotTyping;

    // Initialize chatbot
    function initChatbot() {
        // Get DOM elements - must be called after DOM is loaded
        chatbotButton = document.getElementById('chatbot-button');
        chatbotContainer = document.getElementById('chatbot-container');
        chatbotClose = document.getElementById('chatbot-close');
        chatbotMessages = document.getElementById('chatbot-messages');
        chatbotInput = document.getElementById('chatbot-input');
        chatbotSend = document.getElementById('chatbot-send');
        chatbotTyping = document.getElementById('chatbot-typing');

        // Check if elements exist
        if (!chatbotButton || !chatbotContainer) {
            console.error('Chatbot elements not found');
            return;
        }

        // Toggle chat window
        chatbotButton.addEventListener('click', toggleChat);

        if (chatbotClose) {
            chatbotClose.addEventListener('click', toggleChat);
        }

        // Send message on button click
        if (chatbotSend) {
            chatbotSend.addEventListener('click', sendMessage);
        }

        // Send message on Enter key
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Focus input when chat opens
            chatbotButton.addEventListener('click', function() {
                setTimeout(() => {
                    if (chatbotContainer.classList.contains('active')) {
                        chatbotInput.focus();
                    }
                }, 100);
            });
        }

        // Show welcome message on first load
        showWelcomeMessage();
    }

    // Toggle chat window
    function toggleChat(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (chatbotContainer) {
            chatbotContainer.classList.toggle('active');
            if (chatbotContainer.classList.contains('active')) {
                setTimeout(() => {
                    if (chatbotInput) chatbotInput.focus();
                    scrollToBottom();
                }, 100);
            }
        }
    }

    // Show welcome message
    function showWelcomeMessage() {
        if (chatbotMessages && chatbotMessages.children.length === 0) {
            const welcomeHTML = `
                <div class="chatbot-welcome">
                    <h6>👋 Welcome!</h6>
                    <p>I'm here to help. Feel free to ask me anything about my portfolio, skills, or experience.</p>
                </div>
            `;
            chatbotMessages.innerHTML = welcomeHTML;
        }
    }

    // Send message
    function sendMessage() {
        if (!chatbotInput || !chatbotMessages) return;

        const message = chatbotInput.value.trim();
        if (!message) return;

        // Clear welcome message if present
        const welcomeElement = chatbotMessages.querySelector('.chatbot-welcome');
        if (welcomeElement) {
            welcomeElement.remove();
        }

        // Display user message
        addMessage(message, 'user');

        // Clear input
        chatbotInput.value = '';

        // Disable input and send button
        setInputEnabled(false);

        // Show typing indicator
        showTyping();

        // ============================================
        // STEP 1: Send POST request to API
        // ============================================
        // Sends: { "message": "user's typed message" }
        // To: http://localhost:3000/api/chat
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideTyping();
            // ============================================
            // STEP 2: Receive and display response
            // ============================================
            // Expected response format: { "reply": "response text", "source": "knowledge_base" }
            // The "reply" field contains the bot's message to display
            if (data.reply) {
                // Display the bot's reply message
                addMessage(data.reply, 'bot');
            } else {
                addMessage('Sorry, I received an unexpected response format.', 'bot');
            }
        })
        .catch(error => {
            hideTyping();
            console.error('Chatbot error:', error);
            addMessage('Sorry, I encountered an error. Please make sure the backend API is running at ' + API_URL, 'bot', 'error');
        })
        .finally(() => {
            // Re-enable input and send button
            setInputEnabled(true);
            chatbotInput.focus();
        });
    }

    // Add message to chat
    function addMessage(text, type, errorClass = '') {
        if (!chatbotMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type} ${errorClass}`;

        const time = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        // Parse markdown for bot messages, escape HTML for user messages
        let messageContent;
        if (type === 'bot') {
            // For bot messages, parse markdown and allow safe HTML
            messageContent = parseMarkdown(text);
        } else {
            // For user messages, escape HTML for security
            messageContent = escapeHtml(text);
        }

        messageDiv.innerHTML = `
            <div class="chatbot-message-bubble">${messageContent}</div>
            <div class="chatbot-message-time">${time}</div>
        `;

        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Show typing indicator
    function showTyping() {
        if (chatbotTyping) {
            chatbotTyping.classList.add('active');
            scrollToBottom();
        }
    }

    // Hide typing indicator
    function hideTyping() {
        if (chatbotTyping) {
            chatbotTyping.classList.remove('active');
        }
    }

    // Enable/disable input
    function setInputEnabled(enabled) {
        if (chatbotInput) {
            chatbotInput.disabled = !enabled;
        }
        if (chatbotSend) {
            chatbotSend.disabled = !enabled;
        }
    }

    // Scroll to bottom of messages
    function scrollToBottom() {
        if (chatbotMessages) {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Parse markdown-like formatting in bot responses
    function parseMarkdown(text) {
        if (!text) return '';
        
        // Convert \n to <br> tags first
        let html = text.replace(/\\n/g, '<br>');
        
        // Convert * item (list items) to proper HTML lists
        // Split by <br> to process line by line
        const lines = html.split('<br>');
        let inList = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmedLine = line.trim();
            
            // Check if line is a list item (starts with * followed by one or more spaces)
            if (trimmedLine.match(/^\*\s+/)) {
                if (!inList) {
                    result.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">');
                    inList = true;
                }
                // Remove the * and any leading spaces, preserve the rest
                const listContent = trimmedLine.replace(/^\*\s+/, '').trim();
                result.push('<li style="margin: 0.25rem 0;">' + listContent + '</li>');
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (trimmedLine) {
                    result.push(trimmedLine);
                } else if (i < lines.length - 1) {
                    // Only add <br> if not the last line
                    result.push('<br>');
                }
            }
        }
        
        // Close any open list
        if (inList) {
            result.push('</ul>');
        }
        
        // Join and then convert **text** to <strong>text</strong>
        // Do this after list processing so ** doesn't interfere with list detection
        html = result.join('');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        return html;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }

})();
