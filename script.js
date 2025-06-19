<script>
document.addEventListener('DOMContentLoaded', function() {
   // Configuration - Update this with your actual API endpoint
   const API_ENDPOINT = 'https://your-api-endpoint.com/submit'; // TODO: Replace with actual endpoint
  
   // Chat elements
   const chatMessages = document.getElementById('chat-messages');
   const chatInput = document.getElementById('message-input');
   const chatForm = document.getElementById('chat-form');
   const sendButton = document.getElementById('send-button');
   const completeMessage = document.getElementById('conversation-complete-message');
   const chatFormContainer = document.getElementById('chat-form-container');
  
   // Create typing indicator element
   const typingIndicator = document.createElement('div');
   typingIndicator.id = 'typing-indicator';
   typingIndicator.className = 'typing-indicator message incoming';
   typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  
   // Form data storage
   const formData = {
       accidentType: '',
       inCalifornia: '',
       whenHappened: '',
       injuries: '',
       treatment: '',
       name: '',
       email: '',
       phoneNumber: ''
   };
  
   // Track current question
   let currentQuestion = 0;
   const totalQuestions = 8;
  
   // Question definitions - Add new contact questions
   const questions = [
       {
           text: "What type of accident or injury were you involved in?",
           options: [
               { value: "Car Accident", icon: "directions_car" },
               { value: "Uber/Lyft (Rideshare) Accident", icon: "local_taxi" },
               { value: "Hit and Run Accident", icon: "directions_run" },
               { value: "Commercial Truck Accident", icon: "local_shipping" },
               { value: "Motorcycle Injury", icon: "two_wheeler" },
               { value: "Pedestrian or Bicycle Accident", icon: "pedal_bike" },
               { value: "Slip, Trip, or Fall Injury", icon: "downhill_skiing" },
               { value: "Dog Bite or Animal Attack", icon: "pets" },
               { value: "Workplace Injury or Accident", icon: "work" }
           ],
           formField: 'accidentType'
       },
       {
           text: "Did the accident or injury happen in California?",
           options: [
               { value: "Yes", icon: "check_circle" },
               { value: "No", icon: "cancel" }
           ],
           formField: 'inCalifornia'
       },
       {
           text: "When did the accident or injury happen?",
           options: [
               { value: "Within the last 3 days", icon: "today" },
               { value: "Within the last 3 months", icon: "date_range" },
               { value: "3 months to 2 years ago", icon: "event" },
               { value: "More than 2 years ago", icon: "event_busy" }
           ],
           formField: 'whenHappened'
       },
       {
           text: "What were the injuries? (Select the most relevant)",
           options: [
               { value: "Back / Neck Injury", icon: "accessibility" },
               { value: "Head Injury", icon: "psychology" },
               { value: "Broken bone", icon: "orthopedics" },
               { value: "Death", icon: "feedback" },
               { value: "Other", icon: "healing" },
               { value: "Not sure at this time", icon: "help" }
           ],
           formField: 'injuries'
       },
       {
           text: "What was the treatment?",
           options: [
               { value: "ER or Doctor Visit", icon: "local_hospital" },
               { value: "Surgery Done or Recommended", icon: "medical_services" },
               { value: "Physical Therapy", icon: "accessibility_new" },
               { value: "Other", icon: "medication" },
               { value: "No Treatment So Far", icon: "do_not_disturb" },
               { value: "Not Applicable – Filling Out for a Loved One", icon: "people" }
           ],
           formField: 'treatment'
       },
       // New contact information questions
       {
           text: "Please provide your full name:",
           type: "text",
           formField: 'name',
           placeholder: "Enter your full name",
           validation: (value) => {
               return value.trim() !== "";
           },
           errorMessage: "Please enter your name"
       },
       {
           text: "What's your email address?",
           type: "email",
           formField: 'email',
           placeholder: "example@email.com",
           validation: (value) => {
               const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
               return emailRegex.test(value);
           },
           errorMessage: "Please enter a valid email address"
       },
       {
           text: "What's your phone number?",
           type: "tel",
           formField: 'phoneNumber',
           placeholder: "(555) 123-4567",
           validation: (value) => {
               // Simple validation - just make sure there are at least 10 digits
               const phoneDigits = value.replace(/\D/g, '');
               return phoneDigits.length >= 10;
           },
           errorMessage: "Please enter a valid phone number"
       }
   ];
  
   // Start the conversation
   function startConversation() {
       // Display welcome message
       createIncomingMessage("Hello! I'm here to gather information about your personal injury case. I'll ask you a series of questions to help assess your situation.");
      
       // Show the first question after a short delay
       setTimeout(() => {
           showNextQuestion();
       }, 1000);
   }
  
   // Show the next question
   // Show the next question
   function showNextQuestion() {
       if (currentQuestion < questions.length) {
           const question = questions[currentQuestion];
          
           // Create a message with question number indicator
           const messageDiv = document.createElement('div');
           messageDiv.classList.add('message', 'incoming');
          
           // Add question number
           const questionNumberDiv = document.createElement('div');
           questionNumberDiv.classList.add('question-number');
           questionNumberDiv.textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
           messageDiv.appendChild(questionNumberDiv);
          
           // Add question text
           const questionTextDiv = document.createElement('div');
           questionTextDiv.textContent = question.text;
           messageDiv.appendChild(questionTextDiv);
          
           // Check if it's a multiple choice or text input question
           if (question.type === "text" || question.type === "email" || question.type === "tel") {
               // Create text input
               const textInputContainer = document.createElement('div');
               textInputContainer.classList.add('text-input-container');
              
               const textInput = document.createElement('input');
               textInput.type = question.type;
               textInput.classList.add('text-input-field');
               textInput.placeholder = question.placeholder;
               textInput.id = `${question.formField}-input`;
               textInputContainer.appendChild(textInput);
              
               // Create error message
               const errorMessage = document.createElement('div');
               errorMessage.classList.add('text-input-error');
               errorMessage.id = `${question.formField}-error`;
               errorMessage.textContent = question.errorMessage;
               textInputContainer.appendChild(errorMessage);
              
               // Create submit button
               const submitButton = document.createElement('button');
               submitButton.type = 'button';
               submitButton.classList.add('text-input-submit');
               submitButton.innerHTML = `<span class="material-icons">arrow_forward</span> Continue`;
              
               // Add click event for text inputs
               submitButton.addEventListener('click', function() {
                   const inputValue = textInput.value;
                   const isValid = question.validation(inputValue);
                  
                   if (isValid) {
                       handleTextInputSubmission(inputValue, question.formField);
                   } else {
                       // Show error
                       const errorElement = document.getElementById(`${question.formField}-error`);
                       errorElement.style.display = 'block';
                   }
               });
              
               textInputContainer.appendChild(submitButton);
               messageDiv.appendChild(textInputContainer);
           } else {
               // Add multiple choice options
               const optionsDiv = document.createElement('div');
               optionsDiv.classList.add('chat-input-options-inline');
              
               question.options.forEach(option => {
                   const button = document.createElement('button');
                   button.classList.add('chat-option-btn-inline');
                   button.setAttribute('data-value', option.value);
                   button.innerHTML = `<span class="material-icons">${option.icon}</span> ${option.value}`;
                  
                   // Add click event
                   button.addEventListener('click', function() {
                       const selectedValue = this.getAttribute('data-value');
                       handleOptionSelection(selectedValue, question.formField);
                   });
                  
                   optionsDiv.appendChild(button);
               });
              
               messageDiv.appendChild(optionsDiv);
           }
          
           chatMessages.appendChild(messageDiv);
           scrollToBottom();
          
           // Auto-focus text input if applicable
           if (question.type === "text" || question.type === "email" || question.type === "tel") {
               setTimeout(() => {
                   document.getElementById(`${question.formField}-input`).focus();
               }, 100);
           }
          
       } else {
           // All questions have been answered
           showAIChatOption();
       }
   }
   // Handle text input submission
   function handleTextInputSubmission(value, formField) {
       // Store the answer
       formData[formField] = value;


       // Disable text input in the last message
       const lastMessage = chatMessages.lastElementChild.previousElementSibling;
       if (lastMessage) {
           const textInput = lastMessage.querySelector('.text-input-field');
           const submitButton = lastMessage.querySelector('.text-input-submit');
          
           if (textInput && submitButton) {
               textInput.disabled = true;
               submitButton.disabled = true;
               submitButton.classList.add('disabled');
           }
       }
      
       // Move to the next question
       currentQuestion++;
      
       // Add a small delay before showing next question
       setTimeout(() => {
           showNextQuestion();
       }, 800);
   }
  
   // Handle option selection
   function handleOptionSelection(value, formField) {
       // Store the answer
       formData[formField] = value;
      
       // Create outgoing message with the selection
       createOutgoingMessage(value);
      
       // Disable all option buttons in the last message
       const lastMessage = chatMessages.lastElementChild.previousElementSibling;
       if (lastMessage) {
           const buttons = lastMessage.querySelectorAll('.chat-option-btn-inline');
           buttons.forEach(button => {
               button.disabled = true;
               button.classList.add('disabled');
           });
       }
      
       // Move to the next question
       currentQuestion++;
      
       // Add a small delay before showing next question
       setTimeout(() => {
           showNextQuestion();
       }, 800);
   }
  
   // Show AI chat option
   function showAIChatOption() {
       // Create a message thanking user for completing the form
       createIncomingMessage("Thank you for providing this information about your injury case.");
      
       // Ask if they'd like to continue with AI chat
       setTimeout(() => {
           const messageDiv = document.createElement('div');
           messageDiv.classList.add('message', 'incoming');
           messageDiv.textContent = "Would you like to chat with our AI assistant to provide more details about your case?";
          
           // Add Yes/No options
           const optionsDiv = document.createElement('div');
           optionsDiv.classList.add('chat-input-options-inline');
          
           // Yes button
           const yesButton = document.createElement('button');
           yesButton.classList.add('chat-option-btn-inline');
           yesButton.innerHTML = '<span class="material-icons">chat</span> Yes, I want to chat';
           yesButton.addEventListener('click', function() {
               handleChatOptionSelection(true);
           });
           optionsDiv.appendChild(yesButton);
          
           // No button
           const noButton = document.createElement('button');
           noButton.classList.add('chat-option-btn-inline');
           noButton.innerHTML = '<span class="material-icons">send</span> No, submit my information';
           noButton.addEventListener('click', function() {
               handleChatOptionSelection(false);
           });
           optionsDiv.appendChild(noButton);
          
           messageDiv.appendChild(optionsDiv);
           chatMessages.appendChild(messageDiv);
           scrollToBottom();
       }, 1000);
   }
  
   // Handle chat option selection
   function handleChatOptionSelection(wantToChat) {
       // Create outgoing message with the selection
       createOutgoingMessage(wantToChat ? "Yes, I want to chat" : "No, submit my information");
      
       // Disable the buttons
       const lastMessage = chatMessages.lastElementChild.previousElementSibling;
       if (lastMessage) {
           const buttons = lastMessage.querySelectorAll('.chat-option-btn-inline');
           buttons.forEach(button => {
               button.disabled = true;
               button.classList.add('disabled');
           });
       }
      
       // Send the form data to the server
       submitFormData(wantToChat);
   }
  
   // Submit form data to server
   function submitFormData(wantToChat) {


      
       // Show typing indicator
       showTypingIndicator();
      
       // Create form data for submission
       const submissionData = new FormData();
       console.log(submissionData)
       // Add form field values
       for (const [key, value] of Object.entries(formData)) {
           submissionData.append(key, value);
       }
      
       // Add a field indicating whether user wants to chat
       submissionData.append('wantToChat', wantToChat ? 'yes' : 'no');
      
       // Send to server
       fetch(API_ENDPOINT, {
           method: 'POST',
           credentials: 'include',
           body: submissionData
       })
       .then(response => {
           if (!response.ok) {
               throw new Error('Server returned error');
           }
           return response.json();
       })
       .then(data => {
           hideTypingIndicator();
          
           if (wantToChat) {
               // User wants to chat, show chat input
               createIncomingMessage("Great! I'm here to help gather more details about your case. What additional information would you like to share?");
               showChatForm();
           } else {
               // User doesn't want to chat, show thank you message
               createIncomingMessage("Thank you for providing your information. A legal professional will review your case and contact you soon.");
               showCompletionMessage();
           }
          
       })
       .catch(error => {
           hideTypingIndicator();
           createErrorMessage();
       });
   }
  
   // Handle chat form submission for follow-up conversation
   if (chatForm) {
       chatForm.addEventListener('submit', function(event) {
           event.preventDefault();
          
           const message = chatInput.value.trim();
           if (!message) return;
          
           // Clear input immediately
           chatInput.value = '';
          
           // Create outgoing message
           createOutgoingMessage(message);
          
           // Show typing indicator
           showTypingIndicator();
          
           // Disable input while waiting
           disableInput();
          
           // Send the message to the server
           sendMessageToServer(message)
               .then(response => {
                   // Handle response
                   hideTypingIndicator();
                   createIncomingMessage(response.message);
                  
                   // Check if conversation complete
                   if (response.conversationComplete) {
                       handleConversationComplete();
                   } else {
                       // Re-enable input
                       enableInput();
                   }
               })
               .catch(error => {
                   // Handle error
                   hideTypingIndicator();
                   createErrorMessage();
                   enableInput();
               });
       });
   }
  
   // Helper Functions
  
   // Show the chat form
   function showChatForm() {
       if (chatFormContainer) {
           chatFormContainer.classList.remove('hidden');
           chatFormContainer.style.display = 'block';
           chatInput.focus();
       }
   }
  
   // Show completion message
   function showCompletionMessage() {
       if (completeMessage) {
           completeMessage.classList.remove('hidden');
           completeMessage.style.display = 'block';
       }
   }
  
   // Show typing indicator
   function showTypingIndicator() {
       chatMessages.appendChild(typingIndicator);
       scrollToBottom();
   }
  
   // Hide typing indicator
   function hideTypingIndicator() {
       if (typingIndicator.parentNode === chatMessages) {
           chatMessages.removeChild(typingIndicator);
       }
   }
  
   // Create outgoing message bubble
   function createOutgoingMessage(message) {
       const messageDiv = document.createElement('div');
       messageDiv.classList.add('message', 'outgoing');
       messageDiv.textContent = message;
       chatMessages.appendChild(messageDiv);
       scrollToBottom();
   }
  
   // Create incoming message bubble
   function createIncomingMessage(message) {
       const messageDiv = document.createElement('div');
       messageDiv.classList.add('message', 'incoming');
       messageDiv.textContent = message;
       chatMessages.appendChild(messageDiv);
       scrollToBottom();
   }
  
   // Create error message
   function createErrorMessage() {
       const errorDiv = document.createElement('div');
       errorDiv.classList.add('message', 'system', 'error');
       errorDiv.innerHTML = '<span class="material-icons" style="vertical-align: middle; margin-right: 5px;">error</span> Sorry, there was an error processing your request. Please try again.';
       chatMessages.appendChild(errorDiv);
       scrollToBottom();
   }
  
   // Disable input during processing
   function disableInput() {
       chatForm.classList.add('waiting');
       chatInput.disabled = true;
       sendButton.disabled = true;
   }
  
   // Enable input after processing
   function enableInput() {
       chatForm.classList.remove('waiting');
       chatInput.disabled = false;
       sendButton.disabled = false;
       chatInput.focus();
   }
  
   // Handle conversation completion
   function handleConversationComplete() {
       // Disable the form permanently
       if (chatForm) {
           chatForm.classList.add('disabled');
           chatInput.disabled = true;
           sendButton.disabled = true;
       }
      
       // Show the completion message
       showCompletionMessage();
      
       // Add a system message
       const systemMsg = document.createElement('div');
       systemMsg.classList.add('message', 'system');
       systemMsg.innerHTML = '<span class="material-icons" style="vertical-align: middle; margin-right: 5px;">info</span> Thank you for providing all the necessary information. This conversation is now complete.';
       chatMessages.appendChild(systemMsg);
      
       scrollToBottom();
   }
  
   // Send message to server
   async function sendMessageToServer(message) {
       try {
            // Create form data
           const msgFormData = new FormData();
           msgFormData.append('message', message);
          
           const response = await fetch(API_ENDPOINT, {
               method: 'POST',
               credentials: 'include',
               body: msgFormData,
           });
              
           if (!response.ok) {
               throw new Error('Network response was not ok');
           }


           // Parse the JSON response
           const jsonResponse = await response.json();
          
           return {
               message: jsonResponse.message,
               conversationComplete: jsonResponse.conversationComplete,
               sessionId: jsonResponse.sessionId,
               clientProfile: jsonResponse.clientProfile
           };
       } catch (error) {
           throw error;
       }
   }
  
  
   // Helper function to scroll chat to bottom
   function scrollToBottom() {
       chatMessages.scrollTop = chatMessages.scrollHeight;
   }
  
   // Add viewport height fix for mobile browsers
   function setVh() {
       let vh = window.innerHeight * 0.01;
       document.documentElement.style.setProperty('--vh', `${vh}px`);
   }
  
   startConversation();
   setVh();
   window.addEventListener('resize', setVh);
});
   </script>

