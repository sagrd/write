        let targetMinutes = 0;
        let startTime = 0;
        let elapsedTime = 0;
        let lastTypingTime = 0;
        let dangerTimer = null;
        let mainTimer = null;
        let dangerProgress = 0;
        let originalText = '';
        let timerStarted = false;
        
        function startWriting(minutes) {
            targetMinutes = minutes;
            elapsedTime = 0;
            timerStarted = false;

            
            document.getElementById('setupScreen').classList.add('hidden');
            document.getElementById('writingScreen').classList.remove('hidden');
            document.getElementById('timerDisplay').textContent = 'Time: 00:00';
            
            document.getElementById('notepad').focus();
            document.getElementById('notepad').addEventListener('input', handleTyping);
        }
        
        function handleTyping() {
            if (!timerStarted) {
                timerStarted = true;
                startTime = Date.now() - elapsedTime;
                lastTypingTime = Date.now();
                startDangerTimer();
                startMainTimer();
            } else {
                lastTypingTime = Date.now();
                dangerProgress = 0;
                document.getElementById('redOverlay').style.background = 'rgba(255, 0, 0, 0)';
            }
        }
        
        function startDangerTimer() {
            dangerTimer = setInterval(() => {
                const timeSinceTyping = Date.now() - lastTypingTime;
                dangerProgress = Math.min(timeSinceTyping / 6000, 1);
                
                const opacity = dangerProgress * 0.5;
                document.getElementById('redOverlay').style.background = `rgba(255, 0, 0, ${opacity})`;
                
                if (dangerProgress >= 1) {
                    eraseEverything();
                }
            }, 100);
        }
        
        function startMainTimer() {
            mainTimer = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                const minutes = Math.floor(elapsedTime / 60000);
                const seconds = Math.floor((elapsedTime % 60000) / 1000);
                
                document.getElementById('timerDisplay').textContent = 
                    `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                if (elapsedTime >= targetMinutes * 60000) {
                    completeSession();
                }
            }, 1000);
        }
        
        function eraseEverything() {
            document.getElementById('notepad').value = '';
            document.getElementById('redOverlay').style.background = 'rgba(255, 0, 0, 0.8)';
            
            // Reset timer values
            startTime = 0;
            elapsedTime = 0;
            timerStarted = false;
            
            // Clear timers
            if (dangerTimer) clearInterval(dangerTimer);
            if (mainTimer) clearInterval(mainTimer);
            
            setTimeout(() => {
                // Go back to setup screen
                document.getElementById('writingScreen').classList.add('hidden');
                document.getElementById('setupScreen').classList.remove('hidden');
                document.getElementById('redOverlay').style.background = 'rgba(255, 0, 0, 0)';
            }, 500);
        }
        // API Funcitons

        function showApiHelp() {
            document.getElementById('apiModal').style.display = 'flex';
        }
        
        function closeApiHelp() {
            document.getElementById('apiModal').style.display = 'none';
        }
        function saveApiKey() {
            document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
            const key = document.getElementById('apiKey').value.trim();
            if (key) {
                geminiApiKey = key;
                alert('API key saved! You can now use AI rephrasing.');
            } else {
                alert('Please enter a valid API key.');
            }
        }

        async function rephraseWithGemini(style) {

            const outputEl = document.getElementById('outputText');
            outputEl.innerHTML = '<span class="processing loading">Rephrasing your text — this might take a moment.</span>';
            
            let prompt = '';
            if (style === 'business') {
                prompt = `Rephrase the following text in a formal business style. Output text only\n\n${originalText}`;
            } else if (style === 'casual') {
                prompt = `Rephrase the following text in a business casual style. Output text only\n\n${originalText}`;
            } else if (style === 'correct') {
                prompt = `Only fix errors and keep original voice. Output text only\n\n${originalText}`;
            }
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'API request failed');
                }
                
                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const rephrased = data.candidates[0].content.parts[0].text;
                    outputEl.textContent = rephrased;
                } else {
                    outputEl.textContent = 'Error: Unable to rephrase. Please check your API key.';
                }
            } catch (error) {
                outputEl.textContent = `Error: ${error.message}\n\nPlease verify:\n1. Your API key is correct\n2. You have enabled the Gemini API in Google Cloud Console\n3. Your API key has proper permissions`;
            }
        }
        function selectStyle(style) {
            document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            if (style === 'original') {
                document.getElementById('outputText').textContent = originalText;
            } else if (!geminiApiKey) {
                document.getElementById('outputText').textContent = 'Please enter your Gemini API key above to use AI rephrasing.';
            } else {
                rephraseWithGemini(style);
            }
        }
        
        function completeSession() {
            clearInterval(dangerTimer);
            clearInterval(mainTimer);
            document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));

            
            originalText = document.getElementById('notepad').value;
            
            document.getElementById('writingScreen').classList.add('hidden');
            document.getElementById('completeScreen').classList.remove('hidden');
            document.getElementById('outputText').textContent = originalText;
        }
        
        function extendTime(additionalMinutes) {
            const currentText = originalText;
            
            targetMinutes += additionalMinutes;

            //document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('active'));
            
            document.getElementById('completeScreen').classList.add('hidden');
            document.getElementById('writingScreen').classList.remove('hidden');
            
            document.getElementById('notepad').value = currentText;
            
            timerStarted = false;
            
            if (dangerTimer) clearInterval(dangerTimer);
            if (mainTimer) clearInterval(mainTimer);
            
            document.getElementById('notepad').focus();
        }
        
        function copyText() {
            const text = document.getElementById('outputText').textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('Text copied to clipboard!');
            });
        }
        
        function restart() {
            document.getElementById('completeScreen').classList.add('hidden');
            document.getElementById('setupScreen').classList.remove('hidden');
            document.getElementById('notepad').value = '';
            originalText = '';
            elapsedTime = 0;
            timerStarted = false;
            
            // Clear any existing timers
            if (dangerTimer) clearInterval(dangerTimer);
            if (mainTimer) clearInterval(mainTimer);
        }
        
        // Make functions available globally
        window.startWriting = startWriting;
        window.extendTime = extendTime;
        window.copyText = copyText;
        window.restart = restart;