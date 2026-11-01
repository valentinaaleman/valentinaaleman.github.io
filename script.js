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

  const STREAM_URL = 'https://stream.laut.fm/mangoradio';

  function playStream() {
    // Refresh src to attach to the live broadcast head
    if (!audio.src || audio.src === '') {
      audio.src = STREAM_URL;
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playBtn.classList.add('playing');
          playIcon.textContent = '❚❚';
        })
        .catch(() => {
          // Autoplay blocked by browser policy until user gesture
          playBtn.classList.remove('playing');
          playIcon.textContent = '▶';
        });
    }
  }

  function pauseStream() {
    audio.pause();
    // Reset src to drop buffer and stop background bandwidth consumption
    audio.src = '';
    playBtn.classList.remove('playing');
    playIcon.textContent = '▶';
  }

  // Toggle button click
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused || audio.src === '') {
      playStream();
    } else {
      pauseStream();
    }
  });

  // Attempt autoplay on page load
  playStream();

  // If autoplay is blocked by browser autoplay policy, resume on first user interaction
  const unlockAutoplay = () => {
    if (audio.paused || audio.src === '') {
      playStream();
    }
    window.removeEventListener('click', unlockAutoplay);
    window.removeEventListener('keydown', unlockAutoplay);
    window.removeEventListener('touchstart', unlockAutoplay);
  };

  window.addEventListener('click', unlockAutoplay, { once: true });
  window.addEventListener('keydown', unlockAutoplay, { once: true });
  window.addEventListener('touchstart', unlockAutoplay, { once: true });
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
