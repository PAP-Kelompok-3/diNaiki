import { loadComponent, setDynamicTitle, fetchData, showToast } from './utils.js';
// --- Fungsi Inisialisasi Halaman ---

async function initHomePage() {
  setDynamicTitle('Home');
  const sneakers = await fetchData();
  if (!sneakers.length) return;

  const newArrivalData = sneakers[10];
  if (newArrivalData) {
    document.getElementById('new-image').src = newArrivalData.images[0];
    document.getElementById('new-name').textContent = newArrivalData.name;
    document.getElementById('new-price').textContent = `Rp ${newArrivalData.price.toLocaleString('id-ID')}`;
    document.getElementById('new-desc').textContent = newArrivalData.description;
    document.getElementById('new-detail-link').href = `pages/detail-product.html?id=${newArrivalData.id}`;
  }

  const container = document.getElementById('sneaker-container');
  container.innerHTML = ''; // Clear loading message
  sneakers.slice(0, 6).forEach(item => {
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = `pages/detail-product.html?id=${item.id}`;
    card.innerHTML = `
      <img loading="lazy" src="${item.images[0]}" alt="${item.name}"/>
      <h3>${item.name}</h3>
      <p class="product-price">Rp ${item.price.toLocaleString('id-ID')}</p>`;
    container.appendChild(card);
  });
}

