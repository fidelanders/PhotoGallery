/* js/main.js
 - Gallery and view page logic
 - Lazy loading images
 - Nav highlight
 - Universal image download
 - EXIF display
*/

// ----- CONFIG: local portraits -----
const portraits = [
  { src: "assets/images/portraits/photo1.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo2.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo3.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo4.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo5.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo6.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo7.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo8.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo9.jpg", title: "Vow renewal photos" },
  { src: "assets/images/portraits/photo10.jpg", title: "Vow renewal photos" }
];

// ----- Create gallery card -----
function createPortfolioCol(p) {
  const col = document.createElement("div");
  col.className = "col-6 col-md-4 col-lg-3";
  col.setAttribute("data-aos", "fade-up");

  col.innerHTML = `
    <div class="portfolio-item position-relative overflow-hidden rounded shadow-sm">
      <img data-src="${p.src}" alt="${p.title}" class="img-fluid lazy rounded">
      <div class="overlay d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex gap-2">
          <a href="view.html?img=${encodeURIComponent(p.src)}&title=${encodeURIComponent(p.title)}" 
             class="btn btn-sm btn-outline-light px-3">View</a>
          <a href="#" class="btn btn-sm btn-light text-dark px-3 download-btn">Download</a>
        </div>
      </div>
    </div>`;

  const downloadBtn = col.querySelector(".download-btn");
  downloadBtn.addEventListener("click", () => {
    const img = new Image();
    img.src = p.src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = p.title.replace(/\s+/g, "_") + ".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  });

  return col;
}

// ----- Populate grids -----
function populateGrids() {
  const featuredEl = document.getElementById("featuredGallery");
  if (featuredEl) portraits.slice(0, 4).forEach(p => featuredEl.appendChild(createPortfolioCol(p)));

  const galleryEl = document.getElementById("galleryGrid");
  if (galleryEl) portraits.forEach(p => galleryEl.appendChild(createPortfolioCol(p)));
}

// ----- Lazy load -----
function initLazyLoading() {
  const lazyImgs = document.querySelectorAll("img.lazy");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "150px 0px" });
    lazyImgs.forEach(img => io.observe(img));
  } else {
    lazyImgs.forEach(img => {
      img.src = img.dataset.src;
      img.onload = () => img.classList.add("loaded");
    });
  }
}

// ----- Highlight nav -----
function highlightNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === path);
  });
}

// ----- View page -----
function handleViewPage() {
  const params = new URLSearchParams(window.location.search);
  const imgParam = params.get("img");
  const titleParam = params.get("title") || "Portrait";
  if (!imgParam) return;

  const imgUrl = decodeURIComponent(imgParam);
  const title = decodeURIComponent(titleParam);

  const photoTitle = document.getElementById("photoTitle");
  const photoWrap = document.getElementById("photoWrap");
  const downloadLink = document.getElementById("downloadLink");
  const openFull = document.getElementById("openFull");
  const exifPanel = document.getElementById("exifPanel");

  if (photoTitle) photoTitle.textContent = title;
  if (photoWrap) photoWrap.innerHTML = `<img id="viewImage" src="${imgUrl}" class="img-fluid rounded shadow-lg" alt="${title}">`;
  if (openFull) openFull.href = imgUrl;

  // ----- Universal download -----
  if (downloadLink) {
    downloadLink.onclick = () => {
      const img = document.getElementById("viewImage");
      if (!img) return;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = title.replace(/\s+/g, "_") + ".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  // ----- EXIF display -----
  if (exifPanel) {
    const imgElement = document.getElementById("viewImage");
    EXIF.getData(imgElement, function() {
      const all = EXIF.getAllTags(this);
      if (!all || Object.keys(all).length === 0) {
        exifPanel.innerHTML = "<strong>No EXIF data found.</strong>";
        return;
      }
      const mapping = {
        Make: all.Make,
        Model: all.Model,
        "Focal Length": all.FocalLength ? all.FocalLength + " mm" : undefined,
        Aperture: all.FNumber ? "ƒ/" + all.FNumber : undefined,
        Shutter: all.ExposureTime ? all.ExposureTime + " sec" : undefined,
        ISO: all.ISOSpeedRatings || all.ISO,
        "Date Taken": all.DateTimeOriginal || all.DateTime
      };
      let html = "<div class='exif-panel'>";
      for (const k in mapping) if (mapping[k]) html += `<strong>${k}:</strong> ${mapping[k]}<br>`;
      html += "</div>";
      exifPanel.innerHTML = html;
    });
  }
}

// ----- Init -----
document.addEventListener("DOMContentLoaded", () => {
  populateGrids();
  initLazyLoading();
  if (window.AOS) AOS.init?.({ duration: 800, once: true });
  highlightNav();
  handleViewPage();
  document.querySelectorAll(".yr-js").forEach(el => el.textContent = new Date().getFullYear());
});
