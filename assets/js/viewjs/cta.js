
// --- 1. Image preview on file select ---
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});

document.getElementById("sectionForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  const form = e.target;

  // --- Use FormData for file upload ---
  const formData = new FormData();
  formData.append("type", form.type.value.trim()); // 'cta'
  formData.append("title", form.title.value.trim());
  formData.append("label", form.label.value.trim());
  formData.append("description", form.description.value.trim());

  // Append image if selected
  if (form.image.files[0]) {
    formData.append("image", form.image.files[0]);
  }

  
  try {
    const res = await fetch("/savecta", {
      method: "POST",
      body: formData, // send as multipart/form-data
    });

    const result = await res.json();

    if (result.success) {
      toastr.success(result.message);

      // Update image preview if returned
      if (result.data.image) {
        const img = form.querySelector("img");
        if (img) img.src = result.data.image;
      }
    } else {
      toastr.error(result.message);
    }
  } catch (err) {
    console.error(err);
    toastr.error("Server error");
  }
});