async function initSneakersPage() {
  setDynamicTitle('All Sneakers');

  // --- ELEMEN DOM ---
  const gridContainer = document.getElementById('product-grid');
  const sortSelect = document.querySelector('.product-sort');
  const productCountEl = document.querySelector('.product-count');
  const paginationContainer = document.querySelector('.pagination');
  const filterSidebar = document.querySelector('.filter-sidebar');
  const filterToggleBtn = document.getElementById('filter-toggle-btn');
  const overlay = document.getElementById('overlay');

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'filter-sidebar__close-btn';
  filterSidebar.prepend(closeBtn);

  // --- STATE MANAGEMENT ---
  const PRODUCTS_PER_PAGE = 6;
  let allProducts = [];
  let activeFilters = { minPrice: null, maxPrice: null };
  let currentSort = 'sales';
  let currentPage = 1;

  // --- FUNGSI-FUNGSI UTAMA ---
  function renderProducts() {
    let productsToRender = [...allProducts];
    if (activeFilters.minPrice !== null && activeFilters.maxPrice !== null) {
      productsToRender = productsToRender.filter(p => p.price >= activeFilters.minPrice && p.price <= activeFilters.maxPrice);
    }
    switch (currentSort) {
      case 'price_asc': productsToRender.sort((a, b) => a.price - b.price); break;
      case 'price_desc': productsToRender.sort((a, b) => b.price - a.price); break;
      case 'rating': productsToRender.sort((a, b) => b.rating - a.rating); break;
      case 'sales': default: productsToRender.sort((a, b) => b.sold - a.sold); break;
    }
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);

    gridContainer.innerHTML = '';
    if (paginatedProducts.length === 0) {
      gridContainer.innerHTML = '<p class="info-message" style="grid-column: 1 / -1;">Tidak ada produk yang cocok dengan kriteria Anda.</p>';
    } else {
      paginatedProducts.forEach(item => {
        const card = createProductCard(item);
        gridContainer.appendChild(card);
      });
    }
    productCountEl.textContent = `Menampilkan ${productsToRender.length} dari ${allProducts.length} produk`;
    renderPagination(productsToRender.length);
  }

  function renderPagination(totalFilteredProducts) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalFilteredProducts / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) return;

    const mobileInfo = document.createElement('span');
    mobileInfo.className = 'pagination__mobile-info';
    mobileInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    paginationContainer.appendChild(mobileInfo);

    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.innerHTML = '&laquo;';
    prevLink.className = 'pagination__link';
    prevLink.dataset.page = currentPage - 1;
    if (currentPage === 1) prevLink.style.visibility = 'hidden';
    paginationContainer.prepend(prevLink);

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = i;
      pageLink.className = 'pagination__link number';
      if (i === currentPage) pageLink.classList.add('current');
      pageLink.dataset.page = i;
      paginationContainer.appendChild(pageLink);
    }

    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.innerHTML = '&raquo;';
    nextLink.className = 'pagination__link';
    nextLink.dataset.page = currentPage + 1;
    if (currentPage === totalPages) nextLink.style.visibility = 'hidden';
    paginationContainer.appendChild(nextLink);
  }

  function createProductCard(item) {
    const cardLink = document.createElement('a');
    cardLink.href = `../pages/detail-product.html?id=${item.id}`;
    cardLink.className = 'product-card';
    let ratingHTML = '';
    if (item.rating) {
      ratingHTML = `<div class="product-card__rating"><i class="fas fa-star filled"></i><span> ${item.rating}</span></div>`;
    }
    cardLink.innerHTML = `
      <div class="product-card__image-wrapper"><img class="product-card__image" src="${item.images[0]}" alt="${item.name}" loading="lazy"><div class="product-card__action"><button type="button" class="btn btn--black" data-product-id="${item.id}" style="width: 100%;">Add to Cart</button></div></div>
      <div class="product-card__content"><h3 class="product-card__name">${item.name}</h3><p class="product-card__price">Rp ${item.price.toLocaleString('id-ID')}</p>${ratingHTML}</div>`;
    return cardLink;
  }

  function setupEventListeners() {
    const priceRangeOptions = document.querySelectorAll('.price-range-option');
    const resetFilterBtn = document.getElementById('reset-filter-btn');

    function closeFilter() {
      filterSidebar.classList.remove('filter-sidebar--is-open');
      overlay.classList.remove('overlay--is-active');
    }
    filterToggleBtn.addEventListener('click', () => {
      filterSidebar.classList.add('filter-sidebar--is-open');
      overlay.classList.add('overlay--is-active');
    });
    closeBtn.addEventListener('click', closeFilter);
    overlay.addEventListener('click', closeFilter);

    priceRangeOptions.forEach(button => {
      button.addEventListener('click', () => {
        priceRangeOptions.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        activeFilters.minPrice = parseInt(button.dataset.min);
        activeFilters.maxPrice = parseInt(button.dataset.max);
        currentPage = 1;
        renderProducts();
      });
    });

    resetFilterBtn.addEventListener('click', () => {
      priceRangeOptions.forEach(btn => btn.classList.remove('active'));
      activeFilters.minPrice = null;
      activeFilters.maxPrice = null;
      currentPage = 1;
      renderProducts();
    });

    sortSelect.addEventListener('change', (event) => {
      currentSort = event.target.value;
      currentPage = 1;
      renderProducts();
    });

    gridContainer.addEventListener('click', (event) => {
      if (event.target.matches('.btn--black')) {
        event.preventDefault();
        event.stopPropagation();
        const productId = event.target.dataset.productId;
        const product = allProducts.find(p => p.id == productId);
        showToast(`"${product.name}" telah ditambahkan ke keranjang!`, 'success');
      }
    });

    paginationContainer.addEventListener('click', (event) => {
      event.preventDefault();
      const target = event.target.closest('.pagination__link');
      if (target && !target.matches('.current')) {
        currentPage = parseInt(target.dataset.page);
        renderProducts();
        document.querySelector('.page-heading').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // --- INISIALISASI ---
  gridContainer.innerHTML = '<p class="loading-message" style="grid-column: 1 / -1;">Memuat semua sneakers...</p>';
  allProducts = await fetchData();
  setupEventListeners();
  renderProducts();
}

async function initDetailProductPage() {
  const mainEl = document.querySelector('.product-detail-container');
  if (!mainEl) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    mainEl.innerHTML = `<p class="error-message">ID Produk tidak ditemukan.</p>`;
    return;
  }

  const sneakers = await fetchData();
  const product = sneakers.find(p => p.id == productId);
  if (!product) {
    mainEl.innerHTML = `<p class="error-message">Produk tidak ditemukan.</p>`;
    return;
  }

  setDynamicTitle(product.name);

  // --- ELEMEN DOM ---
  const mainImageEl = document.getElementById("main-image");
  const thumbsEl = document.getElementById("thumbnails");
  const prevBtn = document.getElementById('thumb-prev');
  const nextBtn = document.getElementById('thumb-next');
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-price").textContent = `Rp ${product.price.toLocaleString("id-ID")}`;
  document.getElementById("sold-count").textContent = `${product.sold} terjual`;
  document.getElementById("rating-value").textContent = product.rating;
  document.getElementById("product-description").textContent = product.description;
  const sizesContainer = document.getElementById("sizes-container");
  const selectedSizeInput = document.getElementById("selectedSize");

  // Ambil tombol aksi
  const buyBtn = document.getElementById('btn-buy');
  const addBtn = document.getElementById('btn-add');

  // --- LOGIKA UTAMA ---
  const galleryImages = product.images.filter(url => !url.includes('size-chart.svg'));
  let currentImageIndex = 0;

  function updateGallery(newIndex) {
    if (newIndex < 0 || newIndex >= galleryImages.length) return;
    currentImageIndex = newIndex;
    mainImageEl.src = galleryImages[currentImageIndex];
    thumbsEl.querySelectorAll('.thumbnail').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === currentImageIndex);
    });
  }

  thumbsEl.innerHTML = '';
  galleryImages.forEach((imgUrl, index) => {
    const thumb = document.createElement("img");
    thumb.src = imgUrl;
    thumb.alt = `Thumbnail ${index + 1}`;
    thumb.className = "thumbnail";
    thumb.addEventListener("click", () => updateGallery(index));
    thumbsEl.appendChild(thumb);
  });

  prevBtn.addEventListener('click', () => updateGallery((currentImageIndex - 1 + galleryImages.length) % galleryImages.length));
  nextBtn.addEventListener('click', () => updateGallery((currentImageIndex + 1) % galleryImages.length));

  sizesContainer.innerHTML = '';
  product.sizes.forEach(size => {
    const box = document.createElement("button");
    box.type = 'button';
    box.className = "size-box";
    box.textContent = size;
    box.addEventListener("click", (e) => {
      sizesContainer.querySelectorAll('.size-box').forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      selectedSizeInput.value = size;
    });
    sizesContainer.appendChild(box);
  });

  if (galleryImages.length > 0) {
    updateGallery(0);
  }

  // --- BAGIAN BARU: EVENT LISTENERS UNTUK TOMBOL AKSI ---

  // Listener untuk tombol "Buy it now"
  buyBtn.addEventListener('click', () => {
    const selectedSize = selectedSizeInput.value;
    if (!selectedSize) {
      showToast('Silakan pilih ukuran terlebih dahulu.', 'error');
      return; // Hentikan fungsi jika ukuran belum dipilih
    }

    // Siapkan data untuk dikirim ke halaman checkout
    const checkoutUrl = `../pages/checkout.html?product=${encodeURIComponent(product.name)}&size=${encodeURIComponent(selectedSize)}&price=${product.price}&image=${encodeURIComponent(galleryImages[0])}`;

    // Arahkan pengguna ke halaman checkout
    window.location.href = checkoutUrl;
  });

  // Listener untuk tombol "Add to cart"
  addBtn.addEventListener('click', () => {
    const selectedSize = selectedSizeInput.value;
    if (!selectedSize) {
      showToast('Silakan pilih ukuran terlebih dahulu.', 'error');
      return;
    }

    // Simulasi penambahan ke keranjang
    showToast(`"${product.name}" ukuran ${selectedSize} telah ditambahkan ke keranjang!`, 'success');
  });
}

