/**
 * Valentina Alemán Portfolio Boilerplate - Client Logic
 * Handles copy-to-clipboard and scroll observing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyEmail();
  initScrollSpy();
  initCaseStudiesViewer();
  initWhatIBringHover();
  initDigitalPresenceModule();
});

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

  // Ensure only one unmuted video plays at a time within the viewer to avoid overlapping audio
  function pauseOtherAudibleVideos(activeVideo) {
    if (activeVideo && !activeVideo.muted) {
      viewer.querySelectorAll('video').forEach((v) => {
        if (v !== activeVideo && !v.paused && !v.muted) {
          v.pause();
        }
      });
    }
  }

  viewer.addEventListener('play', (e) => {
    if (e.target && e.target.tagName === 'VIDEO') {
      pauseOtherAudibleVideos(e.target);
    }
  }, true);

  viewer.addEventListener('volumechange', (e) => {
    if (e.target && e.target.tagName === 'VIDEO' && !e.target.paused) {
      pauseOtherAudibleVideos(e.target);
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

/**
 * What I Bring interactive cards (supports touch toggle on mobile/touch screens)
 */
function initWhatIBringHover() {
  const cards = document.querySelectorAll('.what-i-bring-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const isCurrentlyHovered = card.classList.contains('is-hovered');
      cards.forEach((c) => c.classList.remove('is-hovered'));
      if (!isCurrentlyHovered) {
        card.classList.add('is-hovered');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.what-i-bring-card')) {
      cards.forEach((c) => c.classList.remove('is-hovered'));
    }
  });
}

/**
 * Interactive Digital Presence Module
 * Handles diagnostic quiz flow, recommendation engine, view switching, and lead capture.
 */
