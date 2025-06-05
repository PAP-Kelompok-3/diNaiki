// src/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi reference ke elemen-elemen penting
  const hiddenInput = document.getElementById("selectedSize");
  const mainImageEl = document.getElementById("main-image");
  const thumbsEl = document.getElementById("thumbnails");
  const titleEl = document.getElementById("product-title");
  const priceEl = document.getElementById("product-price");
  const soldCountEl = document.getElementById("sold-count");
  const ratingValueEl = document.getElementById("rating-value");
  const descEl = document.getElementById("product-description");
  const sizesContainer = document.getElementById("sizes-container");
  const addBtn = document.getElementById("btn-add");
  const buyBtn = document.getElementById("btn-buy");

  // 2. Fungsi untuk pasang handler pada setiap kotak ukuran (size-box)
  function attachSizeBoxHandlers() {
    const sizeBoxes = document.querySelectorAll(".size-box");
    sizeBoxes.forEach(box => {
      box.addEventListener("click", () => {
        // Hapus kelas .selected dan .active dari semua size-box
        sizeBoxes.forEach(b => b.classList.remove("selected", "active"));
        // Tambahkan kelas pada kotak yang diklik
        box.classList.add("selected", "active");

        // Simpan nilai ukuran ke input hidden
        if (hiddenInput) hiddenInput.value = box.dataset.size;
      });
    });
  }

  // Pasang handler awal (untuk kotak ukuran placeholder)
  attachSizeBoxHandlers();

  // 3. Ambil parameter 'id' dari URL, ubah ke indeks array
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const index = parseInt(idParam, 10) - 1; // id mulai dari 1, kita ubah ke 0-based index

  if (!idParam || isNaN(index) || index < 0) {
    console.warn("Parameter 'id' tidak valid atau tidak ditemukan.");
    return;
  }

  // 4. Fetch data.json dan render detail produk
  fetch("https://pap-kelompok-3.github.io/cdn-diNaiki/data.json")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Data JSON bukan array.");
      if (index >= data.length) throw new Error(`Index ${index} melebihi panjang data.`);

      const item = data[index]; // Objek sepatu yang dipilih

      // 4a. Ganti gambar utama dengan gambar pertama di array item.images
      if (mainImageEl && item.images?.length > 0) {
        mainImageEl.src = item.images[0];
        mainImageEl.alt = item.name;
      }

      // 4b. Render semua thumbnail (kecuali yang mengandung 'size-chart')
      if (thumbsEl && item.images?.length > 0) {
        thumbsEl.innerHTML = ""; // Kosongkan dulu
        item.images.forEach((imgUrl, i) => {
          // Lewati file size-chart
          if (imgUrl.includes("size-chart")) return;

          const thumb = document.createElement("img");
          thumb.src = imgUrl;
          thumb.alt = `Thumbnail ${i + 1} - ${item.name}`;
          thumb.className = "thumbnail";
          thumb.width = 64;
          thumb.height = 64;
          // Jika thumbnail diklik → ganti main image
          thumb.addEventListener("click", () => {
            mainImageEl.src = imgUrl;
            mainImageEl.alt = `${item.name} - Thumbnail ${i + 1}`;
          });
          thumbsEl.appendChild(thumb);
        });
      }

      // 4c. Ganti judul produk
      if (titleEl) {
        titleEl.textContent = item.name;
      }

      // 4d. Ganti harga (format Rp x.xxx.xxx,00)
      if (priceEl) {
        priceEl.textContent = "Rp " + item.price.toLocaleString("id-ID") + ",00";
      }

      // 4e. Ganti 'sold' dan 'rating'
      //   - soldCountEl menampilkan "<angka> sold"
      //   - ratingValueEl menampilkan angka desimal (misal 4.9)
      if (soldCountEl && item.sold !== undefined) {
        soldCountEl.textContent = `${item.sold} sold`;
      }
      if (ratingValueEl && item.rating !== undefined) {
        // Jika rating disimpan sebagai number (misal 4.9), langsung pakai
        ratingValueEl.textContent = item.rating;
      }

      // 4f. Ganti deskripsi
      if (descEl) {
        descEl.textContent = item.description;
      }

      // 4g. Ganti daftar ukuran (sizes)
      if (sizesContainer && Array.isArray(item.sizes)) {
        sizesContainer.innerHTML = ""; // Kosongkan placeholder
        item.sizes.forEach(size => {
          const box = document.createElement("div");
          box.className = "size-box";
          box.dataset.size = size;
          box.textContent = size;
          sizesContainer.appendChild(box);
        });
        // Pasang ulang handler untuk kotak ukuran baru
        attachSizeBoxHandlers();
      }

      // 4h. Pasang event pada tombol "Add to cart"
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const selectedSize = hiddenInput?.value;
          if (!selectedSize) {
            alert("Silakan pilih ukuran terlebih dahulu.");
            return;
          }
          alert(`Produk "${item.name}" ukuran ${selectedSize} berhasil ditambahkan ke keranjang!`);
          // TODO: Ganti alert dengan logika cart nyata jika diperlukan
        });
      }

      // 4i. Pasang event pada tombol "Buy it now"
      if (buyBtn) {
        buyBtn.addEventListener("click", () => {
          const selectedSize = hiddenInput?.value;
          if (!selectedSize) {
            alert("Silakan pilih ukuran terlebih dahulu.");
            return;
          }
          // Contoh redirect ke halaman checkout dengan parameter product & size
          const checkoutUrl = `checkout.html?product=${encodeURIComponent(item.name)}&size=${encodeURIComponent(selectedSize)}`;
          window.location.href = checkoutUrl;
        });
      }

    })
    .catch(err => {
      console.error("Gagal memuat detail produk:", err);
    });
});
