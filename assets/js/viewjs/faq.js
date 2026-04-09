$(document).ready(function () {

  const modal = new bootstrap.Modal(document.getElementById("faqModal"));

  // --- TOASTR OPTIONS ---
  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  // Reset old datatable
  if ($.fn.DataTable.isDataTable("#zero_config")) {
    $("#zero_config").DataTable().clear().destroy();
  }

  // ========== DATATABLE ==========
  const table = $("#zero_config").DataTable({
    responsive: true,
    autoWidth: false,
    ajax: { url: "/faqjson", dataSrc: "data" },
    columns: [
      { data: "question" },
      {
        data: null,
        className: "text-center",
        render: (row) => `
          <div class="dropdown dropstart">
            <button class="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown">
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
          </div>`
      }
    ],
    order: [],
  });

  // ========== ADD FAQ BUTTON ==========
  $("#addFaqBtn").click(() => {
    $("#faqForm")[0].reset();
    $("#faqId").val("");
    $("#faqModalLabel").text("Add FAQ");
    modal.show();
  });

  // ========== EDIT FAQ ==========
  $("#zero_config").on("click", ".edit-btn", function () {
    const row = table.row($(this).closest("tr")).data();
    if (!row) {
      toastr.error("Data not found");
      return;
    }

    $("#faqForm")[0].reset();

    $("#faqId").val(row._id);
    $("#question").val(row.question);
    $("#answer").val(row.answer);

    $("#faqModalLabel").text("Edit FAQ");
    modal.show();
  });

  // ========== SAVE FAQ (ADD/UPDATE) ==========
  $("#faqForm").submit(function (e) {
    e.preventDefault();

    $.ajax({
      url: "/faqsave",
      type: "POST",
      data: {
        id: $("#faqId").val(),
        question: $("#question").val(),
        answer: $("#answer").val(),
      },
      success: (res) => {
        if (res.success) {
          toastr.success(res.message);
          modal.hide();
          table.ajax.reload(null, false);
        } else {
          toastr.error(res.message);
        }
      },
      error: () => toastr.error("Server error!")
    });
  });

  // ========== DELETE FAQ ==========
  $("#zero_config").on("click", ".delete-btn", function () {
    const id = $(this).data("id");


    $.ajax({
      url: `/faqdelete/${id}`,
      type: "DELETE",
      success: (res) => {
        toastr.success(res.message);
        table.ajax.reload(null, false);
      },
      error: () => toastr.error("Failed to delete")
    });
  });

  // ==========================
  // --- Generate by AI ---
  // ==========================
  // This is the new code added for AI content generation
  $("#generateAiBtn").click(async function () {
    const name = $("#question").val()?.trim();
    if (!name) {
      toastr.error("Please enter a question first!");
      return;
    }

    $(this).prop("disabled", true).text("Generating...");

    try {
      const res = await fetch("/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prompt: `You are answering an FAQ.

Rules:
- Answer ONLY the question provided.
- Do NOT mention product name, company name, or brand.
- Do NOT add introduction or conclusion.
- Keep the answer strictly 20–25 words.
- Write in clear, simple language.
Question:
${name}
        `.trim()
        }),
      });

      const data = await res.json();

      if (data.success && data.description) {
        $("#answer").val(data.description); // fill AI content in answer textarea
        toastr.success("AI content generated successfully!");
      } else {
        toastr.error(data.message || "Failed to generate content");
      }
    } catch {
      toastr.error("Something went wrong!");
    } finally {
      $(this)
        .prop("disabled", false)
        .html(`<i class="fa-solid fa-wand-magic-sparkles me-1"></i> Generate by AI`);
    }
  });

});

