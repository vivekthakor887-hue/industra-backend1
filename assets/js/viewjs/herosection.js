$(document).ready(function () {

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  const modal = new bootstrap.Modal($("#heroModal")[0]);

  // ===============================
  // DATATABLE DESTROY SAFE
  // ===============================
  if ($.fn.DataTable.isDataTable("#heroTable")) {
    $("#heroTable").DataTable().clear().destroy();
  }

  // ===============================
  // DATATABLE
  // ===============================
  const table = $("#heroTable").DataTable({
    responsive: true,
    autoWidth: false,
    searching: false,
    ajax: {
      url: "/herosectionjson",
      dataSrc: "data"
    },
    columns: [
      {
        data: "media",
        render: function (data) {
          if (!data) return "<span class='text-muted'>No Media</span>";

          if (/\.(mp4|webm|ogg)$/i.test(data)) {
            return `
              <video width="120" height="70" class="rounded border" controls>
                <source src="${data}">
              </video>`;
          }

          return `<img src="${data}" width="80" height="50" class="rounded border" style="object-fit:cover;">`;
        }
      },
      { data: "label" },
      { data: "title" },
      {
        data: "description",
        render: function (data) {
          if (!data) return "";
          const shortText = data.length > 45 ? data.substring(0, 40) + "..." : data;
          return `<span title="${data.replace(/"/g, "&quot;")}">${shortText}</span>`;
        }
      },
      {
        data: null,
        className: "text-center",
        render: () => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <button class="dropdown-item edit-btn">
                  <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>Edit
                </button>
              </li>
              <li>
                <button class="dropdown-item delete-btn">
                  <i class="fa-solid fa-trash me-2 text-danger"></i>Delete
                </button>
              </li>
            </ul>
          </div>`
      }
    ],
    order: []
  });

  // ===============================
  // MEDIA PREVIEW FIX
  // ===============================
  $("#mediaInput").on("change", function () {
    const file = this.files[0];
    if (!file) return;

    $("#previewImg").hide().attr("src", "");
    $("#previewVideo").hide().attr("src", "");

    const reader = new FileReader();

    reader.onload = e => {
      if (file.type.startsWith("video")) {
        $("#previewVideo").attr("src", e.target.result).show();
      } else {
        $("#previewImg").attr("src", e.target.result).show();
      }
    };

    reader.readAsDataURL(file);
  });

  // ===============================
  // ADD NEW
  // ===============================
  $("#addHeroBtn").click(() => {
    $("#heroForm")[0].reset();
    $("#heroId").val("");
    $("#previewImg, #previewVideo").hide().attr("src", "");
    modal.show();
  });

  // ===============================
  // SUBMIT
  // ===============================
  $("#heroForm").on("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const $btn = $("#heroForm button[type='submit']");
    const oldHtml = $btn.html();
    $btn.prop("disabled", true).html(`<span class="spinner-border spinner-border-sm"></span>`);

    $.ajax({
      url: "/herosectionsave",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: res => {
        $btn.prop("disabled", false).html(oldHtml);
        if (res.success) {
          toastr.success(res.message);
          modal.hide();
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => {
        $btn.prop("disabled", false).html(oldHtml);
        toastr.error("Something went wrong");
      }
    });
  });

  // ===============================
  // EDIT
  // ===============================
 $("#heroTable").on("click", ".edit-btn", function () {
    const row = table.row($(this).parents("tr")).data();

    $("#heroForm")[0].reset();
    $("#heroId").val(row._id);
    
    // FILL LABEL DATA
    $("#label").val(row.label || ""); 
    
    $("#title").val(row.title || "");
    $("#description").val(row.description || "");

    // Media not required on edit
    $("#mediaInput").prop('required', false);

    $("#previewImg, #previewVideo").hide().attr("src", "");
    if (row.media) {
      if (/\.(mp4|webm|ogg)$/i.test(row.media)) {
        $("#previewVideo").attr("src", row.media).show();
      } else {
        $("#previewImg").attr("src", row.media).show();
      }
    }
    modal.show();
  });

  // ===============================
  // DELETE
  // ===============================
  $("#heroTable").on("click", ".delete-btn", function () {
    const row = table.row($(this).parents("tr")).data();

    $.ajax({
      url: `/herosectiondelete/${row._id}`,
      type: "DELETE",
      success: res => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Delete failed")
    });
  });

});
