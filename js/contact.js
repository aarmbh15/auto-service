// Video Autoplay Logic (CLEAN)
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('workshop-video');
  if (!video) return;

  let hasPlayed = false;
  let userInteracted = false;

  const tryPlay = () => {
    return video.play().then(() => {
      hasPlayed = true;
    }).catch((err) => {
      console.log('Play interrupted:', err);
    });
  };

  // Attempt silent autoplay on load (muted + playsinline required in HTML)
  tryPlay();

  // Play on first user interaction (click/touch) - removes listeners after first trigger
  const playOnInteract = () => {
    userInteracted = true;
    if (!hasPlayed) tryPlay();
    document.removeEventListener('click', playOnInteract);
    document.removeEventListener('touchstart', playOnInteract);
  };
  document.addEventListener('click', playOnInteract);
  document.addEventListener('touchstart', playOnInteract);

  // Intersection Observer: Play/resume when in view, pause when out
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Resume or start playback when 50% visible
          if (video.paused) {
            tryPlay();
          }
        } else {
          // Pause when leaving viewport (preserves currentTime)
          if (!video.paused) {
            video.pause();
          }
        }
      });
    },
    { threshold: 0.5 } // Trigger at 50% visibility
  );

  observer.observe(video);

  // Ensure video is muted, loops, and plays inline (critical for mobile autoplay)
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
});

// Enhanced Lazy Validation + Honeypot + Extra Rules
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const phoneInput = form.elements.phone;
  const vehicleInput = form.elements.vehicle;
  const serviceSelect = form.elements.service;
  const dateInput = form.elements.date;
  const messageTextarea = form.elements.message;
  const honeypot = form.elements.honeypot;
  const charCount = document.getElementById('charCount');

  // Track touched fields
  const touched = {};

  // Error elements
  const errorMsgs = form.querySelectorAll('.error-msg');

  // Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[A-Za-z\s]+$/; // Letters and spaces only
  const phoneRegex = /^(\+44|0)?[0-9\s]{10,15}$/; // UK-friendly: optional +44 or 0, 10-15 digits/spaces

  // Date min: 24h from now (rounded to next hour)
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  minDate.setMinutes(0, 0, 0);
  const minDateTime = minDate.toISOString().slice(0, 16);
  dateInput.min = minDateTime;

  // Char count
  const updateCharCount = () => {
    charCount.textContent = `${messageTextarea.value.length}/250`;
  };
  messageTextarea.addEventListener('input', updateCharCount);
  updateCharCount();

  // Show/hide error
  const showError = (input, show) => {
    const container = input.parentElement;
    const error = container.querySelector('.error-msg');
    if (error) error.classList.toggle('hidden', !show);
    input.classList.toggle('border-red-500', show);
  };

  // Validation
  const validateForm = () => {
    let allValid = true;

    // Name: 2+ chars, letters/spaces only
    const nameValid = nameInput.value.trim().length >= 2 && nameRegex.test(nameInput.value.trim());
    if (touched.name) showError(nameInput, !nameValid);
    if (!nameValid) allValid = false;

    // Email
    const emailValid = emailRegex.test(emailInput.value.trim());
    if (touched.email) showError(emailInput, !emailValid);
    if (!emailValid) allValid = false;

    // Phone: UK format
    const phoneValid = phoneRegex.test(phoneInput.value.replace(/[\s-]/g, ''));
    if (touched.phone) showError(phoneInput, !phoneValid);
    if (!phoneValid) allValid = false;

    // Vehicle: optional, max 100 chars
    const vehicleValid = vehicleInput.value.length <= 100;
    if (touched.vehicle && !vehicleValid) {
      showError(vehicleInput, true);
      allValid = false;
    } else if (touched.vehicle) {
      showError(vehicleInput, false);
    }

    // Service
    const serviceValid = serviceSelect.value !== '';
    if (touched.service) showError(serviceSelect, !serviceValid);
    if (!serviceValid) allValid = false;

    // Date: optional, but >= 24h if filled
    let dateValid = true;
    if (dateInput.value && dateInput.value < minDateTime) dateValid = false;
    if (touched.date) showError(dateInput, !dateValid);
    if (!dateValid) allValid = false;

    // Honeypot: must be empty
    if (honeypot.value !== '') allValid = false;

    // Update button
    submitBtn.disabled = !allValid;
    submitBtn.classList.toggle('bg-primary/50', !allValid);
    submitBtn.classList.toggle('cursor-not-allowed', !allValid);
    submitBtn.classList.toggle('bg-primary', allValid);
    submitBtn.classList.toggle('hover:shadow-neon', allValid);
    submitBtn.classList.toggle('cursor-pointer', allValid);

    return allValid;
  };

  // Mark touched on blur/change
  const markTouched = (field, input) => {
    touched[field] = true;
    validateForm();
  };
  nameInput.addEventListener('blur', () => markTouched('name', nameInput));
  emailInput.addEventListener('blur', () => markTouched('email', emailInput));
  phoneInput.addEventListener('blur', () => markTouched('phone', phoneInput));
  vehicleInput.addEventListener('blur', () => markTouched('vehicle', vehicleInput));
  serviceSelect.addEventListener('change', () => markTouched('service', serviceSelect));
  dateInput.addEventListener('blur', () => markTouched('date', dateInput));

  // Real-time updates (no errors)
  [nameInput, emailInput, phoneInput, vehicleInput, dateInput, messageTextarea].forEach(el => {
    el.addEventListener('input', validateForm);
  });
  serviceSelect.addEventListener('change', validateForm);

  // Submit
  let isSubmitting = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Mark all touched
    ['name', 'email', 'phone', 'vehicle', 'service', 'date'].forEach(f => touched[f] = true);

    if (isSubmitting || !validateForm() || honeypot.value !== '') {
      validateForm(); // Show all errors
      Swal.fire({
        icon: 'warning',
        title: 'Please Fix Errors',
        text: 'Check the fields highlighted in red and correct the issues before submitting.',
        confirmButtonColor: '#19D8F8',
        background: '#000',
        color: '#fff'
      });
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    const formData = new FormData(form);

    try {
      const response = await fetch('http://localhost/contact_auto.php', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }

      if (data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Thank You! 🚗',
          html: `
            <p class="text-lg">We've received your booking request!</p>
            <p>Our team will review your details and get back to you within 24 hours to confirm your appointment.</p>
            <p class="font-bold mt-4">What happens next?</p>
            <ul class="text-left list-disc pl-6">
              <li>We'll call or email you shortly.</li>
              <li>Check your inbox (and spam folder) for updates.</li>
              <li>Feel free to WhatsApp us if you have questions!</li>
            </ul>
          `,
          confirmButtonText: 'OK!',
          confirmButtonColor: '#19D8F8',
          background: '#000',
          color: '#fff',
          allowOutsideClick: false
        });
        form.reset();
        Object.keys(touched).forEach(k => touched[k] = false);
        errorMsgs.forEach(msg => msg.classList.add('hidden'));
        updateCharCount();
        validateForm();
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Almost There!',
          text: data.message || 'Please try again or call us.',
          confirmButtonColor: '#19D8F8',
          background: '#000',
          color: '#fff'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong. Try again or contact via phone/WhatsApp.',
        confirmButtonColor: '#19D8F8',
        background: '#000',
        color: '#fff'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request';
      isSubmitting = false;
    }
  });

  // Initial state
  validateForm();
});