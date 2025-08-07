// Theme: dark by default, persist preference
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.classList.remove('dark-mode');
} else {
  body.classList.add('dark-mode');
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  });
}

// Discord copy + toast
const discordLink = document.getElementById('discord-link');
const namePopup = document.getElementById('name-popup');
const DISCORD_USERNAME = 'arkanegd';

const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

function showToast(message) {
  notification.textContent = message;
  notification.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => notification.classList.remove('show'), 2000);
}

discordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await navigator.clipboard.writeText(DISCORD_USERNAME);
    showToast('Discord username copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy username:', err);
    showToast('Failed to copy username');
  }
});

namePopup.addEventListener('click', () => {
  showToast('Also known as Celestia! 🏳️‍⚧️');
});

// Subtle 3D tilt interaction for cards and avatar
const tiltElements = document.querySelectorAll('.tilt');
const constrain = 14; // lower is more tilt

function applyTilt(event, element) {
  const rect = element.getBoundingClientRect();
  const relX = event.clientX - rect.left;
  const relY = event.clientY - rect.top;
  const rx = ((relY - rect.height / 2) / rect.height) * -constrain;
  const ry = ((relX - rect.width / 2) / rect.width) * constrain;
  element.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
}

function resetTilt(element) {
  element.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
}

tiltElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => applyTilt(e, el));
  el.addEventListener('mouseleave', () => resetTilt(el));
  el.addEventListener('mouseenter', () => el.style.willChange = 'transform');
});