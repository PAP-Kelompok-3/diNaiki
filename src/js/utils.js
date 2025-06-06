export const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

/**
 * Mengambil data dari URL. Cache hasil untuk performa.
 */
let cachedData = null;
export async function fetchData() {
  if (cachedData) return cachedData;
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    cachedData = await response.json();
    return cachedData;
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return [];
  }
}

/**
 * Memuat komponen HTML ke dalam elemen target.
 */
export async function loadComponent(targetId, filePath, basePath = './') {
  const element = document.getElementById(targetId);
  if (!element) return;
  try {
    const response = await fetch(`${basePath}${filePath}`);
    if (!response.ok) throw new Error(`Gagal memuat ${filePath}`);

    let htmlContent = await response.text();
    // Ganti semua placeholder {base_path} dengan path yang benar
    htmlContent = htmlContent.replace(/{base_path}/g, basePath);

    element.innerHTML = htmlContent;
  } catch (error) {
    console.error(`Error memuat komponen ${targetId}:`, error);
    element.innerHTML = `<p class="error-message">Gagal memuat bagian ini.</p>`;
  }
}

/**
 * Mengatur judul halaman.
 */
export function setDynamicTitle(pageTitle) {
  document.title = pageTitle ? `diNaiki - ${pageTitle}` : 'diNaiki';
}