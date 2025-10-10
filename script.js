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
        
        function completeSession() {
            clearInterval(dangerTimer);
            clearInterval(mainTimer);
            
            originalText = document.getElementById('notepad').value;
            
            document.getElementById('writingScreen').classList.add('hidden');
            document.getElementById('completeScreen').classList.remove('hidden');
            document.getElementById('outputText').textContent = originalText;
        }
        
        function extendTime(additionalMinutes) {
            const currentText = originalText;
            
            targetMinutes += additionalMinutes;
            
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