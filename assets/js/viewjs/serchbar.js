document.addEventListener("DOMContentLoaded", function () {
  const pages = [
    { title: "Dashboard", path: "/" },
    { title: "Manage Banner", path: "/getbanner" },
    { title: "Manage About", path: "/about" },
    { title: "Manage Blog", path: "/blog" },
    { title: "Manage Service", path: "/service" },
    { title: "Manage Exhibition", path: "/exhibition" },
    { title: "Manage Faq", path: "/faq" },
    { title: "Manage Testimonials", path: "/testimonials" },
    { title: "Manage Catalogues", path: "/catalogues" },
    { title: "Manage Newsletter", path: "/newslatter" },
    { title: "Manage Contact", path: "/contact" },
    { title: "Manage Category", path: "/ecocategory" },
    { title: "Manage Project", path: "/project" },
    { title: "Manage SEO", path: "/seo" },
    { title: "Manage Profile", path: "/profile" },
    { title: "Manage History", path: "/history" },
    { title: "See All Notification", path: "/notificationhistory" },
    { title: "Inquiry", path: "/inquiry" },
    { title: "Manage Why Choose Us", path: "/whychooseus" },
    { title: "Manage How It Work", path: "/howitwork" },
    { title: "Manage Gallery", path: "/getgallery" },
    { title: "Manage Hero Section", path: "/herosection" },
    { title: "Manage CTA Section", path: "/cta" },
    { title: "Manage Stats", path: "/herostats" },
    { title: "Manage ContactUS", path: "/contactuspage" },
    { title: "Export Database", path: "/exportdatabase" },

 ];

  const searchInput = document.getElementById("searchInput");
  const searchList = document.getElementById("searchList");
  const noResults = document.getElementById("noResults");

  // Render list
  function renderList(items) {
    searchList.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "p-2 mb-2 bg-hover-light-black rounded";
      li.innerHTML = `
        <a href="${item.path}" class="d-block text-decoration-none">
          <span class="fw-semibold">${item.title}</span><br>
          <span class="text-muted small">${item.path}</span>
        </a>`;
      searchList.appendChild(li);
    });

    noResults.style.display = items.length ? "none" : "block";
  }

  // Initial render
  renderList(pages);

  // Search (ONLY static pages)
  let debounceTimer;
  searchInput.addEventListener("keyup", function () {
    clearTimeout(debounceTimer);
    const query = this.value.toLowerCase().trim();

    debounceTimer = setTimeout(() => {
      if (!query) {
        renderList(pages);
        return;
      }

      const matches = pages.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.path.toLowerCase().includes(query)
      );

      renderList(matches);
    }, 300);
  });

  // Enter → open first result
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const first = searchList.querySelector("a");
      if (first) window.location.href = first.href;
    }
  });
});

