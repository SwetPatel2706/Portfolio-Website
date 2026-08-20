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

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      // Simple validation feedback
      let isValid = true;
      [nameInput, emailInput, messageInput].forEach(input => {
        if (!input || !input.value.trim()) {
          if (input) input.style.borderColor = '#ef4444';
          isValid = false;
        } else {
          if (input) input.style.borderColor = '';
        }
      });

      if (!isValid) return;

      // Simulate sending progress
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<span>Message Sent!</span>';
        submitBtn.style.background = '#22c55e';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalContent;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 1200);
    });
  }
});
