const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(err => console.error(`Gagal load component ${file}:`, err));
}

async function renderSneakersPage() {
  loadComponent("header-placeholder", "../../src/partials/header.html");
  loadComponent("footer-placeholder", "../../src/partials/footer.html");

  const gridContainer = document.getElementById('product-grid');
  if (!gridContainer) {
    console.error('Elemen dengan id "product-grid" tidak ditemukan.');
    return;
  }
  gridContainer.innerHTML = '';

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Data JSON bukan array.');
      return;
    }

    data.forEach(item => {
      const thumbnailUrl = (item.images && item.images.length > 0)
        ? item.images[0]
        : '';

      const formattedPrice = item.price.toLocaleString('id-ID') + ',00';

      const card = document.createElement('article');
      card.className = 'product-card';

      const imgEl = document.createElement('img');
      imgEl.src = thumbnailUrl;
      imgEl.width = 200;
      imgEl.height = 200;

      const nameEl = document.createElement('h3');
      nameEl.textContent = item.name;

      const priceEl = document.createElement('p');
      priceEl.textContent = `Rp ${formattedPrice}`;

      const linkWrapper = document.createElement('a');
      linkWrapper.href = `../../pages/detail-product/?id=${item.id}`;
      linkWrapper.appendChild(imgEl);

      card.appendChild(linkWrapper);
      card.appendChild(nameEl);
      card.appendChild(priceEl);

      gridContainer.appendChild(card);
    });

  } catch (err) {
    console.error('Gagal memuat sneakers dari JSON:', err);
    gridContainer.innerHTML = `<p style="color:red;">Gagal memuat data sneakers.</p>`;
  }
}

// Jalankan renderSneakersPage setelah DOM siap
document.addEventListener('DOMContentLoaded', renderSneakersPage);
