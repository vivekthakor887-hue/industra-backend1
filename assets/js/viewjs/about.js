$(document).ready(function () {

  // ------------------------
  // QUILL
  // ------------------------
  const quill = new Quill("#editor", { theme: "snow" });

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  let rowCount = 0;

  // ------------------------
  // ADD / REMOVE ROW
  // ------------------------
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

  $("#addRowBtn").click(() => addRow("", ""));

  window.removeRow = function (id) {
    $(".removeRow" + id).remove();
    if ($(".featureInput").length === 0) {
      addRow("", "");
    }
  };

  // ------------------------
  // LOAD EXISTING ABOUT
  // ------------------------
  $.get("/getaboutjson", function (res) {
    if (res?.data?.length) {
      const about = res.data[0];

      $("#aboutId").val(about._id || "");
      $("#title").val(about.title || "");
      $("#badge").val(about.badge || "");
      $("#shortDescription").val(about.shortDescription || "");
      $("#experience").val(about.experience || 0);
      quill.root.innerHTML = about.description || "";

      if (about.image) {
        $("#previewImage").attr("src", about.image).show();
      }
      if (about.imagesecond) {
        $("#previewSecondImage").attr("src", about.imagesecond).show();
      }
      if (about.video) {
        $("#previewVideo").attr("src", about.video).show();
      }

      // -------- FIXED PART --------
      $("#rowsContainer").html("");
      rowCount = 0;

      const features = about.features
        ? about.features.split(",")
        : [];

      const labels = Array.isArray(about.labels)
        ? about.labels
        : [];

      const max = Math.max(features.length, labels.length, 1);

      for (let i = 0; i < max; i++) {
        addRow(features[i] || "", labels[i] || "");
      }
    } else {
      addRow("", "");
    }
  });

  // ------------------------
  // IMAGE / VIDEO PREVIEW
  // ------------------------
  $("#imageInput").on("change", function () {
    const file = this.files[0];
    if (!file) return $("#previewImage").hide();

    const reader = new FileReader();
    reader.onload = e => $("#previewImage").attr("src", e.target.result).show();
    reader.readAsDataURL(file);
  });

  $("#imageSecondInput").on("change", function () {
    const file = this.files[0];
    if (!file) return $("#previewSecondImage").hide();

    const reader = new FileReader();
    reader.onload = e =>
      $("#previewSecondImage").attr("src", e.target.result).show();
    reader.readAsDataURL(file);
  });

  $("#videoInput").on("change", function () {
    const file = this.files[0];
    if (!file) return $("#previewVideo").hide();

    $("#previewVideo").attr("src", URL.createObjectURL(file)).show();
  });

  // ------------------------
  // AI GENERATE DESCRIPTION (FIXED)
  // ------------------------
  $("#generateDescBtn").on("click", async function () {
    const title = $("#title").val().trim();

    if (!title) {
      toastr.warning("Please enter title first");
      return;
    }

    const btn = $(this);
    btn.prop("disabled", true).text("Generating...");

    try {
      const res = await fetch("/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          prompt: `
Write an About section in this EXACT format:

SHORT:
(one sentence, max 25 words)

DESCRIPTION:
(one professional paragraph, 30–40 words)
        `
        })
      });

      const data = await res.json();

      if (data.success && data.description) {

        const text = data.description.trim();

        const lines = text.split("\n").filter(Boolean);

        $("#shortDescription").val(lines[0] || "");

        quill.root.innerHTML = lines.slice(1).join("<br>") || lines[0];

        toastr.success("Description generated successfully");
      } else {
        toastr.error(data.message || "AI failed");
      }

    } catch (err) {
      toastr.error("Something went wrong");
      console.error(err);
    }

    btn.prop("disabled", false).text("Generate Description by AI");
  });

  // ------------------------
  // SAVE / UPDATE ABOUT
  // ------------------------
  $("#aboutForm").on("submit", function (e) {
    e.preventDefault();

    const form = this;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    $("#description").val(quill.root.innerHTML);

    const features = $(".featureInput")
      .map((_, el) => $(el).val())
      .get();

    const labels = $(".labelInput")
      .map((_, el) => $(el).val())
      .get();

    const formData = new FormData(this);

    // schema friendly
    formData.set("features", features.join(","));
    formData.delete("labels");

    labels.forEach(l => {
      formData.append("labels[]", l);
    });

    $.ajax({
      url: "/addabout",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: res =>
        res.success
          ? toastr.success(res.message || "About updated successfully")
          : toastr.error(res.message || "Failed to update"),
      error: () => toastr.error("Server error")
    });
  });

});
