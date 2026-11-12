/**
 * Valentina Alemán Portfolio Boilerplate - Client Logic
 * Handles copy-to-clipboard and scroll observing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyEmail();
  initScrollSpy();
  initRadioPlayer();
  initCaseStudiesViewer();
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
  audio.crossOrigin = 'anonymous';

  // Synphaera Radio (Space Music) from SomaFM
  const STREAM_URL = 'https://ice6.somafm.com/synphaera-128-mp3';
  // MANGO radio stream (saved for later):
  // const STREAM_URL = 'https://stream.laut.fm/mangoradio';

  function playStream() {
    if (!audio.src || audio.src === '' || audio.src === window.location.href || !audio.src.startsWith('http')) {
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
    audio.removeAttribute('src');
    audio.load();
    playBtn.classList.remove('playing');
    playIcon.textContent = '▶';
  }

  // Toggle button click
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused || !audio.getAttribute('src')) {
      playStream();
    } else {
      pauseStream();
    }
  });

  // Attempt initial autoplay
  playStream();

  // If autoplay is blocked by browser policy, start on very first user interaction anywhere
  const unlockAutoplay = () => {
    if (audio.paused || !audio.getAttribute('src')) {
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

/**
 * Dynamic Case Studies Viewer (Open, Close, Inter-case navigation)
 */
function initCaseStudiesViewer() {
  const viewer = document.getElementById('case-studies-viewer');
  if (!viewer) return;

  const caseArticles = viewer.querySelectorAll('.project-case-study');
  const statusLabel = document.getElementById('caseViewerStatus');
  const gatewaySection = document.getElementById('work');

  function pauseAllVideos() {
    viewer.querySelectorAll('video').forEach((v) => {
      try {
        if (!v.paused) v.pause();
      } catch (err) {}
    });
  }

  // Ensure only one video plays at a time within the viewer
  viewer.addEventListener('play', (e) => {
    if (e.target && e.target.tagName === 'VIDEO') {
      viewer.querySelectorAll('video').forEach((v) => {
        if (v !== e.target && !v.paused) {
          v.pause();
        }
      });
    }
  }, true);

  function openCase(caseId, smoothScroll = true) {
    const targetArticle = document.getElementById(caseId);
    if (!targetArticle) return;

    // Pause any playing videos before switching cases
    pauseAllVideos();

    // Deactivate all cases, activate selected
    caseArticles.forEach((art) => art.classList.remove('is-active'));
    targetArticle.classList.add('is-active');

    // Open viewer container
    viewer.classList.add('is-open');

    // Autoplay videos in active case that have the autoplay attribute
    targetArticle.querySelectorAll('video[autoplay]').forEach((v) => {
      v.muted = true;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    });

    // Update status label
    const title = targetArticle.getAttribute('data-case-title') || 'CASE STUDY';
    if (statusLabel) {
      statusLabel.textContent = title;
    }

    // Scroll to viewer
    if (smoothScroll) {
      setTimeout(() => {
        const headerOffset = 85;
        const elementPosition = viewer.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50);
    }
  }

  function closeCase() {
    pauseAllVideos();

    if (gatewaySection) {
      const headerOffset = 70;
      const elementPosition = gatewaySection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    setTimeout(() => {
      viewer.classList.remove('is-open');
      caseArticles.forEach((art) => art.classList.remove('is-active'));
      if (window.location.hash.startsWith('#case-')) {
        history.pushState(null, '', '#work');
      }
    }, 350);
  }

  // Intercept clicks on gateway cards and triggers with data-case
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-case]');
    if (trigger) {
      const caseId = trigger.getAttribute('data-case');
      if (caseId) {
        e.preventDefault();
        openCase(caseId, true);
        history.pushState(null, '', '#' + caseId);
        return;
      }
    }

    // Intercept clicks on back to work / close buttons
    const closeTrigger = e.target.closest('.back-to-gateway-btn, .case-close-icon-btn, .back-to-gateway');
    if (closeTrigger) {
      const href = closeTrigger.getAttribute('href');
      if (!href || href === '#work') {
        e.preventDefault();
        closeCase();
      }
    }
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#case-')) {
      openCase(hash.substring(1), true);
    } else if (hash === '#work' || hash === '' || hash === '#hero' || hash === '#about' || hash === '#services' || hash === '#contact') {
      viewer.classList.remove('is-open');
      caseArticles.forEach((art) => art.classList.remove('is-active'));
    }
  });

  // Check initial hash on page load
  const initialHash = window.location.hash;
  if (initialHash && initialHash.startsWith('#case-')) {
    openCase(initialHash.substring(1), false);
  }
}

