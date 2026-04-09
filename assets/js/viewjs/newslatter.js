$(document).ready(function () {

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // --- Safe reinit ---
  if ($.fn.DataTable.isDataTable("#newsletterTable")) {
    $("#newsletterTable").DataTable().clear().destroy();
  }

  // --- Initialize DataTable ---
  const table = $("#newsletterTable").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    autoWidth: false,
    ajax: { url: "/newsletter/data", dataSrc: "data" },
    columns: [
      {
        data: "_id",
        orderable: false,
        render: (data) =>
          `<input type="checkbox" class="rowCheckbox" value="${data}">`,
      },
      { data: "email" },
      {
        data: "createdAt",
        render: (data) => new Date(data).toLocaleString(),
      },
      {
        data: null,
        orderable: false,
        className: "text-center",
        render: (row) => `
         <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <button class="dropdown-item deleteBtn" data-id="${row._id}">
                  <i class="fa-solid fa-trash me-2 text-danger"></i>Delete
                </button>
              </li>
            </ul>
          </div>`,
      },
    ],
    order: [[2, "desc"]],
    initComplete: function () {
      const filterWrapper = $("#newsletterTable_wrapper .dataTables_filter");
      filterWrapper.addClass(
        "d-flex justify-content-end align-items-center gap-2"
      );

      const buttons = $(`
        <button id="refreshTable" class="btn btn-outline-secondary btn-sm">
          <i class="fa-solid fa-rotate"></i>
        </button>
      `);

      filterWrapper.append(buttons);
    },
  });

  // --- Refresh Table ---
  $(document).on("click", "#refreshTable", function () {
    table.ajax.reload(null, false);
  });

  // --- Select All Checkbox ---
  $("#selectAll").on("click", function () {
    $(".rowCheckbox").prop("checked", this.checked);
    toggleBulkDeleteBtn();
  });

  // --- Update Select All & bulk button visibility ---
  $("#newsletterTable").on("change", ".rowCheckbox", function () {
    const all = $(".rowCheckbox").length;
    const checked = $(".rowCheckbox:checked").length;
    $("#selectAll").prop("checked", all === checked);
    toggleBulkDeleteBtn();
  });

  // --- Toggle bulk delete button ---
  function toggleBulkDeleteBtn() {
    const anyChecked = $(".rowCheckbox:checked").length > 0;
    $("#bulkDeleteBtn").toggleClass("d-none", !anyChecked);
  }

  // --- Single Delete ---
  $("#newsletterTable").on("click", ".deleteBtn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/newsletter/delete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Something went wrong!"),
    });
  });

  // --- Bulk Delete ---
  $(document).on("click", "#bulkDeleteBtn", function () {
    const selected = $(".rowCheckbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    if (!selected.length) {
      toastr.warning("No rows selected!");
      return;
    }

   

    $.ajax({
      url: "/newsletter/bulk-delete",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ ids: selected }),
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          $("#selectAll").prop("checked", false);
          table.ajax.reload(null, false);
          $("#bulkDeleteBtn").addClass("d-none");
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Something went wrong!"),
    });
  });

});
