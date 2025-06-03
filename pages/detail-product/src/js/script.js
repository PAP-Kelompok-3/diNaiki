document.addEventListener("DOMContentLoaded", function () {
  const sizeBoxes = document.querySelectorAll(".size-box");
  const hiddenInput = document.getElementById("selectedSize");

  sizeBoxes.forEach(box => {
    box.addEventListener("click", () => {
      sizeBoxes.forEach(b => b.classList.remove("active"));
      box.classList.add("active");
      hiddenInput.value = box.dataset.size;
    });
  });
});