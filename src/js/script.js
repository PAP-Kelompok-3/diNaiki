const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

async function init() {
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

function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
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
    imgEl.alt = item.name;
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
        <img src="${thumbnail}"
             alt="Sneaker ${item.name}"
             class="sneaker-image" />
      </a>
      <p class="sneaker-name">${item.name}</p>
      <p class="sneaker-price">Rp ${formattedPrice}</p>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', init);
