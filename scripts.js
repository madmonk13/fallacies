        let cardData = [];
        let currentIndex = 0;
        let shuffledCards = [];
        let touchStartY = 0;
        let touchEndY = 0;
        let isDragging = false;

        // Load data
        fetch('fallacies.json')
            .then(response => response.json())
            .then(data => {
                cardData = data.cards;
                shuffledCards = [...cardData];
                init();
            })
            .catch(error => console.error('Error loading fallacies:', error));

        function init() {
            renderCard();
            setupEventListeners();
        }

        function renderCard() {
            const card = shuffledCards[currentIndex];
            const cardEl = document.getElementById('card');
            
            // Set solid background color
            cardEl.style.background = card.color;
            
            // Update content
            document.getElementById('cardTitle').textContent = card.title;
            document.getElementById('cardTitle').style.fontSize = calculateFontSize(card.title);
            document.getElementById('cardSubtitle').textContent = card.subtitle;
            document.getElementById('cardDescription').textContent = card.description;
            document.getElementById('cardExample').textContent = card.example;
            document.getElementById('cardTip').textContent = card.tip;
            document.getElementById('cardCounter').textContent = `${currentIndex + 1} / ${shuffledCards.length}`;

            // Update labels for intro card
            if (card.isIntro) {
                document.getElementById('definitionLabel').textContent = 'Welcome';
                document.getElementById('exampleLabel').textContent = "What You'll Learn";
                document.getElementById('tipLabel').textContent = '💡 Get Started';
            } else {
                document.getElementById('definitionLabel').textContent = 'Definition';
                document.getElementById('exampleLabel').textContent = 'Example';
                document.getElementById('tipLabel').textContent = '💡 Pro Tip';
            }

            // Update progress bar
            renderProgressBar();

            // Update button states
            document.getElementById('prevButton').disabled = currentIndex === 0;
            document.getElementById('nextButton').disabled = currentIndex === shuffledCards.length - 1;

            // Show/hide buttons
            document.getElementById('shuffleButton').classList.toggle('hidden', currentIndex !== 0);
            document.getElementById('resetButton').classList.toggle('hidden', currentIndex !== shuffledCards.length - 1);
        }

        function renderProgressBar() {
            const progressBar = document.getElementById('progressBar');
            progressBar.innerHTML = '';
            shuffledCards.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.className = `progress-dot ${idx === currentIndex ? 'active' : ''}`;
                progressBar.appendChild(dot);
            });
        }

        function calculateFontSize(title) {
            const length = title.length;
            const baseSize = 3.5;
            const minSize = 1.2;
            const scaleFactor = 0.08;
            const calculatedSize = Math.max(minSize, baseSize - (length * scaleFactor));
            return `${calculatedSize}rem`;
        }

        function setupEventListeners() {
            const container = document.getElementById('cardContainer');
            const card = document.getElementById('card');

            // Navigation buttons
            document.getElementById('prevButton').addEventListener('click', goPrev);
            document.getElementById('nextButton').addEventListener('click', goNext);
            document.getElementById('resetButton').addEventListener('click', reset);
            document.getElementById('shuffleButton').addEventListener('click', shuffle);

            // Touch events
            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchmove', handleTouchMove, { passive: true });
            container.addEventListener('touchend', handleTouchEnd);

            // Mouse events
            container.addEventListener('mousedown', handleMouseDown);
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseup', handleMouseUp);
            container.addEventListener('mouseleave', handleMouseUp);

            // Keyboard
            document.addEventListener('keydown', handleKeyDown);
        }

        function handleTouchStart(e) {
            touchStartY = e.touches[0].clientY;
            isDragging = true;
        }

        function handleTouchMove(e) {
            if (!isDragging) return;
            touchEndY = e.touches[0].clientY;
            const offset = touchEndY - touchStartY;
            document.getElementById('card').style.transform = `translateY(${offset}px)`;
        }

        function handleTouchEnd() {
            if (!isDragging) return;
            const swipeDistance = touchStartY - touchEndY;
            const minSwipeDistance = 50;

            if (swipeDistance > minSwipeDistance) {
                goNext();
            } else if (swipeDistance < -minSwipeDistance) {
                goPrev();
            }

            document.getElementById('card').style.transform = '';
            isDragging = false;
            touchStartY = 0;
            touchEndY = 0;
        }

        function handleMouseDown(e) {
            touchStartY = e.clientY;
            isDragging = true;
        }

        function handleMouseMove(e) {
            if (!isDragging) return;
            touchEndY = e.clientY;
            const offset = touchEndY - touchStartY;
            document.getElementById('card').style.transform = `translateY(${offset}px)`;
        }

        function handleMouseUp() {
            if (!isDragging) return;
            handleTouchEnd();
        }

        function handleKeyDown(e) {
            if (e.key === 'ArrowUp') goPrev();
            if (e.key === 'ArrowDown') goNext();
        }

        function goNext() {
            if (currentIndex < shuffledCards.length - 1) {
                currentIndex++;
                renderCard();
            }
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                renderCard();
            }
        }

        function reset() {
            currentIndex = 0;
            renderCard();
        }

        function shuffle() {
            const button = document.getElementById('shuffleButton');
            button.classList.add('spinning');

            const introCard = cardData[0];
            const fallacyCards = cardData.slice(1);

            // Fisher-Yates shuffle
            for (let i = fallacyCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [fallacyCards[i], fallacyCards[j]] = [fallacyCards[j], fallacyCards[i]];
            }

            shuffledCards = [introCard, ...fallacyCards];
            currentIndex = 0;
            renderCard();

            setTimeout(() => {
                button.classList.remove('spinning');
            }, 600);
        }
