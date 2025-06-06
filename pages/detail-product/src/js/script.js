// Konstanta untuk URL data produk
const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

// Variabel global untuk data gambar dan indeks gambar saat ini
let productImages = []; // Menyimpan URL gambar produk yang akan ditampilkan di galeri
let currentImageIndex = 0; // Indeks gambar yang sedang aktif/ditampilkan
let currentProductData = null; // Menyimpan data produk lengkap yang sedang ditampilkan

// --- Fungsi Utilitas ---

/**
 * Mengatur judul halaman secara dinamis.
 * @param {string} [defaultPrefix='diNaiki'] - Awalan default untuk judul.
 * @param {object|null} [product=null] - Objek data produk.
 */
function setDynamicTitle(prefix = 'diNaiki') {
  const path = window.location.pathname;
  // Menghapus garis miring di akhir dan membagi path menjadi segmen
  const segments = path.replace(/\/$/, '').split('/');
  let lastSegment = '';

  // Mencari segmen terakhir yang tidak kosong dari belakang
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].trim() !== '') {
      lastSegment = segments[i];
      break;
    }
  }

  let pageName;
  if (!lastSegment || lastSegment.toLowerCase() === 'index.html' || lastSegment.toLowerCase() === 'index') {
    pageName = 'Home';
  } else {
    // Mengonversi nama segmen menjadi format judul (misal: "detail-product" menjadi "Detail Product")
    pageName = lastSegment
      .replace(/[-_]/g, ' ') // Ganti tanda hubung dan garis bawah dengan spasi
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi setiap kata
      .join(' ');
  }
  document.title = `${prefix} - ${pageName}`;
}

/**
 * Mendapatkan elemen DOM yang dibutuhkan dari halaman.
 * @returns {object} Objek berisi elemen-elemen DOM.
 */
function getDOMElements() {
  return {
    hiddenInput: document.getElementById("selectedSize"),
    mainImageEl: document.getElementById("main-image"),
    thumbsEl: document.getElementById("thumbnails"),
    prevBtn: document.querySelector('.thumb-arrow[aria-label="Previous image"]'),
    nextBtn: document.querySelector('.thumb-arrow[aria-label="Next image"]'),
    titleEl: document.getElementById("product-title"),
    priceEl: document.getElementById("product-price"),
    soldCountEl: document.getElementById("sold-count"),
    ratingValueEl: document.getElementById("rating-value"),
    descEl: document.getElementById("product-description"),
    sizesContainer: document.getElementById("sizes-container"),
    addBtn: document.getElementById("btn-add"),
    buyBtn: document.getElementById("btn-buy"),
    productDetailContainer: document.getElementById("product-detail-container")
  };
}

/**
 * Mengambil data produk dari server.
 * @param {number} productIndex - Indeks produk yang akan diambil (0-based).
 * @returns {Promise<object>} Data produk.
 */
async function fetchProductData(productIndex) {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data: HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Format data JSON tidak sesuai (bukan array).");
    }
    if (productIndex < 0 || productIndex >= data.length) {
      throw new Error(`Indeks produk ${productIndex} tidak valid atau di luar jangkauan.`);
    }
    currentProductData = data[productIndex];
    return currentProductData;
  } catch (error) {
    console.error("Error saat mengambil data produk:", error);
    throw error;
  }
}

// --- Fungsi untuk Galeri Gambar ---

/**
 * Mengubah gambar utama dengan efek fade dan memperbarui alt text.
 * @param {number} newImageIdx - Indeks gambar baru yang akan ditampilkan dari array `productImages`.
 * @param {HTMLImageElement} mainImageEl - Elemen gambar utama.
 */
