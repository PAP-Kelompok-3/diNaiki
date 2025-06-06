function init() {
  setDynamicTitle();
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