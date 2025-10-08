// main.js - site-wide initialization

// --- Image Generation and Shuffle Logic ---
window.portraits = [];

const totalImages = 148;
const basePath = "/assets/images/vow-renewal/";
const title = "Vow Renewal";

for (let i = 1; i <= totalImages; i++) {
  window.portraits.push({
    src: `${basePath}portrait-${i}.jpg`,
    title: title
  });
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// **Randomize the entire portfolio now, before the DOM is ready**
shuffleArray(window.portraits);

// --- Existing DOMContentLoaded and Lazy Load Logic (Keep the rest of main.js as is) ---
document.addEventListener("DOMContentLoaded", function () {
    if (window.AOS) AOS.init && AOS.init({ duration: 700, once: true });

    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(a => {
        const href = a.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
        else a.classList.remove("active");
    });

    document.querySelectorAll(".yr-js").forEach(el => el.textContent = new Date().getFullYear());

    window.initLazyLoad = function(selector = 'img.lazy', rootMargin = '150px') {
        const imgs = document.querySelectorAll(selector);
        if (!imgs.length) return;
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
            imgs.forEach(i => io.observe(i));
        } else {
            imgs.forEach(img => {
                const src = img.dataset.src || img.getAttribute('data-src');
                if (src) { img.src = src; img.onload = () => img.classList.add('loaded'); }
            });
        }
    };
});