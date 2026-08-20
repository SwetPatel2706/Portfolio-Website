document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinksContainer.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinksContainer.classList.remove('open');
      });
    });
  }

  // --- Active Nav Highlights on Scroll (Intersection Observer) ---
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // --- Project Category Filtering ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active filter button
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategories = (card.getAttribute('data-category') || '').split(' ');
        if (filterValue === 'all' || cardCategories.includes(filterValue)) {
          card.classList.remove('hidden');
          // Trigger slight animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // --- Resume Modal Actions ---
  const openResumeBtn = document.getElementById('open-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (openResumeBtn && resumeModal) {
    const openModal = () => {
      resumeModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      resumeModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    openResumeBtn.addEventListener('click', openModal);
    
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking on the backdrop
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal || e.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // --- Interactive Contact Form Submission ---
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const formStatus = document.getElementById('form-status');
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (contactForm && submitBtn) {
    const setStatus = (message, type) => {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.className = `form-status form-status-${type}`;
    };

    const setInputError = (input, hasError) => {
      input.style.borderColor = hasError ? '#ef4444' : '';
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', '');

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      let isValid = true;
      [nameInput, emailInput, messageInput].forEach(input => {
        const invalid = !input || !input.value.trim() || (input === emailInput && !EMAIL_REGEX.test(input.value.trim()));
        if (invalid) {
          if (input) setInputError(input, true);
          isValid = false;
        } else {
          if (input) setInputError(input, false);
        }
      });

      if (!isValid) {
        setStatus('Please fill in all fields with a valid email.', 'error');
        return;
      }

      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim()
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message.');
        }

        submitBtn.innerHTML = '<span>Message Sent!</span>';
        submitBtn.style.background = '#22c55e';
        contactForm.reset();
        setStatus('Thanks! Your message has been sent.', 'success');
      } catch (err) {
        submitBtn.innerHTML = originalContent;
        setStatus(err.message || 'Something went wrong. Please try again later.', 'error');
      } finally {
        submitBtn.disabled = false;
        setTimeout(() => {
          if (submitBtn.innerHTML.includes('Message Sent')) {
            submitBtn.innerHTML = originalContent;
            submitBtn.style.background = '';
          }
        }, 3000);
      }
    });
  }
});
