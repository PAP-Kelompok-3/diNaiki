document.addEventListener('DOMContentLoaded', () => {

  const hiddenInput = document.getElementById("selectedSize");
  const mainImageEl = document.getElementById("main-image");
  const thumbsEl = document.getElementById("thumbnails");
  const prevBtn = document.querySelector('.thumb-arrow[aria-label="Previous image"]');
  const nextBtn = document.querySelector('.thumb-arrow[aria-label="Next image"]');
  const titleEl = document.getElementById("product-title");
  const priceEl = document.getElementById("product-price");
  const soldCountEl = document.getElementById("sold-count");
  const ratingValueEl = document.getElementById("rating-value");
  const descEl = document.getElementById("product-description");
  const sizesContainer = document.getElementById("sizes-container");
  const addBtn = document.getElementById("btn-add");
  const buyBtn = document.getElementById("btn-buy");

  let imageUrls = [];
  let currentImageIndex = 0;

  function attachSizeBoxHandlers() {
    const sizeBoxes = document.querySelectorAll(".size-box");
    sizeBoxes.forEach(box => {
      box.addEventListener("click", () => {
        sizeBoxes.forEach(b => b.classList.remove("selected", "active"));
        box.classList.add("selected", "active");
        if (hiddenInput) hiddenInput.value = box.dataset.size;
      });
    });
  }
  attachSizeBoxHandlers();

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const index = parseInt(idParam, 10) - 1;

  if (!idParam || isNaN(index) || index < 0) {
    console.warn("Parameter 'id' tidak valid atau tidak ditemukan.");
    return;
  }

  fetch("https://pap-kelompok-3.github.io/cdn-diNaiki/data.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Data JSON bukan array.");
      if (index >= data.length) throw new Error(`Index ${index} melebihi panjang data.`);

      const item = data[index];

      imageUrls = item.images.filter(url => !url.includes("size-chart"));

      currentImageIndex = 0;
      fadeToImage(currentImageIndex);

      if (thumbsEl) {
        thumbsEl.innerHTML = "";
        imageUrls.forEach((imgUrl, i) => {
          const thumb = document.createElement("img");
          thumb.src = imgUrl;
          thumb.className = "thumbnail";
          thumb.width = 64;
          thumb.height = 64;
          if (i === currentImageIndex) {
            thumb.classList.add("active-thumb");
          }
          thumb.addEventListener("click", () => {
            const prevActive = thumbsEl.querySelector(".active-thumb");
            if (prevActive) prevActive.classList.remove("active-thumb");

            currentImageIndex = i;
            fadeToImage(currentImageIndex);
            thumb.classList.add("active-thumb");
          });
          thumbsEl.appendChild(thumb);
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          const prevIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
          updateMainImage(prevIndex);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const nextIndex = (currentImageIndex + 1) % imageUrls.length;
          updateMainImage(nextIndex);
        });
      }

      if (titleEl) {
        titleEl.textContent = item.name;
      }

      if (priceEl) {
        priceEl.textContent = "Rp " + item.price.toLocaleString("id-ID") + ",00";
      }

      if (soldCountEl && item.sold !== undefined) {
        soldCountEl.textContent = `${item.sold} sold`;
      }
      if (ratingValueEl && item.rating !== undefined) {
        ratingValueEl.textContent = item.rating;
      }

      if (descEl) {
        descEl.textContent = item.description;
      }

      if (sizesContainer && Array.isArray(item.sizes)) {
        sizesContainer.innerHTML = "";
        item.sizes.forEach(size => {
          const box = document.createElement("div");
          box.className = "size-box";
          box.dataset.size = size;
          box.textContent = size;
          sizesContainer.appendChild(box);
        });
        attachSizeBoxHandlers();
      }

      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const selectedSize = hiddenInput?.value;
          if (!selectedSize) {
            alert("Silakan pilih ukuran terlebih dahulu.");
            return;
          }
          alert(`Produk "${item.name}" ukuran ${selectedSize} berhasil ditambahkan ke keranjang!`);
        });
      }

      if (buyBtn) {
        buyBtn.addEventListener("click", () => {
          const selectedSize = hiddenInput?.value;
          if (!selectedSize) {
            alert("Silakan pilih ukuran terlebih dahulu.");
            return;
          }
          const checkoutUrl = `checkout.html?product=${encodeURIComponent(item.name)}&size=${encodeURIComponent(selectedSize)}`;
          window.location.href = checkoutUrl;
        });
      }
    })
    .catch(err => {
      console.error("Gagal memuat detail produk:", err);
    });

  function updateMainImage(newIndex) {
    currentImageIndex = newIndex;
    fadeToImage(currentImageIndex);

    const allThumbs = thumbsEl.querySelectorAll(".thumbnail");
    allThumbs.forEach((thumbImg, idx) => {
      thumbImg.classList.toggle("active-thumb", idx === currentImageIndex);
    });
  }

  function fadeToImage(newIndex) {
    // Pastikan newIndex valid
    if (newIndex < 0 || newIndex >= imageUrls.length) return;

    // Fade out: set opacity ke 0.5
    mainImageEl.style.opacity = '0.5';

    // Setelah durasi fade (0.4s), ganti gambar dan fade in
    setTimeout(() => {
      currentImageIndex = newIndex;
      mainImageEl.src = imageUrls[currentImageIndex];
      // Fade in: kembalikan opacity ke 1
      mainImageEl.style.opacity = '1';
    }, 200); // durasi 200ms sama dengan di CSS
  }
});
