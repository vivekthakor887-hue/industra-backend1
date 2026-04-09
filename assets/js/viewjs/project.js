document.addEventListener("DOMContentLoaded", function () {

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // --- GLOBAL VARIABLES FOR IMAGES ---
  let selectedImages = [];       // Store New File Objects
  let existingImagesList = [];   // Store Existing Image URLs (Strings)
  let deletedImagesList = [];    // Store URLs of Existing Images to Delete

  // --- 1. Initialize Variables & Third-party Libraries ---

  // Initialize Quill Editor
  let quill;
  if (document.getElementById("editor")) {
    quill = new Quill("#editor", { theme: "snow" });
  }

  // Initialize Bootstrap Modal
  const modalElement = document.getElementById("productModal");
  const modal = new bootstrap.Modal(modalElement);

  // Initialize DataTable
  let table;
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  table = $("#zero_config").DataTable({
    processing: true,
    serverSide: true,
    responsive: true,
    autoWidth: false,
    ajax: "/getprojectjson",
    dom:
      "<'row mb-2'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 d-flex justify-content-end align-items-center'f<'ms-2'>>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    columns: [
      { data: "title" },
      {
        data: "category.title",
        render: (d) => d || "<span class='text-muted'>No Category</span>",
      },
      {
        data: "images", // Assuming backend returns an array of strings
        render: (d) =>
          d && d.length > 0
            ? `<img src="${d[0]}" width="70" height="60" class="rounded border">`
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

  // Refresh Button
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

  // ================================
  // --- IMAGE HANDLING LOGIC ---
  // ================================

  // 1. Handle New File Selection
  $("#imageInput").on("change", function () {
    const files = Array.from(this.files);
    files.forEach(file => selectedImages.push(file));
    renderAllImages();
    this.value = ""; // Clear input to allow re-selecting same file if needed
  });

  // 2. Main Render Function (Shows Existing + New)
  function renderAllImages() {
    const container = $("#previewImageContainer");
    container.html("");

    // A. Render Existing Images (Server URLs)
    existingImagesList.forEach((src, index) => {
      container.append(`
        <div class="position-relative d-inline-block me-2 mb-2">
          <img src="${src}" class="rounded border" width="100" height="100" style="object-fit:cover;">
          <button type="button"
            class="btn btn-danger btn-sm position-absolute top-0 end-0 remove-image"
            data-type="existing" 
            data-index="${index}">×</button>
        </div>
      `);
    });

    // B. Render New Selected Images (File Objects)
    selectedImages.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = e => {
        // We use a specific ID based on index to avoid overwriting if async messes up order
        // But appending directly works fine usually.
        const previewHtml = `
          <div class="position-relative d-inline-block me-2 mb-2">
            <img src="${e.target.result}" class="rounded border" width="100" height="100" style="object-fit:cover;">
            <button type="button"
              class="btn btn-danger btn-sm position-absolute top-0 end-0 remove-image"
              data-type="new" 
              data-index="${index}">×</button>
          </div>
        `;
        container.append(previewHtml);
      };
      reader.readAsDataURL(file);
    });
  }

  // 3. Handle Remove Click (For both Existing and New)
  $(document).on("click", ".remove-image", function () {
    const index = $(this).data("index");
    const type = $(this).data("type");

    if (type === "existing") {
      // Add to deleted list for backend processing
      deletedImagesList.push(existingImagesList[index]);
      // Remove from the visible list
      existingImagesList.splice(index, 1);
    } else {
      // Remove from new files array
      selectedImages.splice(index, 1);
    }

    renderAllImages();
  });

    // ================================
  // SINGLE SECTION IMAGE PREVIEW ---
  // ================================
  const sectionImageInput = document.getElementById("sectionImageInput");
  const sectionImagePreview = document.getElementById("sectionImagePreview");

  if (sectionImageInput) {
    sectionImageInput.addEventListener("change", function () {
      const file = this.files[0];
      sectionImagePreview.innerHTML = ""; // Clear previous preview

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "10%";
          img.style.height = "auto";
          img.classList.add("rounded", "shadow-sm"); // Optional styling
          sectionImagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Load Categories
  async function loadCategories(selectedId = "") {
    try {
      const res = await fetch("/getecocategoryjson");
      const data = await res.json();
      const select = $("#category");

      select.empty().append('<option value="">-- Select Category --</option>');

      (data.data || []).forEach((cat) => {
        const isSelected =
          String(selectedId) === String(cat._id) ? "selected" : "";
        select.append(
          `<option value="${cat._id}" ${isSelected}>${cat.title}</option>`
        );
      });
    } catch (err) {
      toastr.error("Failed to load categories");
    }
  }


  // ================================
  // --- Steps / Add More Logic ---
  // ================================
 function addItem(item = {}) {
  $("#itemContainer").append(`
    <div class="item-row border rounded-3 p-3 mt-3">
      <div class="row g-3 align-items-start">

        <div class="col-md-4">
          <label class="form-label mb-1">Icon</label>
          <input type="text" class="form-control iconName" value="${item.iconName || ""}">
           <small class="text-muted">
            from <a href="https://lucide.dev/icons" target="_blank">component name from lucide.dev</a>
          </small>
        </div>

        <div class="col-md-3">
          <label class="form-label mb-1">Title</label>
          <input type="text" class="form-control itemTitle" value="${item.title || ""}">
        </div>

        <div class="col-md-3">
          <label class="form-label mb-1">Label</label>
          <textarea class="form-control itemLabel" rows="1">${item.label || ""}</textarea>
        </div>

        <!--  REMOVE BUTTON INLINE -->
        <div class="col-md-1 d-flex justify-content-center">
          <button type="button" class="btn btn-outline-danger removeItemBtn mt-4">
            <i class="fa fa-minus"></i>
          </button>
        </div>

      </div>
    </div>
  `);
}


  // Remove item row
  $(document).on("click", ".removeItemBtn", function () {
    $(this).closest(".item-row").remove();

    // Always keep at least 1 row
    if ($("#itemContainer .item-row").length === 0) addItem();
  });

  // Add new item button
  $("#addItemBtn").on("click", function () {
    addItem();
  });

  // Add Product Modal Open
  $("#openProductModal").on("click", async function () {
    $("#productForm")[0].reset();
    $("#productId").val("");
    if (quill) quill.root.innerHTML = "";

    // Reset items
    $("#itemContainer").html(""); 
    addItem(); // always 1 default row

    // Reset Image Arrays
    selectedImages = [];
    existingImagesList = [];
    deletedImagesList = [];
    $("#previewImageContainer").html(""); 
    $("#sectionImagePreview").html(""); 

    $("#productModalLabel").text("Add Project");
    await loadCategories();
    modal.show();
  });

  // Edit Product Modal Open
  $("#zero_config").on("click", ".edit-btn", async function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Row data not found!");
      return;
    }

    $("#productId").val(row._id);
    $("#title").val(row.title);
  $("#name").val(row.name || "");
  $("#about").val(row.about || "");
    if (quill) quill.root.innerHTML = row.description || "";

    // Load Items
    $("#itemContainer").html("");
    (row.items || []).forEach(i => addItem(i));
    if (!row.items?.length) addItem(); 

    // --- SETUP IMAGES FOR EDIT ---
    selectedImages = [];        // Clear new files
    deletedImagesList = [];     // Clear deletion list
    existingImagesList = [];    // Reset existing list

    // Check if row.images exists and is an array (or single string handled here)
    if (row.images && Array.isArray(row.images)) {
        existingImagesList = [...row.images]; // Copy array
    } else if (row.images && typeof row.images === 'string') {
        existingImagesList.push(row.images);
    }
    $("#sectionImagePreview").html(""); 

      if (row.sectionImage && row.sectionImage != "") {
       $("#sectionImagePreview").html(` <img src=${row.sectionImage} alt="Preview" class="rounded border"
                              style="width:140px; height:auto;">`)
      }
    
    // Render the existing images
    renderAllImages();

    $("#productModalLabel").text("Edit Project");
    await loadCategories(row.category?._id);
    modal.show();
  });

  // AI Description
  $("#generateDescBtn").on("click", async function () {
    const name = $("#title").val().trim();
    if (!name) {
      toastr.warning("Please enter a product title first!");
      return;
    }

    const btn = $(this);
    btn.prop("disabled", true).text("Generating...");

    try {
      const res = await fetch("/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,
          prompt: "Write a detailed product description for a website based on the title provided 20-25 words only." 
        }),
      });
      const data = await res.json();

      if (data.success && data.description) {
        if (quill) quill.root.innerHTML = data.description;
        toastr.success("Description generated successfully!");
      } else {
        toastr.error(data.message || "Could not generate description");
      }
    } catch (err) {
      toastr.error("Server error during AI generation!");
    } finally {
      btn.prop("disabled", false).text("Generate Description by AI");
    }
  });

  // Submit Form
  $("#productForm").submit(function (e) {
    e.preventDefault();

    if (quill) $("#description").val(quill.root.innerHTML);
    const formData = new FormData(this);

    // 1. Append New Images
    selectedImages.forEach((file) => {
      formData.append("images", file); 
    });


    formData.append("deletedImages", JSON.stringify(deletedImagesList));


    // Collect Steps items
    const items = [];
    $(".item-row").each(function () {
      items.push({
        iconName: $(this).find(".iconName").val(),
        title: $(this).find(".itemTitle").val(),
        label: $(this).find(".itemLabel").val(),
      });
    });
    formData.append("items", JSON.stringify(items));

    $.ajax({
      url: "/saveProject",
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

  // Delete Product
  $("#zero_config").on("click", ".delete-btn", async function () {
    const id = $(this).data("id");

    try {
      const res = await fetch(`/project/delete/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toastr.success(json.message);
        table.ajax.reload(null, false);
      } else {
        toastr.error(json.message);
      }
    } catch (err) {
      toastr.error("Delete failed");
    }
  });

});