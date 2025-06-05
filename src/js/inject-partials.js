function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

loadComponent("header-placeholder", "../../src/partials/header.html");
loadComponent("footer-placeholder", "../../src/partials/footer.html");