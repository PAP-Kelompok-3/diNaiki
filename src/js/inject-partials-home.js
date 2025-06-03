function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

// Load header dan footer
loadComponent("header-placeholder", "src/partials-home/header.html");
loadComponent("footer-placeholder", "src/partials-home/footer.html");
