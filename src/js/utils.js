/**
 * utils.js
 * Berisi fungsi-fungsi pembantu yang digunakan di seluruh situs.
 */

export const DATA_URL = 'https://pap-kelompok-3.github.io/cdn-diNaiki/data.json';

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

export async function loadComponent(targetId, filePath, basePath = './') {
  const element = document.getElementById(targetId);
  if (!element) return;
  try {
    const response = await fetch(`${basePath}${filePath}`);
    if (!response.ok) throw new Error(`Gagal memuat ${filePath}`);
    let htmlContent = await response.text();
    htmlContent = htmlContent.replace(/{base_path}/g, basePath);
    element.innerHTML = htmlContent;
  } catch (error) {
    console.error(`Error memuat komponen ${targetId}:`, error);
  }
}

export function setDynamicTitle(pageTitle) {
  document.title = pageTitle ? `diNaiki - ${pageTitle}` : 'diNaiki';
}

export function showToast(message, type = 'info') {
  const existingToast = document.getElementById('custom-toast');
  if (existingToast) { existingToast.remove(); }
  const toast = document.createElement('div');
  toast.id = 'custom-toast';
  toast.className = `custom-toast custom-toast--${type}`;
  let iconClass = 'fas fa-info-circle';
  if (type === 'success') iconClass = 'fas fa-check-circle';
  if (type === 'error') iconClass = 'fas fa-exclamation-circle';
  toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { if (toast) toast.remove(); }, 500);
  }, 3000);
}

// --- FUNGSI-FUNGSI MANAJEMEN KERANJANG ---

export function getCart() {
  const cart = localStorage.getItem('diNaikiCart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('diNaikiCart', JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const cartItemId = `${product.id}-${product.size}`;
  const existingItem = cart.find(item => item.cartId === cartItemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      cartId: cartItemId, id: product.id, name: product.name,
      price: product.price, size: product.size, image: product.image,
      quantity: 1
    });
  }
  saveCart(cart);
}

export function getCartItemCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function removeFromCart(cartId) {
  let cart = getCart();
  cart = cart.filter(item => item.cartId !== cartId);
  saveCart(cart);
}

export function updateCartItem(cartId, updates) {
  let cart = getCart();
  const itemIndexToUpdate = cart.findIndex(item => item.cartId === cartId);
  if (itemIndexToUpdate === -1) return;

  const updatedItem = { ...cart[itemIndexToUpdate], ...updates };

  if (updatedItem.quantity <= 0) {
    cart.splice(itemIndexToUpdate, 1);
    saveCart(cart);
    return;
  }

  if (updates.size) {
    const newCartId = `${updatedItem.id}-${updatedItem.size}`;
    const existingDuplicateIndex = cart.findIndex((item, index) => item.cartId === newCartId && index !== itemIndexToUpdate);

    if (existingDuplicateIndex > -1) {
      cart[existingDuplicateIndex].quantity += updatedItem.quantity;
      cart.splice(itemIndexToUpdate, 1);
    } else {
      updatedItem.cartId = newCartId;
      cart[itemIndexToUpdate] = updatedItem;
    }
  } else {
    cart[itemIndexToUpdate] = updatedItem;
  }

  saveCart(cart);
}