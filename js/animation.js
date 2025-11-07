/**
 * animation.js
 * -------------------------------------------------
 * Re-usable animation helpers for the Smart Auto Electrics site
 *
 * 1. AOS (fade-up, zoom-in, etc.)
 * 2. Lazy-load videos (data-src attribute)
 * 3. Timeline line-growth effect (process pages)
 * 4. (Optional) Simple drag-to-scroll slider
 *
 * Add this file once and include it with:
 *   <script src="js/animation.js" defer></script>
 */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------
   * 1. AOS – Animate On Scroll
   * ------------------------------------------------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,   // default – can be overridden per-page with data-aos-duration
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });
  }

  /* -------------------------------------------------
   * 2. Lazy-load <video> elements
   *    • <video data-src="…">               → load src
   *    • <video><source data-src="…"></video> → load source
   * ------------------------------------------------- */
  const lazyVideos = document.querySelectorAll('video[loading="lazy"], video[data-src]');
  if (lazyVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const video = entry.target;

        // Case 1: data-src on <video>
        if (video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
          delete video.dataset.src;
        }

        // Case 2: data-src on <source>
        const source = video.querySelector('source[data-src]');
        if (source) {
          source.src = source.dataset.src;
          video.load();
        }

        observer.unobserve(video);
      });
    }, { rootMargin: '0px 0px 200px 0px' });

    lazyVideos.forEach(v => videoObserver.observe(v));
  }

  /* -------------------------------------------------
   * 3. Timeline line-growth animation
   *    .timeline-step → append .timeline-line + animate height
   * ------------------------------------------------- */
  const timelineSteps = document.querySelectorAll('.timeline-step');
  if (timelineSteps.length && 'IntersectionObserver' in window) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const step = entry.target;
        const line = document.createElement('div');
        line.className = 'timeline-line';
        step.appendChild(line);

        // Trigger reflow then animate
        requestAnimationFrame(() => {
          line.style.height = '100%';
        });

        // Stop observing after first appearance
        lineObserver.unobserve(step);
      });
    }, { threshold: 0.5 });

    timelineSteps.forEach(step => lineObserver.observe(step));
  }

  /* -------------------------------------------------
   * 4. (Optional) Simple drag-to-scroll slider
   *    Add class="draggable-slider" to any container
   * ------------------------------------------------- */
  const sliders = document.querySelectorAll('.draggable-slider');
  sliders.forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.style.cursor = 'grab';

    const start = e => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const leave = () => {
      isDown = false;
      slider.classList.remove('active');
    };
    const move = e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // multiplier for speed
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', start);
    slider.addEventListener('mouseleave', leave);
    slider.addEventListener('mouseup', leave);
    slider.addEventListener('mousemove', move);
  });
});

/* -------------------------------------------------
 * CSS needed for the timeline line (inject once)
 * ------------------------------------------------- */
const timelineCSS = `
.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  width: 4px;
  background: linear-gradient(to bottom, #19D8F8, #013E75);
  transform: translateX(-50%);
  height: 0;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(25, 216, 248, 0.6);
  transition: height 1.5s ease-out;
}
@media (max-width: 768px) { .timeline-line { display: none; } }
`;

if (!document.getElementById('animation-timeline-style')) {
  const style = document.createElement('style');
  style.id = 'animation-timeline-style';
  style.textContent = timelineCSS;
  document.head.appendChild(style);
}