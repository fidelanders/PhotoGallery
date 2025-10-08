// gallery.js - populate gallery grid from shuffled global array (window.portraits)
(function () {
    // localPortraits now correctly references the globally defined and SHUFFLED array from main.js
    const localPortraits = window.portraits || [];

    /**
     * Creates a Bootstrap column element containing the portfolio item HTML.
     * @param {object} p - The portrait object ({ src: '...', title: '...' }).
     * @param {number} index - The index for AOS delay.
     * @returns {HTMLElement} The created column div.
     */
    function createPortfolioCol(p, index) {
        // Reworked Download Button: Create a clean, descriptive filename (Option 1).
        const cleanFilename = `${p.title.replace(/\s/g, '_')}_TECGL.jpg`;
        
        const col = document.createElement("div");
        // Use col-md-3 for 4 items per row on medium screens and up (4 * 3 = 12)
        col.className = "col-6 col-md-3"; 
        
        col.setAttribute("data-aos", "fade-up");
        if (index !== undefined) {
             // Add a subtle staggered animation effect
             col.setAttribute("data-aos-delay", index * 100); 
        }

        col.innerHTML = `
            <div class="portfolio-item">
                <img data-src="${p.src}" alt="${p.title}" class="img-fluid lazy">
                <div class="overlay">
                    <div class="d-flex">
                        <a href="view.html?img=${encodeURIComponent(p.src)}&title=${encodeURIComponent(p.title)}" class="btn btn-sm btn-outline-light px-3">View</a>
                        
                        <a href="${p.src}" 
                           download="${cleanFilename}" 
                           class="btn btn-sm btn-light text-dark px-3">Download</a>
                           
                    </div>
                </div>
            </div>
        `;
        return col;
    }

    document.addEventListener("DOMContentLoaded", function () {
        const galleryGrid = document.getElementById("galleryGrid");
        const featuredGrid = document.getElementById("featuredGallery");
        
        const totalAvailableImages = localPortraits.length;
        
        // --- 1. POPULATE FEATURED GALLERY (#featuredGallery) ---
        if (featuredGrid) {
            // Requirement: Display only 4 images
            const desiredFeaturedImages = 4; 
            
            // Robustly check image count to prevent blank cards if images are fewer than 4
            const numberOfFeaturedImages = Math.min(desiredFeaturedImages, totalAvailableImages);
            
            // Use the first N items from the SHUFFLED array
            localPortraits.slice(0, numberOfFeaturedImages).forEach((p, index) => featuredGrid.appendChild(createPortfolioCol(p, index)));
        }
        
        // --- 2. POPULATE FULL GALLERY (#galleryGrid) ---
        if (galleryGrid) {
            // Requirement: Display ALL images in random order (since the array is already shuffled)
            localPortraits.forEach((p, index) => galleryGrid.appendChild(createPortfolioCol(p, index)));
        }

        // --- 3. Initialize Lazy Load ---
        // Fallback for browsers without IntersectionObserver is preserved
        if (window.initLazyLoad) {
            window.initLazyLoad();
        } else {
            const lazyImgs = document.querySelectorAll('img.lazy');
            lazyImgs.forEach(img => {
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.onload = () => img.classList.add('loaded');
                }
            });
        }
    });
})();