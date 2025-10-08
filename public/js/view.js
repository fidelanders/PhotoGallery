// view.js - populate view.html with selected image, set download, and show EXIF.
(function () {
  function decodeParam(param){ return param ? decodeURIComponent(param) : null; }

  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const imgParam = decodeParam(params.get("img"));
    const titleParam = decodeParam(params.get("title")) || "Portrait";

    const photoWrap = document.getElementById("photoWrap");
    const downloadLink = document.getElementById("downloadLink");
    const openFull = document.getElementById("openFull");
    const exifPanel = document.getElementById("exifPanel");
    const photoElem = document.createElement("img");
    photoElem.className = "img-fluid rounded shadow-lg lazy";
    photoElem.alt = titleParam;

    if (!imgParam) {
      if (photoWrap) photoWrap.innerHTML = "<p class='text-muted-light'>No image specified.</p>";
      return;
    }

    const loadImg = () => {
      photoElem.src = imgParam;
      photoElem.onload = () => photoElem.classList.add("loaded");
    };

    if (photoWrap) {
      photoWrap.innerHTML = "";
      photoWrap.appendChild(photoElem);
    }

    if (downloadLink) {
      downloadLink.href = imgParam;
      downloadLink.setAttribute("download", (titleParam.replace(/\s+/g, "_") || "portrait") + ".jpg");
    }
    if (openFull) openFull.href = imgParam;

    function loadExif(url) {
      if (!exifPanel) return;
      exifPanel.innerHTML = "<em>Loading EXIF data…</em>";
      fetch(url).then(r => r.blob()).then(blob => {
        const reader = new FileReader();
        reader.onload = function () {
          const dataUrl = reader.result;
          const tempImg = new Image();
          tempImg.src = dataUrl;
          tempImg.onload = function () {
            try {
              EXIF.getData(tempImg, function () {
                const all = EXIF.getAllTags(this);
                if (!all || Object.keys(all).length === 0) {
                  exifPanel.innerHTML = "<strong>No EXIF data found.</strong>";
                  return;
                }
                const mapping = {
                  Make: all.Make,
                  Model: all.Model,
                  "Focal Length": all.FocalLength ? (all.FocalLength + " mm") : undefined,
                  Aperture: all.FNumber ? ("ƒ/" + all.FNumber) : undefined,
                  Shutter: all.ExposureTime ? all.ExposureTime + " sec" : undefined,
                  ISO: all.ISOSpeedRatings || all.ISO,
                  "Date Taken": all.DateTimeOriginal || all.DateTime
                };
                let html = "<div class='exif-panel'>";
                for (const k in mapping) if (mapping[k]) html += `<strong>${k}:</strong> ${mapping[k]}<br>`;
                html += "</div>";
                exifPanel.innerHTML = html;
              });
            } catch (err) {
              console.error("EXIF parse error", err);
              exifPanel.innerHTML = "<strong>EXIF read error.</strong>";
            }
          };
        };
        reader.readAsDataURL(blob);
      }).catch(err => {
        console.error("EXIF fetch failed", err);
        exifPanel.innerHTML = "<strong>Failed to load EXIF data.</strong>";
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImg();
            loadExif(imgParam);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "200px" });
      io.observe(photoElem);
    } else {
      loadImg();
      loadExif(imgParam);
    }
  });
})();