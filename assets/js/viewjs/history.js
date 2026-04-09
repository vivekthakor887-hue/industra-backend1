$(document).ready(function () {
  let quill = new Quill("#editor", { theme: "snow" });
  const modal = new bootstrap.Modal(document.getElementById("historyModal"));

  // =========================
  // TOASTR CONFIG
  // =========================
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // --- DataTable Setup ---
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    ajax: { url: "/gethistoryjson", dataSrc: "data" },
    columns: [
      { data: "title" },
      {
        data: "description",
        render: (data) =>
          data ? data.replace(/<[^>]*>?/gm, "").substring(0, 60) + "..." : "",
      },
      {
        data: "image",
        render: (data) =>
          data
            ? `<img src="${data}" width="70" height="60" class="rounded border">`
            : `<span class="text-muted">No Image</span>`,
      },
      { data: "year" },
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

  // =========================
  // ADD HISTORY (RESET ALL)
  // =========================
  $("#addHistoryBtn").click(() => {
    $("#historyForm")[0].reset();
    $("#historyId").val("");
    quill.root.innerHTML = "";

    $("#imageInput").val("");            
    $("#previewImage").attr("src", "").hide(); 

    $("#historyModalLabel").text("Add History");
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
      $("#previewImage").attr("src", "").hide();
    }
  });

  // --- Generate by AI ---
  $("#generateAiBtn").click(async function () {
    const title = $("#title").val().trim();
    if (!title) {
      toastr.error("Please enter a title first!");
      return;
    }

    $(this).prop("disabled", true).text("Generating...");
    try {
      const res = await fetch("/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          prompt:
            "Generate a detailed history description for the title provided. 20-25 words only.",
        }),
      });

      const data = await res.json();

      if (data.success && data.description) {
        quill.root.innerHTML = data.description;
        toastr.success("AI content generated successfully!");
      } else {
        toastr.error(data.message || "Failed to generate content");
      }
    } catch (err) {
      toastr.error("Something went wrong!");
    } finally {
      $(this)
        .prop("disabled", false)
        .html(
          `<i class="fa-solid fa-wand-magic-sparkles me-1"></i> Generate by AI`
        );
    }
  });

  // --- Submit Form ---
  $("#historyForm").submit(function (e) {
    e.preventDefault();
    $("#description").val(quill.root.innerHTML);

    const formData = new FormData(this);
    const id = $("#historyId").val();
    if (id) formData.append("id", id);

    $.ajax({
      url: "/saveHistory",
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

  // =========================
  // EDIT HISTORY (RESET FIRST)
  // =========================
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Data not found!");
      return;
    }

    $("#historyForm")[0].reset();       // ✅ reset form first
    $("#imageInput").val("");           // ✅ reset file input
    $("#previewImage").attr("src", "").hide(); // ✅ clear preview

    $("#historyId").val(row._id);
    $("#title").val(row.title);
    quill.root.innerHTML = row.description || "";
    $("#year").val(row.year || "");

    if (row.image) {
      $("#previewImage").attr("src", row.image).show();
    }

    $("#historyModalLabel").text("Edit History");
    modal.show();
  });

  // --- Delete ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");

    $.ajax({
      url: `/history/delete/${id}`,
      type: "DELETE",
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Failed to delete record"),
    });
  });
});
