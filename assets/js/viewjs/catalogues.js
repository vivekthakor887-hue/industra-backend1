$(document).ready(function () {
  const catalogueModal = new bootstrap.Modal(
    document.getElementById("catalogueModal")
  );

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // --- Safe reinit ---
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  // --- DataTable ---
  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    ajax: {
      url: "/getcataloguejson",
      dataSrc: "data",
      error: function (xhr) {
        console.error("DataTable AJAX error:", xhr.responseText);
        toastr.error("Failed to load catalogues");
      },
    },
    columns: [
      { data: "title" },
      {
        data: "image",
        render: (data) =>
          data
            ? `<img src="${data}" width="70" height="60" class="rounded border">`
            : `<span class="text-muted">No Image</span>`,
      },
      {
        data: "pdf",
        render: (data) =>
          data
            ? `<a href="${data}" target="_blank" class="text-primary">
                <i class="fa-solid fa-file-pdf me-1"></i> View PDF
              </a>`
            : `<span class="text-muted">No PDF</span>`,
      },
      {
        data: null,
        className: "text-center",
        render: (row) => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <button class="dropdown-item edit-btn" data-id="${row._id}">
                  <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>Edit
                </button>
              </li>
              <li>
                <button class="dropdown-item delete-btn" data-id="${row._id}">
                  <i class="fa-solid fa-trash me-2 text-danger"></i>Delete
                </button>
              </li>
            </ul>
          </div>`,
      },
    ],
  });

  // --- Add Catalogue ---
  $("#addCatalogueBtn").on("click", function () {
    $("#catalogueForm")[0].reset();
    $("#catalogueId").val("");
    $("#previewImage, #pdfPreview").hide();
    $("#catalogueModalLabel").text("Add Catalogue");
    catalogueModal.show();
  });

  // --- Image Preview ---
  $("#imageInput").change(function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) =>
        $("#previewImage").attr("src", e.target.result).show();
      reader.readAsDataURL(file);
    } else {
      $("#previewImage").hide();
    }
  });

  // --- PDF Preview ---
  $("#pdfInput").change(function () {
    const file = this.files[0];
    if (file) {
      $("#pdfName").text(file.name);
      $("#pdfPreview").show();
    } else {
      $("#pdfPreview").hide();
    }
  });

  // --- Submit Form ---
  $("#catalogueForm").submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const id = $("#catalogueId").val();
    if (id) formData.append("id", id);

    $.ajax({
      url: "/saveCatalogue",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          catalogueModal.hide();
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Something went wrong!"),
    });
  });

  // --- Edit Catalogue ---
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Data not found!");
      return;
    }

    //  RESET modal first
    $("#catalogueForm")[0].reset();
    $("#previewImage, #pdfPreview").hide();

    $("#catalogueId").val(row._id);
    $("#title").val(row.title);

    if (row.image) {
      $("#previewImage").attr("src", row.image).show();
    }

    if (row.pdf) {
      $("#pdfName").text(row.pdf.split("/").pop());
      $("#pdfPreview").show();
    }

    $("#catalogueModalLabel").text("Edit Catalogue");
    catalogueModal.show();
  });

  // --- Delete Catalogue ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/catalogue/delete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Failed to delete Catalogue"),
    });
  });
});
