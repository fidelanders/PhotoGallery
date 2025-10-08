// lazyload.js - reusable function to lazy-load images with class "lazy"
function initLazyLoad(selector = 'img.lazy', rootMargin = '150px') {
  const images = document.querySelectorAll(selector);
  if (!images.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src || img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.onload = () => img.classList.add('loaded');
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin });
    images.forEach(img => io.observe(img));
  } else {
    // fallback: load all images immediately
    images.forEach(img => {
      const src = img.dataset.src || img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.onload = () => img.classList.add('loaded');
      }
    });
  }
}

// expose globally
window.initLazyLoad = initLazyLoad;
