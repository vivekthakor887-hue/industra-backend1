document.addEventListener("DOMContentLoaded", function () {

    var options = {
        chart: {
            id: "weekly-stats2",
            type: "area",
            height: 120,
            sparkline: {
                enabled: false,
            },
            group: 'sparklines',
            fontFamily: "inherit",
            foreColor: "#adb0bb",
            toolbar: {
                show: false
            }
        },
  dataLabels: {
      enabled: false
    },

        series: [
            {
                name: "Inquiry",
                color: "var(--bs-primary)",
                data: inquiryCounts.length ? inquiryCounts : [0],
            },
        ],

        xaxis: {
            categories: inquiryDates,
            labels: {
                show: true,
                rotate: -45,
                style: {
                    fontSize: "9px",
                    colors: "#adb0bb"
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            show: false
        },

        grid: {
            show: false
        },
        stroke: {
            curve: "smooth",
            width: 2,
        },

        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0,
                inverseColors: false,
                opacityFrom: 0.18,
                opacityTo: 0,
                stops: [20, 180],
            },
        },

        markers: {
            size: 0,
        },

        tooltip: {
            theme: "dark",
            fixed: {
                enabled: true,
                position: "right",
            },
            y: {
                formatter: function (value, { dataPointIndex }) {
                    return `${value} Inquiry<br><small>${inquiryDates[dataPointIndex]}</small>`;
                }
            }
        },
    };

    new ApexCharts(
        document.querySelector("#weekly-stats"),
        options
    ).render();

});
