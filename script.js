// DOM Elements
const optionCards = document.querySelectorAll('.option-card');
const selectButtons = document.querySelectorAll('.select-btn');
const submitBtn = document.getElementById('submit-btn');
const confirmationOverlay = document.getElementById('confirmation');
const customRestaurantInput = document.getElementById('custom-restaurant');
const closeBtn = document.getElementById('close-confirmation');

let selectedOption = null;

// Option labels for readable messages
const optionLabels = {
    'vegan': '🥗 Vegan durch Berlin (2× Gutscheinheft)',
    'foersters': '🍽️ Das Försters',
    'wunsch': '✨ Eigene Wahl'
};

// Handle card selection
optionCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'A') {
            return;
        }
        selectCard(card);
    });
});

// Handle button clicks
selectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.option-card');
        selectCard(card);
    });
});

function selectCard(card) {
    optionCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedOption = card.dataset.option;
    submitBtn.disabled = false;
}

// Handle custom restaurant input focus
if (customRestaurantInput) {
    customRestaurantInput.addEventListener('focus', () => {
        const card = customRestaurantInput.closest('.option-card');
        selectCard(card);
    });
}

// Handle form submission
submitBtn.addEventListener('click', () => {
    if (!selectedOption) return;
    
    // Get custom restaurant if selected
    let customRestaurant = '';
    if (selectedOption === 'wunsch' && customRestaurantInput) {
        customRestaurant = customRestaurantInput.value;
    }
    
    // Build the email
    const choiceText = optionLabels[selectedOption];
    const restaurantInfo = customRestaurant ? `\n\nMein Wunschrestaurant: ${customRestaurant}` : '';
    
    const subject = encodeURIComponent('🎉 Meine Gutschein-Wahl!');
    const body = encodeURIComponent(
        `Hallo ihr Lieben!\n\n` +
        `Ich habe mich entschieden:\n\n` +
        `👉 ${choiceText}${restaurantInfo}\n\n` +
        `Vielen Dank für das tolle Geschenk! 💕\n\n` +
        `Carla`
    );
    
    const mailtoLink = `mailto:timothyvau@gmail.com?subject=${subject}&body=${body}`;
    
    // Show confirmation first
    showConfirmation();
    
    // Open mail client after a short delay
    setTimeout(() => {
        window.location.href = mailtoLink;
    }, 2000);
});

function showConfirmation() {
    confirmationOverlay.classList.add('active');
    createConfetti();
}

function hideConfirmation() {
    confirmationOverlay.classList.remove('active');
}

// Close button handler
if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideConfirmation();
    });
}

// Also close when clicking outside the content
confirmationOverlay.addEventListener('click', (e) => {
    if (e.target === confirmationOverlay) {
        hideConfirmation();
    }
});

// Fun confetti animation
function createConfetti() {
    const colors = ['#c44536', '#87a878', '#f5f0e8', '#ffd700', '#ff69b4'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                z-index: 1001;
                pointer-events: none;
                animation: fall ${2 + Math.random() * 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
    
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