function fadeToImage(newImageIdx, mainImageEl) {
  if (!mainImageEl || newImageIdx < 0 || newImageIdx >= productImages.length) {
    console.warn('Indeks gambar tidak valid atau elemen gambar utama tidak ditemukan untuk fadeToImage.');
    // Jika gambar utama tidak ada, setidaknya pastikan opacity kembali normal jika sebelumnya 0.5
    if (mainImageEl) mainImageEl.style.opacity = '1';
    return;
  }

  mainImageEl.style.opacity = '0.5'; // Mulai fade out

  setTimeout(() => {
    currentImageIndex = newImageIdx; // Update indeks global SETELAH animasi dimulai
    mainImageEl.src = productImages[currentImageIndex];
    mainImageEl.alt = `Gambar produk ${currentProductData ? currentProductData.name : 'produk'} ${currentImageIndex + 1}`;
    mainImageEl.style.opacity = '1'; // Selesaikan fade in
  }, 200); // Durasi timeout untuk efek fade
}

/**
 * Memperbarui gambar utama dan thumbnail aktif.
 * @param {number} newSelectedImageIndex - Indeks gambar baru yang dipilih (0-based dari `productImages`).
 * @param {HTMLImageElement} mainImageEl - Elemen gambar utama.
 * @param {HTMLElement} thumbsEl - Kontainer thumbnail.
 */
function updateMainImageAndActiveThumb(newSelectedImageIndex, mainImageEl, thumbsEl) {
  fadeToImage(newSelectedImageIndex, mainImageEl);

  if (thumbsEl) {
    const allThumbs = thumbsEl.querySelectorAll(".thumbnail");
    allThumbs.forEach((thumbImg, idx) => {
      thumbImg.classList.toggle("active-thumb", idx === newSelectedImageIndex);
    });
  }
}

/**
 * Menginisialisasi galeri gambar (thumbnail dan navigasi).
 * @param {object} productData - Data produk.
 * @param {HTMLImageElement} mainImageEl - Elemen gambar utama.
 * @param {HTMLElement} thumbsEl - Kontainer thumbnail.
 * @param {HTMLButtonElement} prevBtn - Tombol navigasi sebelumnya.
 * @param {HTMLButtonElement} nextBtn - Tombol navigasi berikutnya.
 */
