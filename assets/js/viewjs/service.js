document.addEventListener("DOMContentLoaded", function () {

  // --- Destroy old table if reloaded ---
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  // --- Quill Editor ---
  const quill = new Quill("#serviceEditor", { theme: "snow" });

  // --- Bootstrap Modal ---
  const modal = new bootstrap.Modal(document.getElementById("serviceModal"));

  // =====================================================
  // === ADDED : FEATURE + LABEL ADD MORE LOGIC ==========
  // =====================================================
  let rowCount = 0;

  function addRow(feature = "", label = "") {
    rowCount++;
    $("#rowsContainer").append(`
      <div class="mb-2 removeRow${rowCount}">
        <div class="row g-2">
          <div class="col-md-6">
            <input type="text"
              class="form-control featureInput"
              value="${feature}"
              placeholder="Feature"
              required>
          </div>
          <div class="col-md-5">
            <input type="text"
              class="form-control labelInput"
              value="${label}"
              placeholder="Label"
              required>
          </div>
          <div class="col-md-1 text-end">
            <button type="button"
              class="btn btn-outline-danger"
              onclick="removeRow(${rowCount})">
              <i class="fa fa-minus"></i>
            </button>
          </div>
        </div>
      </div>
    `);
  }

  $("#addRowBtn").on("click", () => addRow("", ""));

  window.removeRow = function (id) {
    $(".removeRow" + id).remove();
    if ($(".featureInput").length === 0) addRow("", "");
  };
  // =====================================================

  // --- DataTable Initialization ---
  const table = $("#zero_config").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    autoWidth: false,
    ajax: "/getservicejson",
    dom:
      "<'row mb-2'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 d-flex justify-content-end align-items-center'f<'ms-2'>>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    columns: [
      { data: "title" },
      {
        data: "description",
        render: (d) =>
          d ? d.replace(/<[^>]*>?/gm, "").substring(0, 50) + "..." : "",
      },
      {
        data: "image",
        render: (d) =>
          d
            ? `<img src="${d}" width="70" height="60" class="rounded border">`
            : "No Image",
      },
      {
        data: "_id",
        orderable: false,
        render: (id) => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light" data-bs-toggle="dropdown">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <button class="dropdown-item edit-btn" data-id="${id}">
                  <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>Edit
                </button>
              </li>
              <li>
                <button class="dropdown-item delete-btn text-danger" data-id="${id}">
                  <i class="fa-solid fa-trash me-2"></i>Delete
                </button>
              </li>
            </ul>
          </div>`,
      },
    ],
    order: [],
  });

  // --- Refresh Button ---
  setTimeout(() => {
    const searchContainer = $("#zero_config_filter");
    if (searchContainer.length && !$("#refreshTableBtn").length) {
      searchContainer
        .addClass("d-flex align-items-center gap-2")
        .append(`
          <button id="refreshTableBtn" class="btn btn-sm btn-outline-secondary ms-2">
            <i class="fa fa-rotate"></i>
          </button>
        `);
    }
  }, 300);

  $(document).on("click", "#refreshTableBtn", function () {
    table.ajax.reload(null, false);
  });

  // --- Image Preview ---
  $("#serviceImageInput").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) =>
        $("#servicePreviewImage").attr("src", e.target.result).show();
      reader.readAsDataURL(file);
    } else {
      $("#servicePreviewImage").hide();
    }
  });

  // --- Add Service ---
  $("#openServiceModal").on("click", function () {
    $("#serviceForm")[0].reset();
    $("#serviceId").val("");
    quill.root.innerHTML = "";

    // --- Features + Labels reset ---
    $("#rowsContainer").html("");
    rowCount = 0;
    addRow("", "");

    $("#serviceImageInput").val("");
    $("#servicePreviewImage").attr("src", "").hide();

    $("#serviceModalLabel").text("Add Service");
    modal.show();
  });

  // --- Edit Service ---
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) return toastr.error("Row data not found!");

    $("#serviceId").val(row._id);
    $("#title").val(row.title);
    quill.root.innerHTML = row.description || "";

    // --- Load features + labels ---
    $("#rowsContainer").html("");
    rowCount = 0;

    const features = row.features ? row.features.split(",") : [];
    const labels = Array.isArray(row.labels) ? row.labels : [];
    const max = Math.max(features.length, labels.length, 1);

    for (let i = 0; i < max; i++) {
      addRow(features[i] || "", labels[i] || "");
    }

    $("#serviceImageInput").val("");
    if (row.image) {
      $("#servicePreviewImage").attr("src", row.image).show();
    } else {
      $("#servicePreviewImage").hide();
    }

    $("#serviceModalLabel").text("Edit Service");
    modal.show();
  });

  // --- Delete Service ---
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");

    fetch(`/service/delete/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          toastr.success(json.message);
          table.ajax.reload(null, false);
        } else {
          toastr.error(json.message);
        }
      })
      .catch(() => toastr.error("Delete failed"));
  });

  // --- Generate Description by AI ---
  $("#generateServiceDescBtn").on("click", async function () {
    const name = $("#title").val().trim();
    if (!name) return toastr.warning("Please enter a service title first!");

    $(this).prop("disabled", true).text("Generating...");
    try {
      const res = await fetch("/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prompt:
            "Write a detailed service description for a website based on the title provided 20-25 words only.",
        }),
      });
      const data = await res.json();

      if (data.success && data.description) {
        quill.root.innerHTML = data.description;
        toastr.success("Description generated successfully!");
      } else {
        toastr.error(data.message || "Could not generate description");
      }
    } catch {
      toastr.error("Server error during AI generation!");
    } finally {
      $(this).prop("disabled", false).text("Generate Description by AI");
    }
  });

  // --- Submit Form ---
  $("#serviceForm").submit(function (e) {
    e.preventDefault();
    $("#description").val(quill.root.innerHTML);

    // --- Collect features + labels ---
    const features = $(".featureInput")
      .map((_, el) => $(el).val())
      .get();
    const labels = $(".labelInput")
      .map((_, el) => $(el).val())
      .get();

    const formData = new FormData(this);
    formData.set("features", features.join(","));
    formData.delete("labels");
    labels.forEach((l) => formData.append("labels[]", l));

    $.ajax({
      url: "/saveservice",
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
});


