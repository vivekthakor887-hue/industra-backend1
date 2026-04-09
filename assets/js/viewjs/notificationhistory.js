$(document).ready(function () {

    if ($.fn.DataTable.isDataTable("#zero_config")) {
        $("#zero_config").DataTable().clear().destroy();
    }

    const table = $("#zero_config").DataTable({
        serverSide: true,
        processing: true,
        responsive: true,
        autoWidth: false,
        ajax: "/notificationhistoryjson",

        columns: [
            {
                data: "name",
                render: d => d ? d : "-",
            },
            // ------------------------
            // MESSAGE (TRUNCATED)
            // ------------------------
            {
                data: "message",
                render: function (data) {
                    if (!data) return "-";
                    return data.length > 60
                        ? data.substring(0, 60) + "..."
                        : data;
                }
            },

            // ------------------------
            // CREATED AT
            // ------------------------
            {
                data: "createdAt",
                render: d => d ? new Date(d).toLocaleString() : "-"
            },

            // ------------------------
            // ACTION
            // ------------------------
            {
                data: null,
                className: "text-center",
                orderable: false,
                render: function (row) {
                    return `
                        <div class="dropdown dropstart">
                            <button class="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                    <a href="#" 
                                       class="dropdown-item viewNotificationBtn"
                                       data-user="${row.name || 'Unknown'}"
                                       data-message="${$('<div>').text(row.message || '').html()}">
                                        <i class="fa-solid fa-eye text-info me-2"></i> View
                                    </a>
                                </li>
                            </ul>
                        </div>
                    `;
                }
            }
        ],

        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        order: [[1, "desc"]],
    });

    // --------------------------
    // REFRESH BUTTON
    // --------------------------
    setTimeout(() => {
        const searchContainer = $("#zero_config_filter");
        if (searchContainer.length && !$("#refreshTableBtn").length) {
            searchContainer
                .addClass("d-flex justify-content-end gap-2")
                .append(`
                    <button id="refreshTableBtn" class="btn btn-sm btn-outline-secondary">
                        <i class="fa fa-rotate"></i>
                    </button>
                `);
        }
    }, 300);

    $(document).on("click", "#refreshTableBtn", function () {
        table.ajax.reload(null, false);
    });

    // --------------------------
    // VIEW MODAL LOGIC (FIXED)
    // --------------------------
    $(document).on("click", ".viewNotificationBtn", function (e) {
        e.preventDefault();

        const user = $(this).data("user") || "-";
        const message = $(this).data("message") || "-";

        $("#notifyUser").text(user);
        $("#notifyMessage").text(message);

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("notificationDetailsModal")
        );
        modal.show();
    });

});