function initializeImageGallery(productData, mainImageEl, thumbsEl, prevBtn, nextBtn) {
  if (!mainImageEl) { // Pemeriksaan penting untuk elemen gambar utama
    console.error("Elemen gambar utama (mainImageEl) tidak ditemukan. Galeri tidak dapat diinisialisasi.");
    if (thumbsEl) thumbsEl.innerHTML = '<p>Galeri tidak tersedia.</p>';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  if (!productData || !Array.isArray(productData.images)) {
    console.warn("Data gambar produk tidak valid atau tidak ditemukan.");
    mainImageEl.src = 'https://placehold.co/600x400/cccccc/333333?text=Gambar+Utama+Tidak+Tersedia';
    mainImageEl.alt = 'Gambar produk utama tidak tersedia';
    if (thumbsEl) thumbsEl.innerHTML = '<p>Tidak ada thumbnail.</p>';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  productImages = productData.images.filter(url => typeof url === 'string' && url.trim() !== '' && !url.includes("size-chart"));

  if (productImages.length === 0) {
    mainImageEl.src = 'https://placehold.co/600x400/cccccc/333333?text=Gambar+Produk+Tidak+Ditemukan';
    mainImageEl.alt = 'Gambar produk tidak ditemukan';
    if (thumbsEl) thumbsEl.innerHTML = '<p>Tidak ada gambar untuk ditampilkan.</p>';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  currentImageIndex = 0; // Mulai dari gambar pertama

  if (thumbsEl) {
    thumbsEl.innerHTML = ""; // Kosongkan thumbnail sebelumnya
    productImages.forEach((imgUrl, indexInProductImages) => {
      const thumb = document.createElement("img");
      thumb.src = imgUrl;
      thumb.alt = `Thumbnail ${productData.name ? productData.name : 'produk'} ${indexInProductImages + 1}`;
      thumb.className = "thumbnail"; // Kelas asli
      thumb.width = 64;
      thumb.height = 64;
      thumb.loading = "lazy";

      thumb.addEventListener("click", () => {
        updateMainImageAndActiveThumb(indexInProductImages, mainImageEl, thumbsEl);
      });
      thumbsEl.appendChild(thumb);
    });
  }

  // Panggil updateMainImageAndActiveThumb SETELAH semua thumbnail dibuat dan ditambahkan ke DOM.
  // Ini memastikan thumbnail pertama akan mendapatkan kelas 'active-thumb' saat load awal.
  updateMainImageAndActiveThumb(currentImageIndex, mainImageEl, thumbsEl);

  const showNavButtons = productImages.length > 1;
  if (prevBtn) {
    prevBtn.style.display = showNavButtons ? '' : 'none';
    prevBtn.onclick = () => {
      const prevIdx = (currentImageIndex - 1 + productImages.length) % productImages.length;
      updateMainImageAndActiveThumb(prevIdx, mainImageEl, thumbsEl);
    };
  }

  if (nextBtn) {
    nextBtn.style.display = showNavButtons ? '' : 'none';
    nextBtn.onclick = () => {
      const nextIdx = (currentImageIndex + 1) % productImages.length;
      updateMainImageAndActiveThumb(nextIdx, mainImageEl, thumbsEl);
    };
  }
}

// --- Fungsi untuk Detail Produk ---

/**
 * Menampilkan detail produk pada elemen DOM.
 * @param {object} productData - Data produk.
 * @param {object} elements - Objek berisi elemen-elemen DOM.
 */
function populateProductDetails(productData, elements) {
  if (elements.titleEl) elements.titleEl.textContent = productData.name || "Nama Produk Tidak Tersedia";
  if (elements.priceEl && typeof productData.price === 'number') {
    elements.priceEl.textContent = "Rp " + productData.price.toLocaleString("id-ID") + ",00";
  } else if (elements.priceEl) {
    elements.priceEl.textContent = "Harga Tidak Tersedia";
  }
  if (elements.soldCountEl) {
    elements.soldCountEl.textContent = productData.sold !== undefined ? `${productData.sold} terjual` : "";
  }
  if (elements.ratingValueEl) {
    elements.ratingValueEl.textContent = productData.rating !== undefined ? productData.rating : "";
  }
  if (elements.descEl) elements.descEl.textContent = productData.description || "Deskripsi tidak tersedia.";
}

// --- Fungsi untuk Ukuran ---

/**
 * Menambahkan event listener ke kotak ukuran.
 * @param {HTMLElement} hiddenInputEl - Elemen input tersembunyi untuk ukuran terpilih.
 */
function attachSizeBoxHandlers(hiddenInputEl) {
  const sizeBoxes = document.querySelectorAll(".size-box");
  sizeBoxes.forEach(box => {
    box.addEventListener("click", () => {
      sizeBoxes.forEach(b => b.classList.remove("selected", "active"));
      box.classList.add("selected", "active");
      if (hiddenInputEl) hiddenInputEl.value = box.dataset.size;
    });
  });
}

/**
 * Merender opsi ukuran produk.
 * @param {object} productData - Data produk.
 * @param {HTMLElement} sizesContainerEl - Kontainer untuk opsi ukuran.
 * @param {HTMLElement} hiddenInputEl - Elemen input tersembunyi.
 */
function renderSizes(productData, sizesContainerEl, hiddenInputEl) {
  if (!sizesContainerEl) return;
  sizesContainerEl.innerHTML = "";
  if (Array.isArray(productData.sizes) && productData.sizes.length > 0) {
    productData.sizes.forEach(size => {
      const box = document.createElement("div");
      box.className = "size-box"; // Kelas asli
      box.dataset.size = size;
      box.textContent = size;
      sizesContainerEl.appendChild(box);
    });
    attachSizeBoxHandlers(hiddenInputEl);
  } else {
    sizesContainerEl.textContent = "Pilihan ukuran tidak tersedia.";
  }
}

// --- Fungsi untuk Tombol Aksi ---

/**
 * Menginisialisasi tombol aksi (Tambah ke Keranjang, Beli Sekarang).
 * @param {object} productData - Data produk.
 * @param {object} elements - Objek elemen DOM.
 */
function initializeActionButtons(productData, elements) {
  if (elements.addBtn) {
    elements.addBtn.onclick = () => {
      const selectedSize = elements.hiddenInput?.value;
      if (!selectedSize) {
        alert("Silakan pilih ukuran terlebih dahulu.");
        return;
      }
      alert(`Produk "${productData.name}" ukuran ${selectedSize} berhasil ditambahkan ke keranjang!`);
    };
  }

  if (elements.buyBtn) {
    elements.buyBtn.onclick = () => {
      const selectedSize = elements.hiddenInput?.value;
      if (!selectedSize) {
        alert("Silakan pilih ukuran terlebih dahulu.");
        return;
      }
      const imageUrl = productImages.length > 0 ? productImages[0] : '';
      const checkoutUrl = `checkout.html?product=${encodeURIComponent(productData.name)}&size=${encodeURIComponent(selectedSize)}&price=${productData.price}&image=${encodeURIComponent(imageUrl)}`;
      window.location.href = checkoutUrl;
    };
  }
}

// --- Fungsi Utama ---

/**
 * Fungsi utama untuk menginisialisasi halaman detail produk.
 */
async function initializeProductDetailPage() {

  setDynamicTitle();

  const elements = getDOMElements();

  if (!elements.mainImageEl) { // Pemeriksaan kritis sebelum melanjutkan
    console.error("Elemen #main-image tidak ditemukan. Inisialisasi halaman detail produk dihentikan.");
    // Tampilkan pesan error di body jika kontainer utama tidak spesifik
    document.body.innerHTML = "<p class='error-message'>Kesalahan kritis: Komponen gambar utama tidak ditemukan. Halaman tidak dapat dimuat dengan benar.</p>";
    return;
  }


  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");

  if (!idParam) {
    const errorMsg = "Detail produk tidak dapat dimuat: ID produk tidak ditemukan di URL.";
    console.warn(errorMsg);
    (elements.productDetailContainer || document.body).innerHTML = `<p class='error-message'>${errorMsg}</p>`;
    return;
  }

  const productIndex = parseInt(idParam, 10) - 1;

  if (isNaN(productIndex)) {
    const errorMsg = "Detail produk tidak dapat dimuat: ID produk tidak valid.";
    console.warn(errorMsg);
    (elements.productDetailContainer || document.body).innerHTML = `<p class='error-message'>${errorMsg}</p>`;
    return;
  }

  try {
    const fetchedProductData = await fetchProductData(productIndex);

    // Pastikan elemen DOM sudah siap sebelum memanggil fungsi-fungsi yang memanipulasinya
    initializeImageGallery(fetchedProductData, elements.mainImageEl, elements.thumbsEl, elements.prevBtn, elements.nextBtn);
    populateProductDetails(fetchedProductData, elements);
    renderSizes(fetchedProductData, elements.sizesContainer, elements.hiddenInput);
    initializeActionButtons(fetchedProductData, elements);

  } catch (error) {
    console.error("Gagal memuat atau merender detail produk:", error);
    const errorMsg = `Maaf, terjadi kesalahan saat memuat detail produk. ${error.message}.`;
    (elements.productDetailContainer || document.body).innerHTML =
      `<div class="error-container" style="padding: 20px; text-align: center; border: 1px solid #ffccd1; background-color: #fff2f4; color: #d32f2f; border-radius: 8px;">
         <p class="error-message" style="margin-bottom: 15px; font-size: 1.1em;">${errorMsg}</p>
         <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">Coba Lagi</button>
       </div>`;
  }
}

// Event listener untuk menjalankan inisialisasi setelah DOM siap
document.addEventListener('DOMContentLoaded', initializeProductDetailPage);
