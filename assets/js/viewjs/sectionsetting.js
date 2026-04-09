document.addEventListener("DOMContentLoaded", () => {

  const dragAllowedSections = ["header", "home", "about"];

    const fixedKeysBySection = {
    header: ["sidebar", "search", "getquote"],
    home: ["joinournewsletter"],
    about: ["joinournewsletter"]
  };

  document.querySelectorAll(".tab-pane").forEach(pane => {
    const sectionType = pane.id;

    if (!dragAllowedSections.includes(sectionType)) return;

    const tbody = pane.querySelector("tbody");
    if (!tbody) return;

    new Sortable(tbody, {
      animation: 150,
       onMove: function (evt) {
        const draggedRow = evt.dragged;
        const relatedRow = evt.related;

        const draggedKey =
          draggedRow.querySelector(".section-key")?.value;

        const relatedKey =
          relatedRow.querySelector(".section-key")?.value;

        const lockedKeys = fixedKeysBySection[sectionType] || [];

        if (lockedKeys.includes(draggedKey)) {
          return false;
        }

        if (lockedKeys.includes(relatedKey)) {
          return false;
        }

        return true;
      }
    });


  });
  document.querySelectorAll(".btn-primary").forEach(btn => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".tab-pane");
      const sectionType = card.id;

      const rows = card.querySelectorAll("tbody tr");
      const items = [];
      rows.forEach((row, index) => {
        const sectionKeyInput = row.querySelector(".section-key");
        const sectionKey = sectionKeyInput.value;
    const originalName = row.querySelector(".original-section-name").value;
          const inputField = row.querySelector(".section-name-input");
          
          let finalName = "";

          if (inputField) {
            finalName = inputField.value;
          } else {
            finalName = originalName;
          }
        const isVisible = row.querySelector("input[type=checkbox].is_visible").checked;
        const is_visible_footer = row.querySelector("input[type=checkbox].is_visible_footer");

  let is_visible_footer_check = true;

          if (is_visible_footer) {
            is_visible_footer_check = is_visible_footer.checked;
          }

        items.push({
          section_key: sectionKey,
          updated_section_name: finalName,
          section_name: originalName,
          is_visible: isVisible,
          is_visible_footer: is_visible_footer_check,
          display_order: index + 1
        });
      });

      const res = await fetch("/sectionsettings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType, items })
      });

      const data = await res.json();

      if (data.success) {
        toastr.success(data.message);
      } else {
        toastr.error(data.message || "Failed to save");
      }
    });
  });

});
