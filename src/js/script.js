const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

async function init() {
  setDynamicTitle();
  loadComponent("header-placeholder", "src/partials-home/header.html");
  loadComponent("footer-placeholder", "src/partials-home/footer.html");
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const sneakers = await res.json();

    renderNewArrival(sneakers[10], 2);
    renderSneakers(sneakers.slice(0, 6));

  } catch (err) {
    console.error('Gagal memuat data.json:', err);
  }
}

function renderNewArrival(item, imageItem = 0) {
  const imgEl = document.getElementById('new-image');
  const nameEl = document.getElementById('new-name');
  const priceEl = document.getElementById('new-price');
  const descEl = document.getElementById('new-desc');
  const addCartBtn = document.getElementById('new-addcart');
  const detailLink = document.getElementById('new-detail-link');

  if (imgEl && item.images && item.images.length > 0) {
    imgEl.src = item.images[imageItem];
  }

  if (nameEl) {
    nameEl.textContent = item.name;
  }

  if (priceEl) {
    priceEl.textContent = 'Rp ' + item.price.toLocaleString('id-ID') + ',00';
  }

  if (descEl) {
    descEl.textContent = item.description;
  }

  if (addCartBtn) {
    // addCartBtn.addEventListener('click', () => {
    //   alert(`"${item.name}" telah ditambahkan ke keranjang!`);
    // });
    addCartBtn.href = `pages/detail-product/?id=${item.id}`;
  }

  if (detailLink) {
    detailLink.href = `pages/detail-product/?id=${item.id}`;
  }
}

function renderSneakers(arrSneakers, imageItem = 0) {
  const container = document.getElementById('sneaker-container');
  if (!container) return;
  container.innerHTML = '';

  arrSneakers.forEach(item => {
    const card = document.createElement('div');
    card.className = 'sneaker-item';

    const thumbnail = (item.images && item.images.length > 0)
      ? item.images[imageItem]
      : '';

    const formattedPrice = item.price.toLocaleString('id-ID') + ',00';

    card.innerHTML = `
      <a href="pages/detail-product/?id=${item.id}">
        <img loading="lazy" src="${thumbnail}"
             class="sneaker-image" />
      </a>
      <p class="sneaker-name">${item.name}</p>
      <p class="sneaker-price">Rp ${formattedPrice}</p>
    `;
    container.appendChild(card);
  });
}

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

document.addEventListener('DOMContentLoaded', init);
