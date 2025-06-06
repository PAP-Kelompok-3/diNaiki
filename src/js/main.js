import { loadComponent, setDynamicTitle, fetchData } from './utils.js';

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
        alert(`"${product.name}" telah ditambahkan ke keranjang! (simulasi)`);
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

  // Populate basic info
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('product-price').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('sold-count').textContent = `${product.sold} terjual`;
  document.getElementById('rating-value').textContent = product.rating;

  // Image gallery
  const mainImage = document.getElementById('main-image');
  const thumbnailsContainer = document.getElementById('thumbnails');
  let currentImageIndex = 0;

  const galleryImages = product.images.filter(url => !url.includes('size-chart.svg'));

  const updateImage = (index) => {
    mainImage.src = galleryImages[index];
    thumbnailsContainer.querySelectorAll('img').forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
    currentImageIndex = index;
  };

  galleryImages.forEach((imgSrc, index) => {
    const thumb = document.createElement('img');
    thumb.src = imgSrc;
    thumb.alt = `Thumbnail ${index + 1}`;
    thumb.addEventListener('click', () => updateImage(index));
    thumbnailsContainer.appendChild(thumb);
  });
  updateImage(0); // Set initial image

  document.getElementById('thumb-prev').addEventListener('click', () => {
    const newIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateImage(newIndex);
  });
  document.getElementById('thumb-next').addEventListener('click', () => {
    const newIndex = (currentImageIndex + 1) % galleryImages.length;
    updateImage(newIndex);
  });

  // Size selection
  const sizesContainer = document.getElementById('sizes-container');
  const selectedSizeInput = document.getElementById('selectedSize');
  product.sizes.forEach(size => {
    const sizeBox = document.createElement('div');
    sizeBox.className = 'size-box';
    sizeBox.textContent = size;
    sizeBox.addEventListener('click', (e) => {
      sizesContainer.querySelectorAll('.size-box').forEach(box => box.classList.remove('active'));
      e.target.classList.add('active');
      selectedSizeInput.value = size;
    });
    sizesContainer.appendChild(sizeBox);
  });
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
  }
}

document.addEventListener('DOMContentLoaded', App);