function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(err => console.error(`Gagal load component ${file}:`, err));
}

loadComponent("header-placeholder", "../../src/partials/header.html");
loadComponent("footer-placeholder", "../../src/partials/footer.html");