// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Check for saved theme preference or use dark mode by default
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    // Only apply light mode if explicitly saved
    body.classList.remove('dark-mode');
} else {
    // Default to dark mode
    body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // Save theme preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Discord username copy functionality
const discordLink = document.getElementById('discord-link');
const namePopup = document.getElementById('name-popup');
const DISCORD_USERNAME = 'arkanegd';

// Create notification element
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

discordLink.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(DISCORD_USERNAME);

        // Show notification
        notification.textContent = 'Discord username copied to clipboard!';
        notification.classList.add('show');

        // Hide notification after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy username:', err);
        notification.textContent = 'Failed to copy username';
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
});

namePopup.addEventListener('click', async () => {
    try {

        // Show notification
        notification.textContent = 'Also known as Celestia! 🏳️‍⚧️';
        notification.classList.add('show');

        // Hide notification after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    } catch (err) {
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}); 