$(document).ready(function () {
  const modal = new bootstrap.Modal(
    document.getElementById("exhibitionModal")
  );

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // --- DataTable ---
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    ajax: { url: "/getexhibitionjson", dataSrc: "data" },
    columns: [
      { data: "title" },
      { data: "location" },
      {
        data: "image",
        render: (data) =>
          data
            ? `<img src="${data}" width="70" height="60" class="rounded border">`
            : `<span class="text-muted">No Image</span>`,
      },
      { data: "date" },
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

  // --- Add Exhibition ---
  $("#addExhibitionBtn").click(() => {
    $("#exhibitionForm")[0].reset();
    $("#exhibitionId").val("");
    $("#previewImage").hide();
    $("#exhibitionModalLabel").text("Add Exhibition");
    modal.show();
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

  // --- Submit Form ---
  $("#exhibitionForm").submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const id = $("#exhibitionId").val();
    if (id) formData.append("id", id);

    $.ajax({
      url: "/saveExhibition",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          modal.hide();
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Something went wrong!"),
    });
  });

  // --- Edit Exhibition ---
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Data not found!");
      return;
    }

    //  reset modal first
    $("#exhibitionForm")[0].reset();
    $("#previewImage").hide();

    $("#exhibitionId").val(row._id);
    $("#title").val(row.title);
    $("#location").val(row.location);
    $("#date").val(row.date ? row.date.split("T")[0] : "");

    if (row.image) {
      $("#previewImage").attr("src", row.image).show();
    }

    $("#exhibitionModalLabel").text("Edit Exhibition");
    modal.show();
  });

  // --- Delete Exhibition ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/exhibition/delete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Failed to delete Exhibition"),
    });
  });
});
