$(document).ready(function () {
  // --- Preview Logo ---
  $("#logoInput").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) =>
        $("#logoPreview").attr("src", e.target.result).show();
      reader.readAsDataURL(file);
    }
  });

    $("#darkLogoInput").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => $("#darkLogoPreview").attr("src", e.target.result).show();
      reader.readAsDataURL(file);
    }
  });

  // --- Preview Favicon ---
  $("#faviconInput").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) =>
        $("#faviconPreview").attr("src", e.target.result).show();
      reader.readAsDataURL(file);
    }
  });

  // --- Add phone field ---
  $("#addPhone").on("click", function () {
    $("#phoneContainer").append(`
      <div class="input-group mb-2">
        <input type="text" name="phones" class="form-control" placeholder="Enter phone number">
        <button type="button" class="btn btn-outline-danger removePhone">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `);
  });

  // --- Remove phone field ---
  $(document).on("click", ".removePhone", function () {
    $(this).closest(".input-group").remove();
  });

   $("#addWorkingTime").on("click", function () {
    $("#workingTimeContainer").append(`
      <div class="input-group mb-2">
        <input type="text" name="workingtime" class="form-control" placeholder="e.g. Sat 10AM–4PM">
        <button type="button" class="btn btn-outline-danger removeWorkingTime">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `);
  });

  // =====================
  // REMOVE WORKING TIME
  // =====================
  $(document).on("click", ".removeWorkingTime", function () {
    $(this).closest(".input-group").remove();
  });


  // --- Save Contact Form (AJAX, no page refresh) ---
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    $.ajax({
      url: "/contact/save",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: (res) => {
        if (res.success) {
          toastr.success(res.message || "Saved successfully");
        } else {
          toastr.error(res.message || "Something went wrong");
        }
      },
      error: () => {
        toastr.error("Something went wrong!");
      },
    });
  });
});
