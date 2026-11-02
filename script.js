/**
 * Valentina Alemán Portfolio Boilerplate - Client Logic
 * Handles copy-to-clipboard and scroll observing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyEmail();
  initScrollSpy();
  initRadioPlayer();
});

/**
 * Real-time Live Radio Player (MangoRadio2)
 */
function initRadioPlayer() {
  const audio = document.getElementById('radioAudio');
  const playBtn = document.getElementById('radioPlayBtn');
  const playIcon = document.getElementById('radioPlayIcon');

  if (!audio || !playBtn || !playIcon) return;

  // Set default volume (reduced 30% more from 0.5 to 0.2)
  audio.volume = 0.2;

  const STREAM_URL = 'https://stream.laut.fm/mangoradio';

  function playStream() {
    if (!audio.src || audio.src === '' || audio.src === window.location.href) {
      audio.src = STREAM_URL;
      audio.load();
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playBtn.classList.add('playing');
          playIcon.textContent = '❚❚';
        })
        .catch((err) => {
          // Autoplay blocked by browser policy until user gesture
          console.warn('Autoplay blocked, awaiting user click:', err);
          playBtn.classList.remove('playing');
          playIcon.textContent = '▶';
        });
    }
  }

  function pauseStream() {
    audio.pause();
    audio.src = '';
    playBtn.classList.remove('playing');
    playIcon.textContent = '▶';
  }

  // Toggle button click
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused || !audio.src || audio.src === '' || audio.src === window.location.href) {
      playStream();
    } else {
      pauseStream();
    }
  });

  // Attempt initial autoplay
  playStream();

  // If autoplay is blocked by browser policy, start on very first user interaction anywhere
  const unlockAutoplay = () => {
    if (audio.paused || !audio.src || audio.src === '' || audio.src === window.location.href) {
      playStream();
    }
  };

  document.addEventListener('pointerdown', unlockAutoplay, { once: true });
  document.addEventListener('keydown', unlockAutoplay, { once: true });
}

/**
 * Copy email to clipboard with UI feedback
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copyEmailBtn');
  if (!copyBtn) return;

  const originalText = copyBtn.querySelector('.copy-text')?.textContent || 'Copy Email Address';
  const emailToCopy = copyBtn.getAttribute('data-email') || 'valenalemanb@gmail.com';

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailToCopy);
      const textSpan = copyBtn.querySelector('.copy-text');
      if (textSpan) {
        textSpan.textContent = '✓ Copied to clipboard!';
        copyBtn.style.borderColor = 'var(--color-accent)';
        setTimeout(() => {
          textSpan.textContent = originalText;
          copyBtn.style.borderColor = '';
        }, 2500);
      }
    } catch (err) {
      // Fallback for browsers with restricted clipboard permission
      window.location.href = `mailto:${emailToCopy}`;
    }
  });
}

/**
 * Highlight active section in navigation
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}