function initDigitalPresenceModule() {
  const modal = document.getElementById('digital-presence-modal');
  const openBannerBtn = document.getElementById('btnOpenDigitalBanner') || document.getElementById('btnOpenDigitalCheck');
  const closeBtn = document.getElementById('dpModalCloseBtn');
  const backdrop = document.getElementById('dpModalBackdrop');

  if (!modal || !openBannerBtn) return;

  // Views & Navigation Buttons
  const views = {
    check: document.getElementById('dpViewCheck'),
    results: document.getElementById('dpViewResults'),
    lead: document.getElementById('dpViewLead'),
    overview: document.getElementById('dpViewOverview'),
    liveProject: document.getElementById('dpViewLiveProject')
  };

  const navBtns = {
    check: document.getElementById('dpNavBtnCheck'),
    overview: document.getElementById('dpNavBtnOverview'),
    liveProject: document.getElementById('dpNavBtnLiveProject')
  };

  // Cross-view Triggers
  const triggerToOverview = document.getElementById('dpLinkToOverview');
  const triggerBackToOverviewFromCheck = document.getElementById('dpBtnBackToOverviewFromCheck');
  const triggerBackToOverviewFromResults = document.getElementById('dpBtnBackToOverviewFromResults');
  const triggerStartCheckFromOverview = document.getElementById('dpBtnStartCheckFromOverview');
  const triggerExploreLiveFromOverview = document.getElementById('dpBtnExploreLiveFromOverview');
  const triggerStartCheckFromLive = document.getElementById('dpBtnStartCheckFromLive');
  const triggerBackToOverviewFromLive = document.getElementById('dpBtnBackToOverviewFromLive');
  const triggerRetakeQuiz = document.getElementById('dpBtnRetakeQuiz');
  const triggerViewLiveFromResults = document.getElementById('dpBtnViewLiveProjectFromResults');
  const triggerGoToLead = document.getElementById('dpBtnGoToLead');
  const triggerBackToResultsFromLead = document.getElementById('dpBtnBackToResultsFromLead');
  const triggerBackToOverviewFromLead = document.getElementById('dpBtnBackToOverviewFromLead');
  const triggerCloseSuccess = document.getElementById('dpBtnCloseSuccess');

  // Lead Form & Success Container Elements
  const leadFormContainer = document.getElementById('dpLeadFormContainer');
  const leadSuccessState = document.getElementById('dpLeadSuccessState');
  const successMessage = document.getElementById('dpSuccessMessage');
  const leadNavActions = document.getElementById('dpLeadNavActions');

  // Quiz DOM Elements
  const progressLabel = document.getElementById('dpProgressLabel');
  const progressBars = document.querySelectorAll('.dp-prog-bar');
  const questionTitle = document.getElementById('dpQuestionTitle');
  const optionsList = document.getElementById('dpOptionsList');
  const btnBack = document.getElementById('dpBtnBack');
  const btnNext = document.getElementById('dpBtnNext');
  const recommendationsGrid = document.getElementById('dpRecommendationsGrid');

  // Lead Form Elements
  const leadForm = document.getElementById('dpLeadForm');
  const leadName = document.getElementById('dpLeadName');
  const leadCompany = document.getElementById('dpLeadCompany');
  const leadEmail = document.getElementById('dpLeadEmail');
  const leadNotes = document.getElementById('dpLeadNotes');
  const leadConsent = document.getElementById('dpLeadConsent');
  const btnSubmitLead = document.getElementById('dpBtnSubmitLead');
  const btnResendEye = document.getElementById('dpBtnResendEye');
  const formFeedback = document.getElementById('dpFormFeedback');

  const nameError = document.getElementById('dpNameError');
  const companyError = document.getElementById('dpCompanyError');
  const emailError = document.getElementById('dpEmailError');
  const consentError = document.getElementById('dpConsentError');

  // 5 Diagnostic Questions
  const questions = [
    {
      title: 'Does your business have a website?',
      options: [
        { label: 'Yes — And it is up to date', key: 'up_to_date' },
        { label: 'Yes — But it needs improvement', key: 'needs_improvement' },
        { label: "No — We don't have a website yet", key: 'not_yet' }
      ]
    },
    {
      title: 'How easily can customers find you online?',
      options: [
        { label: 'Very easily', key: 'very_easily' },
        { label: 'I’m not sure', key: 'not_sure' },
        { label: 'We struggle with visibility', key: 'struggle' }
      ]
    },
    {
      title: 'What is your website’s main objective?',
      options: [
        { label: 'Generate inquiries or leads', key: 'leads' },
        { label: 'Sell products or services', key: 'sales' },
        { label: 'Present our business', key: 'presentation' },
        { label: 'We haven’t defined it', key: 'undefined' }
      ]
    },
    {
      title: 'How do you currently handle repetitive business tasks?',
      options: [
        { label: 'Mostly automated', key: 'mostly_automated' },
        { label: 'A mix of manual and automated', key: 'mix' },
        { label: 'Mostly manual', key: 'mostly_manual' }
      ]
    },
    {
      title: 'What would you most like to improve?',
      options: [
        { label: 'Website experience', key: 'website_experience' },
        { label: 'Search visibility (SEO)', key: 'seo' },
        { label: 'Business automation', key: 'automation' }
      ]
    }
  ];

  const totalSteps = questions.length;
  let currentStep = 0;
  const userAnswers = [null, null, null, null, null];
  let generatedRecommendations = [];

  // Open & Close Modal
  function openModal(initialView = 'overview') {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    switchView(initialView);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Switch between views: check, results, overview, liveProject
  function switchView(viewKey) {
    Object.keys(views).forEach((k) => {
      if (views[k]) {
        if (k === viewKey) {
          views[k].classList.add('dp-view-active');
        } else {
          views[k].classList.remove('dp-view-active');
        }
      }
    });

    Object.keys(navBtns).forEach((k) => {
      if (navBtns[k]) {
        if (k === viewKey) {
          navBtns[k].classList.add('is-active');
        } else {
          navBtns[k].classList.remove('is-active');
        }
      }
    });

    // Reset scroll of modal body when switching views
    const modalBody = modal.querySelector('.dp-modal-body');
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  }

  // Render question step
  function renderQuestionStep(stepIndex) {
    currentStep = stepIndex;
    const qData = questions[stepIndex];
    if (!qData) return;

    // Update progress label and bars
    if (progressLabel) {
      progressLabel.textContent = `QUESTION ${stepIndex + 1} OF ${totalSteps}`;
    }

    progressBars.forEach((bar, idx) => {
      bar.classList.remove('dp-prog-active', 'dp-prog-completed');
      if (idx < stepIndex) {
        bar.classList.add('dp-prog-completed');
      } else if (idx === stepIndex) {
        bar.classList.add('dp-prog-active');
      }
    });

    // Update question title
    if (questionTitle) {
      questionTitle.textContent = qData.title;
    }

    // Render options
    if (optionsList) {
      optionsList.innerHTML = '';
      const currentSelectedKey = userAnswers[stepIndex];

      qData.options.forEach((opt, optIdx) => {
        const optionId = `dpOpt_${stepIndex}_${optIdx}`;
        const isSelected = currentSelectedKey === opt.key;

        const label = document.createElement('label');
        label.className = `dp-option-label${isSelected ? ' is-selected' : ''}`;
        label.setAttribute('for', optionId);

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `dp_question_${stepIndex}`;
        radio.id = optionId;
        radio.className = 'dp-option-radio';
        radio.value = opt.key;
        radio.checked = isSelected;

        const indicator = document.createElement('span');
        indicator.className = 'dp-radio-indicator';
        indicator.setAttribute('aria-hidden', 'true');

        const text = document.createElement('span');
        text.className = 'dp-option-text';
        text.textContent = opt.label;

        label.appendChild(radio);
        label.appendChild(indicator);
        label.appendChild(text);

        const selectOption = () => {
          radio.checked = true;
          userAnswers[stepIndex] = opt.key;
          optionsList.querySelectorAll('.dp-option-label').forEach((l) => l.classList.remove('is-selected'));
          label.classList.add('is-selected');
          if (btnNext) btnNext.disabled = false;
        };

        label.addEventListener('click', (e) => {
          e.preventDefault();
          selectOption();
        });

        radio.addEventListener('change', selectOption);

        optionsList.appendChild(label);
      });
    }

    // Configure Back and Next buttons
    if (btnBack) {
      btnBack.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    }

    if (btnNext) {
      btnNext.disabled = userAnswers[stepIndex] === null;
      btnNext.textContent = stepIndex === questions.length - 1 ? 'SEE MY RESULTS →' : 'NEXT →';
    }
  }

  // Calculate results & build snapshot
  function computeResults() {
    const q1 = userAnswers[0];
    const q2 = userAnswers[1];
    const q3 = userAnswers[2];
    const q4 = userAnswers[3];
    const q5 = userAnswers[4];

    const recommendations = [];

    // Rule 1: Website Design & Development
    if (
      q1 === 'needs_improvement' ||
      q1 === 'not_yet' ||
      q3 === 'undefined' ||
      q5 === 'website_experience'
    ) {
      recommendations.push({
        title: 'WEBSITE DESIGN & DEVELOPMENT',
        tag: 'This is how you’ll be remembered.',
        desc: 'Your website experience or business objectives may benefit from further review.'
      });
    }

    // Rule 2: Search Engine Optimization (SEO)
    if (
      q2 === 'not_sure' ||
      q2 === 'struggle' ||
      q5 === 'seo'
    ) {
      recommendations.push({
        title: 'SEARCH ENGINE OPTIMIZATION (SEO)',
        tag: 'This is how you’ll be found.',
        desc: 'Your search visibility may offer opportunities worth investigating.'
      });
    }

    // Rule 3: Business Automation
    if (
      q4 === 'mix' ||
      q4 === 'mostly_manual' ||
      q5 === 'automation'
    ) {
      recommendations.push({
        title: 'BUSINESS AUTOMATION',
        tag: 'This is how you save time.',
        desc: 'Some repetitive processes may be candidates for automation.'
      });
    }

    // Rule 4: Fallback
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'CONTINUOUS OPTIMIZATION',
        tag: 'This is how you keep growing.',
        desc: 'Your answers suggest a solid starting point. A deeper review could identify further improvements.'
      });
    }

    generatedRecommendations = recommendations;

    // Render cards into grid
    if (recommendationsGrid) {
      recommendationsGrid.innerHTML = '';
      recommendations.forEach((rec) => {
        const card = document.createElement('div');
        card.className = 'dp-rec-card';

        const title = document.createElement('h4');
        title.className = 'dp-rec-card-title';
        title.textContent = rec.title;

        const tag = document.createElement('p');
        tag.className = 'dp-rec-card-tag';
        tag.textContent = rec.tag;

        const desc = document.createElement('p');
        desc.className = 'dp-rec-card-desc';
        desc.textContent = rec.desc;

        card.appendChild(title);
        card.appendChild(tag);
        card.appendChild(desc);
        recommendationsGrid.appendChild(card);
      });
    }

    switchView('results');
  }

  // Quiz Navigation Listeners
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentStep < questions.length - 1) {
        renderQuestionStep(currentStep + 1);
      } else {
        computeResults();
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (currentStep > 0) {
        renderQuestionStep(currentStep - 1);
      }
    });
  }

  // View Triggers
  if (openBannerBtn) {
    openBannerBtn.addEventListener('click', () => {
      openModal('overview');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Cross-view action links
  if (triggerBackToOverviewFromCheck) {
    triggerBackToOverviewFromCheck.addEventListener('click', () => switchView('overview'));
  }
  if (triggerBackToOverviewFromResults) {
    triggerBackToOverviewFromResults.addEventListener('click', () => switchView('overview'));
  }
  if (triggerStartCheckFromOverview) {
    triggerStartCheckFromOverview.addEventListener('click', () => {
      switchView('check');
      renderQuestionStep(0);
    });
  }
  if (triggerExploreLiveFromOverview) {
    triggerExploreLiveFromOverview.addEventListener('click', () => switchView('liveProject'));
  }
  if (triggerStartCheckFromLive) {
    triggerStartCheckFromLive.addEventListener('click', () => {
      switchView('check');
      renderQuestionStep(0);
    });
  }
  if (triggerBackToOverviewFromLive) {
    triggerBackToOverviewFromLive.addEventListener('click', () => switchView('overview'));
  }
  if (triggerGoToLead) {
    triggerGoToLead.addEventListener('click', () => switchView('lead'));
  }
  if (triggerBackToResultsFromLead) {
    triggerBackToResultsFromLead.addEventListener('click', () => switchView('results'));
  }
  if (triggerBackToOverviewFromLead) {
    triggerBackToOverviewFromLead.addEventListener('click', () => switchView('overview'));
  }
  if (triggerCloseSuccess) {
    triggerCloseSuccess.addEventListener('click', () => {
      closeModal();
      setTimeout(() => {
        if (leadFormContainer) leadFormContainer.hidden = false;
        if (leadSuccessState) leadSuccessState.hidden = true;
        if (leadNavActions) leadNavActions.hidden = false;
        switchView('overview');
      }, 400);
    });
  }
  if (triggerRetakeQuiz) {
    triggerRetakeQuiz.addEventListener('click', () => {
      userAnswers.fill(null);
      if (leadFormContainer) leadFormContainer.hidden = false;
      if (leadSuccessState) leadSuccessState.hidden = true;
      if (leadNavActions) leadNavActions.hidden = false;
      if (btnSubmitLead) {
        btnSubmitLead.disabled = false;
        btnSubmitLead.textContent = 'REQUEST A CUSTOM REVIEW →';
      }
      if (formFeedback) {
        formFeedback.hidden = true;
        formFeedback.className = 'dp-form-feedback';
        formFeedback.textContent = '';
      }
      switchView('check');
      renderQuestionStep(0);
    });
  }
  if (triggerViewLiveFromResults) {
    triggerViewLiveFromResults.addEventListener('click', () => switchView('liveProject'));
  }

  // Form Validation & Submission
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Validate Name
      if (!leadName.value.trim()) {
        leadName.classList.add('has-error');
        if (nameError) nameError.classList.add('is-visible');
        isValid = false;
      } else {
        leadName.classList.remove('has-error');
        if (nameError) nameError.classList.remove('is-visible');
      }

      // Validate Company
      if (!leadCompany.value.trim()) {
        leadCompany.classList.add('has-error');
        if (companyError) companyError.classList.add('is-visible');
        isValid = false;
      } else {
        leadCompany.classList.remove('has-error');
        if (companyError) companyError.classList.remove('is-visible');
      }

      // Validate Email
      if (!emailRegex.test(leadEmail.value.trim())) {
        leadEmail.classList.add('has-error');
        if (emailError) emailError.classList.add('is-visible');
        isValid = false;
      } else {
        leadEmail.classList.remove('has-error');
        if (emailError) emailError.classList.remove('is-visible');
      }

      // Validate Consent
      if (!leadConsent.checked) {
        if (consentError) consentError.classList.add('is-visible');
        isValid = false;
      } else {
        if (consentError) consentError.classList.remove('is-visible');
      }

      if (!isValid) return;

      // Prepare detailed answers and payload
      const formattedAnswers = questions.map((q, idx) => {
        const answerKey = userAnswers[idx];
        const option = q.options.find((opt) => opt.key === answerKey);
        return {
          question: q.title,
          answer: option ? option.label : 'Not answered'
        };
      });

      const clientNameVal = leadName.value.trim();
      const clientCompanyVal = leadCompany.value.trim();

      const assessmentData = {
        timestamp: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }),
        client: {
          name: clientNameVal,
          company: clientCompanyVal,
          email: leadEmail.value.trim(),
          notes: leadNotes ? leadNotes.value.trim() : ''
        },
        answers: userAnswers,
        detailedAnswers: formattedAnswers,
        recommendations: generatedRecommendations
      };

      if (btnSubmitLead) {
        btnSubmitLead.disabled = true;
        btnSubmitLead.textContent = 'SENDING...';
      }

      fetch('https://valentina-lead-contact.guillejesus.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          if (btnSubmitLead) {
            btnSubmitLead.textContent = '✓ REQUEST SENT';
          }
          if (leadSuccessState && leadFormContainer) {
            if (successMessage) {
              successMessage.textContent = `Thank you, ${clientNameVal}. We have received your information. We will review the identified opportunities and get in touch with you via email.`;
            }
            leadFormContainer.hidden = true;
            leadSuccessState.hidden = false;
            if (leadNavActions) leadNavActions.hidden = true;
          }
        } else {
          throw new Error(data.error || 'Error al procesar la solicitud');
        }
      })
      .catch((err) => {
        console.error('Submission error:', err);
        if (btnSubmitLead) {
          btnSubmitLead.disabled = false;
          btnSubmitLead.textContent = 'RETRY SENDING →';
        }
        if (formFeedback) {
          formFeedback.hidden = false;
          formFeedback.className = 'dp-form-feedback is-error';
          formFeedback.textContent = 'There was an issue submitting your request. Please try again.';
        }
      });
    });

    // Clear field errors on input
    [leadName, leadCompany, leadEmail].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('has-error');
          const errEl = document.getElementById(input.id.replace('dpLead', 'dp') + 'Error');
          if (errEl) errEl.classList.remove('is-visible');
        });
      }
    });

    if (leadConsent) {
      leadConsent.addEventListener('change', () => {
        if (consentError) consentError.classList.remove('is-visible');
      });
    }

    if (btnResendEye) {
      btnResendEye.addEventListener('click', () => {
        if (leadFormContainer) leadFormContainer.hidden = false;
        if (leadSuccessState) leadSuccessState.hidden = true;
        if (leadNavActions) leadNavActions.hidden = false;
        if (btnSubmitLead) {
          btnSubmitLead.disabled = false;
          btnSubmitLead.textContent = 'REQUEST A CUSTOM REVIEW →';
        }
        if (formFeedback) {
          formFeedback.hidden = true;
          formFeedback.className = 'dp-form-feedback';
          formFeedback.textContent = '';
        }
        btnResendEye.classList.add('is-active');
        setTimeout(() => {
          btnResendEye.classList.remove('is-active');
        }, 400);
      });
    }
  }

  // Pre-render step 0
  renderQuestionStep(0);
}