// Ganti seluruh fungsi initCheckoutPage Anda dengan versi yang lebih simpel ini

function initCheckoutPage() {
  setDynamicTitle('Checkout');
  let productPrice = 0;
  let shippingCost = 0;
  const params = new URLSearchParams(window.location.search);
  productPrice = parseFloat(params.get('price')) || 0;
  const orderItemsContainer = document.getElementById('order-items');
  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');
  const shippingOptionsContainer = document.getElementById('shipping-options');
  const paymentOptionsContainer = document.getElementById('payment-options');
  const payButton = document.getElementById('pay-button');
  const paymentModal = document.getElementById('payment-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  if (!orderItemsContainer || !shippingOptionsContainer || !paymentOptionsContainer) { console.error('Elemen checkout penting tidak ditemukan.'); return; }
  const shippingRadios = shippingOptionsContainer.querySelectorAll('input[type="radio"]');
  const paymentLabels = paymentOptionsContainer.querySelectorAll('.selection-option');
  function updateTotals() {
    const totalCost = productPrice + shippingCost;
    subtotalEl.textContent = `Rp ${productPrice.toLocaleString('id-ID')}`;
    shippingEl.textContent = `Rp ${shippingCost.toLocaleString('id-ID')}`;
    totalEl.textContent = `Rp ${totalCost.toLocaleString('id-ID')}`;
  }
  if (!productPrice) {
    orderItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
    if (document.querySelector('.order-totals')) { document.querySelector('.order-totals').style.display = 'none'; }
    if (payButton) { payButton.style.display = 'none'; }
    return;
  }
  const productName = params.get('product');
  const productSize = params.get('size');
  const productImage = params.get('image');
  orderItemsContainer.innerHTML = `<div class="summary-item"><img src="${productImage}" alt="${productName}" class="summary-item__image"><div class="summary-item__info"><p class="summary-item__name">${productName}</p><p class="summary-item__meta">Ukuran: ${productSize || 'N/A'}</p></div><span class="summary-item__price">Rp ${productPrice.toLocaleString('id-ID')}</span></div>`;
  shippingRadios.forEach(radio => {
    if (radio.checked) {
      shippingCost = parseFloat(radio.dataset.cost);
      radio.closest('label').classList.add('selected');
    }
    radio.addEventListener('change', (e) => {
      e.target.closest('.selection-group').querySelectorAll('.selection-option').forEach(label => label.classList.remove('selected'));
      const selectedLabel = e.target.closest('label');
      selectedLabel.classList.add('selected');
      shippingCost = parseFloat(e.target.dataset.cost);
      updateTotals();
    });
  });
  paymentLabels.forEach(label => {
    if (label.querySelector('input').checked) {
      label.classList.add('selected');
    }
    label.addEventListener('click', (event) => {
      paymentLabels.forEach(opt => opt.classList.remove('selected'));
      const selectedLabel = event.currentTarget;
      selectedLabel.classList.add('selected');
      selectedLabel.querySelector('input[type="radio"]').checked = true;
    });
  });
  function openPaymentModal() {
    const selectedPayment = document.querySelector('input[name="payment-method"]:checked').value;
    const totalCost = productPrice + shippingCost;
    const formattedTotal = `Rp ${totalCost.toLocaleString('id-ID')}`;
    let modalHTML = '';
    if (selectedPayment === 'qris') {
      modalTitle.textContent = 'Pembayaran QRIS';
      modalHTML = `<p>Scan kode QR di bawah ini dengan aplikasi E-Wallet Anda.</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=diNaiki-payment-${totalCost}" alt="QR Code" class="qris-image"><div class="va-details"><div class="va-total">Total Pembayaran: <strong>${formattedTotal}</strong></div></div>`;
    } else if (selectedPayment === 'bca_va') {
      modalTitle.textContent = 'BCA Virtual Account';
      const vaNumber = `88088${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      modalHTML = `<p>Selesaikan pembayaran ke nomor Virtual Account di bawah ini.</p><div class="va-details"><div class="va-number">${vaNumber}</div><div class="va-total">Total Pembayaran: <strong>${formattedTotal}</strong></div></div><p style="font-size: 0.75rem;">Nomor akan kedaluwarsa dalam 24 jam.</p>`;
    }
    modalBody.innerHTML = modalHTML;
    paymentModal.classList.add('is-open');
  }
  function closePaymentModal() {
    paymentModal.classList.remove('is-open');
  }
  function donePaymentModal() {
    paymentModal.classList.remove('is-open');
    showToast('Pesanan berhasil dibuat!', 'success');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
  }
  if (payButton) {
    payButton.addEventListener('click', (e) => {
      e.preventDefault();
      const form = document.getElementById('checkout-form');
      if (form.checkValidity() === false) {
        showToast('Mohon lengkapi semua data pengiriman.', 'error');
        form.reportValidity();
        return;
      }
      openPaymentModal();
    });
  }
  modalOverlay.addEventListener('click', closePaymentModal);
  modalCloseBtn.addEventListener('click', closePaymentModal);
  modalDoneBtn.addEventListener('click', donePaymentModal);
  updateTotals();
}

// --- App Router ---
function App() {
  const isSubPage = window.location.pathname.includes('/pages/');
  const basePath = isSubPage ? '../' : './';

  loadComponent('header-placeholder', 'src/partials/header.html', basePath);
  loadComponent('footer-placeholder', 'src/partials/footer.html', basePath);

  const pageId = document.body.id;
  switch (pageId) {
    case 'page-home':
      initHomePage();
      break;
    case 'page-sneakers':
      initSneakersPage();
      break;
    case 'page-detail-product':
      initDetailProductPage();
      break;
    case 'page-about':
      setDynamicTitle('About Us');
      break;
    case 'page-contact':
      setDynamicTitle('Contact');
      break;
    case 'page-profile':
      setDynamicTitle('My Profile');
      break;
    case 'page-checkout':
      initCheckoutPage();
      break;
  }
}

document.addEventListener('DOMContentLoaded', App);