$(document).ready(function () {

  // --- Toastr config ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  const modal = new bootstrap.Modal(document.getElementById("bannerModal"));
 if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  // --- Initialize DataTable ---
  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    searching: false,
    ajax: {
      url: "/getgalleryjson",
      dataSrc: "data",
    },
    columns: [
      {
        data: "image",
        render: data => data 
          ? `<img src="${data}" width="100" height="60" class="rounded border">`
          : `<span class="text-muted">No Image</span>`
      },
      {
        data: null,
        className: "text-center",
        render: row => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <button class="dropdown-item d-flex align-items-center py-2 edit-btn" data-id="${row._id}">
                  <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>
                  <span class="text-primary">Edit</span>
                </button>
              </li>
              <li>
                <button type="button" class="dropdown-item d-flex align-items-center py-2 delete-btn" data-id="${row._id}">
                  <i class="fa-solid fa-trash me-2 text-danger"></i>
                  <span class="text-danger">Delete</span>
                </button>
              </li>
            </ul>
          </div>
        `
      }
    ]
  });

  // --- Add Banner ---
  $("#addBannerBtn").click(() => {
    $("#bannerForm")[0].reset();
    $("#bannerId").val("");
    $("#imageInput").val("");              
    $("#previewImage").attr("src", "").hide();
    $("#bannerModalLabel").text("Add Gallery");
    modal.show();
  });

  // --- Image Preview ---
  $("#imageInput").on("change", function () {
    const file = this.files[0];
    if (!file) return $("#previewImage").hide();
    const reader = new FileReader();
    reader.onload = e => $("#previewImage").attr("src", e.target.result).show();
    reader.readAsDataURL(file);
  });

  // --- Submit Banner Form ---
  $("#bannerForm").submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const id = $("#bannerId").val();
    if (id) formData.append("id", id);

    const btn = $(this).find("button[type='submit']");
    const old = btn.html();
    btn.prop("disabled", true).html(`<span class="spinner-border spinner-border-sm"></span>`);

    $.ajax({
      url: "/savegallery",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: res => {
        btn.prop("disabled", false).html(old);
        if (res.success) {
          toastr.success(res.message || "Banner saved successfully");
          modal.hide();
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message || "Failed to save banner");
        }
      },
      error: () => {
        btn.prop("disabled", false).html(old);
        toastr.error("Something went wrong");
      }
    });
  });

  // --- Edit Banner ---
// --- Edit Banner ---
$("#zero_config").on("click", ".edit-btn", function () {

  // FIX: pehle old preview & file input clear
  $("#bannerForm")[0].reset();
  $("#imageInput").val("");
    $("#imageInput").val("").prop("required", false);
  $("#previewImage").attr("src", "").hide();

  const rowData = table.row($(this).closest("tr")).data();
  if (!rowData) return toastr.error("Row data not found");

  $("#bannerId").val(rowData._id);
  $("#bannerModalLabel").text("Edit Gallery");

  //  Ab current image show karo
  if (rowData.image) {
    $("#previewImage").attr("src", rowData.image).show();
  }

  modal.show();
});


  // --- Delete Banner ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    if (!id) return toastr.error("Banner ID not found");

      $.ajax({
        url: `/gallery/delete/${id}`,
        type: "DELETE",
        success: res => {
          if (res.success) {
            toastr.success(res.message || "Gallery deleted");
            table.ajax.reload(null, false);
          } else {
            toastr.error(res.message || "Failed to delete");
          }
        },
        error: () => toastr.error("Something went wrong")
      });
    
  });

});
