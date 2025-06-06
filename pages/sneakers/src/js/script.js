// Konstanta untuk URL data produk
const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

/**
 * Mengatur judul halaman secara dinamis berdasarkan path URL.
 * @param {string} [prefix='diNaiki'] - Awalan untuk judul halaman.
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
 * Memuat konten HTML dari file ke dalam elemen dengan ID tertentu.
 * @param {string} id - ID elemen target.
 * @param {string} filePath - Path ke file HTML yang akan dimuat.
 * @returns {Promise<void>}
 */
async function loadComponent(id, filePath) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Elemen dengan ID "${id}" tidak ditemukan untuk komponen ${filePath}.`);
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Gagal memuat ${filePath}: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error(`Error saat memuat komponen ${filePath}:`, error);
    // Menampilkan pesan error sederhana jika komponen gagal dimuat
    element.innerHTML = `<p class="error-message">Gagal memuat bagian ini.</p>`;
  }
}

/**
 * Membuat elemen kartu produk.
 * @param {object} item - Objek data produk.
 * @returns {HTMLAnchorElement} - Elemen anchor yang berisi kartu produk.
 */
function createProductCard(item) {
  // Menggunakan gambar pertama sebagai thumbnail, atau placeholder jika tidak ada
  const thumbnailUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/600x400/cccccc/333333?text=Gambar+Tidak+Tersedia';

  // Format harga ke mata uang Rupiah
  const formattedPrice = item.price.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Membuat elemen anchor sebagai pembungkus utama
  const linkWrapper = document.createElement('a');
  linkWrapper.href = `../../pages/detail-product/?id=${item.id}`;
  linkWrapper.className = 'product-card-link'; // Kelas asli dari kode Anda
  linkWrapper.setAttribute('aria-label', `Lihat detail untuk ${item.name}`);

  // Membuat elemen artikel untuk kartu
  const card = document.createElement('article');
  card.className = 'product-card'; // Kelas asli dari kode Anda

  // Membuat pembungkus gambar
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'product-card-image-wrapper'; // Kelas asli dari kode Anda

  // Membuat elemen gambar
  const imgEl = document.createElement('img');
  imgEl.src = thumbnailUrl;
  imgEl.alt = ' '; // Alt text yang lebih deskriptif
  imgEl.loading = 'lazy'; // Lazy loading untuk performa

  imageWrapper.appendChild(imgEl);

  // Membuat kontainer untuk konten teks
  const contentEl = document.createElement('div');
  contentEl.className = 'product-card-content'; // Kelas asli dari kode Anda

  // Membuat elemen nama produk
  const nameEl = document.createElement('h3');
  // Tidak menambahkan kelas baru untuk nameEl
  nameEl.textContent = item.name;

  // Membuat elemen harga produk
  const priceEl = document.createElement('p');
  priceEl.className = 'product-price'; // Kelas asli dari kode Anda
  priceEl.textContent = formattedPrice;

  // Menyusun elemen-elemen konten
  contentEl.appendChild(nameEl);
  contentEl.appendChild(priceEl);

  // Menyusun elemen-elemen kartu
  card.appendChild(imageWrapper);
  card.appendChild(contentEl);

  // Memasukkan kartu ke dalam pembungkus link
  linkWrapper.appendChild(card);

  return linkWrapper;
}

/**
 * Merender halaman sneakers dengan mengambil data produk dan menampilkannya.
 */
async function renderSneakersPage() {
  setDynamicTitle(); // Atur judul halaman

  // Memuat komponen header dan footer secara paralel
  Promise.all([
    loadComponent("header-placeholder", "../../src/partials/header.html"),
    loadComponent("footer-placeholder", "../../src/partials/footer.html")
  ]);

  const gridContainer = document.getElementById('product-grid');
  if (!gridContainer) {
    console.error('Elemen dengan ID "product-grid" tidak ditemukan.');
    // Anda bisa menambahkan penanganan jika gridContainer tidak ada, misal:
    // document.body.insertAdjacentHTML('afterbegin', '<p class="error-message">Struktur halaman utama tidak ditemukan.</p>');
    return;
  }

  // Tampilkan indikator loading awal (pesan teks sederhana)
  gridContainer.innerHTML = '<p class="info-message">Memuat produk...</p>';

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data: HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Validasi tipe data yang diterima
    if (!Array.isArray(data)) {
      console.error('Format data JSON tidak sesuai (bukan array).');
      gridContainer.innerHTML = '<p class="error-message">Format data produk tidak valid.</p>';
      return;
    }

    // Cek jika data kosong
    if (data.length === 0) {
      gridContainer.innerHTML = '<p class="info-message">Tidak ada produk sneakers yang tersedia saat ini.</p>';
      return;
    }

    // Bersihkan kontainer sebelum menambahkan produk baru
    gridContainer.innerHTML = '';
    // Tidak menambahkan kelas styling grid di sini agar tidak mengubah visual


    // Render setiap produk
    data.forEach(item => {
      // Validasi dasar untuk setiap item produk
      if (item && typeof item === 'object' && item.id != null && item.name != null && typeof item.price === 'number' && Array.isArray(item.images)) {
        const productCardElement = createProductCard(item);
        gridContainer.appendChild(productCardElement);
      } else {
        console.warn('Item produk tidak valid atau tidak memiliki properti yang dibutuhkan:', item);
        // Anda bisa memilih untuk menampilkan pesan untuk item yang rusak atau melewatkannya
      }
    });

  } catch (error) {
    console.error('Gagal memuat atau merender sneakers:', error);
    // Tampilkan pesan error yang lebih informatif di UI (teks sederhana)
    gridContainer.innerHTML = `<p class="error-message">Maaf, terjadi kesalahan saat memuat produk. Detail: ${error.message}. Silakan coba lagi nanti.</p>
                               <button onclick="renderSneakersPage()">Coba Lagi</button>`;
  }
}

// Menjalankan fungsi renderSneakersPage ketika DOM sudah siap
document.addEventListener('DOMContentLoaded', renderSneakersPage);
