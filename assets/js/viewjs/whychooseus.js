$(document).ready(function () {

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
  };

  //  CORRECT QUILL INIT
  const quill = new Quill("#editor", {
    theme: "snow"
  });

  let rowCount = 0;

  // ===============================
  // LOAD SECTION
  // ===============================
  function loadSection() {
    $("#whyChooseUsForm")[0].reset();
    $("#rowsContainer").html("");
    $("#previewImage").hide();
    quill.root.innerHTML = "";
    rowCount = 0;

    $.get("/whychooseusjson", function (res) {

      if (!res.success || !res.data) {
        addRow("", "");
        return;
      }

      $("#sectionTitle").val(res.data.title || "");
        $("#sectionBadge").val(res.data.badge || "");

      //  LOAD DESCRIPTION
      quill.root.innerHTML = res.data.description || "";

      if (res.data.image) {
        $("#previewImage").attr("src", res.data.image).show();
      }

      const features = res.data.features
        ? res.data.features.split(",")
        : [];

      const labels = res.data.labels || [];

      const max = Math.max(features.length, labels.length, 1);

      for (let i = 0; i < max; i++) {
        addRow(features[i] || "", labels[i] || "");
      }
    });
  }

  loadSection();

  // ===============================
  // IMAGE PREVIEW
  // ===============================
  $("#imageInput").on("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      $("#previewImage").attr("src", e.target.result).show();
    };
    reader.readAsDataURL(file);
  });

  // ===============================
  // ADD / REMOVE ROW
  // ===============================
  function addRow(feature = "", label = "") {
    rowCount++;

    $("#rowsContainer").append(`
      <div class="mb-2 removeRow${rowCount}">
        <div class="row g-2">
          <div class="col-md-6">
            <input class="form-control featureInput"
              value="${feature}"
              placeholder="Feature" required>
          </div>
          <div class="col-md-5">
            <input class="form-control labelInput"
              value="${label}"
              placeholder="Label" required>
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
    if ($(".labelInput").length === 0) {
      addRow("", "");
    }
  };

  // ===============================
  //  AI DESCRIPTION GENERATE
  // ===============================
  $("#generateAI").on("click", async function () {

    const title = $("#sectionTitle").val().trim();
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
          prompt:
            'Write a professional "Why Choose Us" section in 80–100 words. Highlight trust, quality, reliability and customer benefits.'
        })
      });

      const data = await res.json();

      if (data.success) {
        quill.root.innerHTML = data.description;
        toastr.success("AI description generated");
      } else {
        toastr.error(data.message || "AI failed");
      }

    } catch (err) {
      toastr.error("Something went wrong");
    }

    btn.prop("disabled", false).text("Generate Description by AI");
  });

  // ===============================
  // SAVE FORM
  // ===============================
  $("#whyChooseUsForm").submit(function (e) {
    e.preventDefault();

    const fd = new FormData(this);

    //  SAVE QUILL CONTENT
    fd.set("description", quill.root.innerHTML);

    const features = $(".featureInput")
      .map((_, el) => $(el).val()).get();

    const labels = $(".labelInput")
      .map((_, el) => $(el).val()).get();

    fd.set("features", features.join(","));
    fd.set("labels", JSON.stringify(labels));

    
    $.ajax({
      url: "/savewhychooseus",
      type: "POST",
      data: fd,
      contentType: false,
      processData: false,
      success: r =>
        r.success
          ? toastr.success(r.message)
          : toastr.error(r.message),
      error: () => toastr.error("Something went wrong")
    });
  });

});
