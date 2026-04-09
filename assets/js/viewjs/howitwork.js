$(document).ready(function () {

  // ===============================
  // TOASTR
  // ===============================
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  // ===============================
  // ADD STEP ITEM
  // ===============================
  function addItem(item = {}) {
    $("#itemContainer").append(`
      <div class="item-row border rounded p-3 mt-3">

        <div class="row g-3">

          <!-- ICON -->
          <div class="col-md-3">
            <label class="form-label mb-1">
              Icon Name
            </label>
            <input type="text" class="form-control iconName"
              placeholder="e.g. Home, User, Settings"
              value="${item.iconName || ""}">
            <small class="text-muted">
              component name from
              <a href="https://lucide.dev/icons" target="_blank">lucide.dev</a>
            </small>
          </div>

          <!-- TITLE -->
          <div class="col-md-3">
            <label class="form-label mb-1">
              Title
            </label>
            <input type="text" class="form-control title"
              placeholder="Step title"
              value="${item.title || ""}">
          </div>

          <!-- DESCRIPTION -->
          <div class="col-md-5">
            <label class="form-label mb-1">
              Short Description
            </label>
            <textarea class="form-control shortDescription" rows="2"
              placeholder="Explain this step in short">${item.shortDescription || ""}</textarea>
          </div>

          <!-- REMOVE -->
          <div class="col-md-1 d-flex align-items-end justify-content-end">
            <button type="button"
              class="btn btn-outline-danger removeItemBtn"
              title="Remove step">
              <i class="fa fa-minus"></i>
            </button>
          </div>

        </div>
      </div>
    `);
  }

  // ===============================
  // ADD MORE
  // ===============================
  $("#addItemBtn").on("click", () => addItem());

  // ===============================
  // REMOVE (AT LEAST ONE REQUIRED)
  // ===============================
  $("#itemContainer").on("click", ".removeItemBtn", function () {
    if ($(".item-row").length === 1) {
      toastr.warning("At least one step is required");
      return;
    }
    $(this).closest(".item-row").remove();
  });

  // ===============================
  // LOAD EXISTING DATA
  // ===============================
  function loadHowItWork() {
    $.get("/howitworkjson", res => {

      $("#itemContainer").html("");

      if (!res?.data?.length) {
        addItem(); // default one
        return;
      }

      const data = res.data[0];
      $("#howItWorkId").val(data._id || "");

      if (Array.isArray(data.items) && data.items.length) {
        data.items.forEach(item => addItem(item));
      } else {
        addItem(); // safety
      }

      // Show previews if image exists
      if (data.image) {
        $("#previewImg").attr("src", data.image).removeClass("d-none");
      } else {
        $("#previewImg").attr("src", "").addClass("d-none");
      }
      if (data.backgroundImage) {
        $("#previewBgImg").attr("src", data.backgroundImage).removeClass("d-none");
      } else {
        $("#previewBgImg").attr("src", "").addClass("d-none");
      }
    });
  }

  loadHowItWork();

  // ===============================
  // IMAGE PREVIEW
  // ===============================
  $("#imageInput").on("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => $("#previewImg").attr("src", e.target.result).removeClass("d-none");
    reader.readAsDataURL(file);
  });

  $("#bgImageInput").on("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => $("#previewBgImg").attr("src", e.target.result).removeClass("d-none");
    reader.readAsDataURL(file);
  });

  // ===============================
  // SUBMIT
  // ===============================
  $("#howItWorkForm").on("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const items = [];

    $(".item-row").each(function () {
      const iconName = $(this).find(".iconName").val().trim();
      const title = $(this).find(".title").val().trim();
      const shortDescription = $(this).find(".shortDescription").val().trim();

      if (iconName || title || shortDescription) {
        items.push({ iconName, title, shortDescription });
      }
    });

    // ensure minimum one
    if (!items.length) {
      toastr.error("Please add at least one step");
      return;
    }

    formData.append("items", JSON.stringify(items));

    const btn = $("#howItWorkForm button[type='submit']");
    const old = btn.html();
    btn.prop("disabled", true)
       .html(`<span class="spinner-border spinner-border-sm"></span>`);

    $.ajax({
      url: "/howitworksave",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: res => {
        btn.prop("disabled", false).html(old);
        if (res.success) {
          toastr.success(res.message || "Updated successfully");
          loadHowItWork();
        } else {
          toastr.error(res.message || "Save failed");
        }
      },
      error: () => {
        btn.prop("disabled", false).html(old);
        toastr.error("Something went wrong");
      }
    });
  });

});
