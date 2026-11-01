/**
 * Valentina Alemán Portfolio Boilerplate - Client Logic
 * Handles two-color inversion, copy-to-clipboard, and scroll observing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCopyEmail();
  initScrollSpy();
});

/**
 * 2-Color Palette Invert Mode
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('vab_theme') || 'dark';
  document.body.setAttribute('data-theme', currentTheme);

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyInverted = document.body.getAttribute('data-theme') === 'inverted';
    const nextTheme = isCurrentlyInverted ? 'dark' : 'inverted';
    
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('vab_theme', nextTheme);

    const toggleText = toggleBtn.querySelector('.toggle-text');
    if (toggleText) {
      toggleText.textContent = nextTheme === 'inverted' ? '2-COLOR NORMAL' : '2-COLOR INVERT';
    }
  });
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
