$(document).ready(function () {
  // --- Toastr Config ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  // Destroy previous DataTable if exists
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  const modal = new bootstrap.Modal(document.getElementById("testimonialModal"));

  // Initialize DataTable
  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    ajax: { url: "/testimonialjson" },
    columns: [
      { data: "clientName" },
      {
        data: "quote",
        render: (data) =>
          data ? data.replace(/<[^>]*>?/gm, "").substring(0, 60) + "..." : ""
      },
      { data: "location" },
      { data: "rating" },
      {
        data: null,
        className: "text-center",
        render: (row) => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li><button class="dropdown-item edit-btn" data-id="${row._id}">
                <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>Edit
              </button></li>
              <li><button class="dropdown-item delete-btn" data-id="${row._id}">
                <i class="fa-solid fa-trash me-2 text-danger"></i>Delete
              </button></li>
            </ul>
          </div>
        `
      }
    ]
  });

  // ================= Add Testimonial =================
  $("#addTestimonialBtn").click(() => {
    $("#testimonialForm")[0].reset();
    $("#testimonialId").val("");
    $("#testimonialModalLabel").text("Add Testimonial");
    modal.show();
  });

  // ================= Submit Form =================
  $("#testimonialForm").submit(function (e) {
    e.preventDefault();

    const formData = $(this).serialize(); // no files, simple form
    const id = $("#testimonialId").val();
    if (id) formData.id = id;

    $.ajax({
      url: "/testimonialsave",
      type: "POST",
      data: formData,
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          modal.hide();
          table.ajax.reload(null, false); // reload table safely
        } else toastr.error(res.message);
      },
  error: (xhr) => {
      let msg = "Something went wrong!";
      if (xhr.responseJSON && xhr.responseJSON.message) msg = xhr.responseJSON.message;
      toastr.error(msg);
      console.error("AJAX Error:", xhr.responseText);
    }    });
  });

  // ================= Edit Testimonial =================
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) return toastr.error("Data not found!");

    $("#testimonialId").val(row._id);
    $("#clientName").val(row.clientName);
    $("#quote").val(row.quote);
    $("#location").val(row.location);
    $("#rating").val(row.rating);

    $("#testimonialModalLabel").text("Edit Testimonial");
    modal.show();
  });

  // ================= Delete Testimonial =================
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/testimonialdelete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else toastr.error(res.message);
      },
      error: () => toastr.error("Failed to delete testimonial!")
    });
  });
});
