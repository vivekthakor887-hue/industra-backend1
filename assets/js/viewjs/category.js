$(document).ready(function () {

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  const modal = new bootstrap.Modal(document.getElementById("categoryModal"));

  // Destroy old table
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  // --- Server-side DataTable ---
  const table = $("#zero_config").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    autoWidth: false,
    ajax: {
      url: "/getecocategoryjson",
      type: "GET",
    },
    columns: [
      { data: "title" },
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
          </div>
        `,
      },
    ],
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    order: [[0, "asc"]],
  });

  // --- Add Category ---
  $("#addCategoryBtn").click(() => {
    $("#categoryForm")[0].reset();
    $("#categoryId").val("");
    $("#categoryModalLabel").text("Add Category");
    modal.show();
  });

  // --- Submit Form ---
  $("#categoryForm").submit(function (e) {
    e.preventDefault();

    const id = $("#categoryId").val();
    const title = $("#title").val();

    $.ajax({
      url: "/saveecocategory",
      type: "POST",
      data: { id, title },
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

  // --- Edit Category ---
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Data not found!");
      return;
    }

    $("#categoryId").val(row._id);
    $("#title").val(row.title);
    $("#categoryModalLabel").text("Edit Category");
    modal.show();
  });

  // --- Delete Category ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/ecocategorydelete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Delete failed!"),
    });
  });
});
