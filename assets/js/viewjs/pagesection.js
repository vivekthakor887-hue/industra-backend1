// ===============================
// MAIN IMAGE PREVIEW (OPTIONAL)
// ===============================
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

if (imageInput && imagePreview) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }
  });
}

// ===============================
// PAGE BG BANNER PREVIEW (OPTIONAL)
// ===============================
const pageBgBannerInput = document.getElementById("pageBgBannerInput");
const pageBgBannerPreview = document.getElementById("pageBgBannerPreview");

if (pageBgBannerInput && pageBgBannerPreview) {
  pageBgBannerInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        pageBgBannerPreview.src = e.target.result;
        pageBgBannerPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      pageBgBannerPreview.src = "";
      pageBgBannerPreview.style.display = "none";
    }
  });
}


document.getElementById("sectionForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };



    const formData = new FormData(this);


  try {
    const res = await fetch("/savesection", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      toastr.success(result.message);
    } else {
      toastr.error(result.message);
    }
  } catch (err) {
    toastr.error("Server error");
  }
});
