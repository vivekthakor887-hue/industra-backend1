$(document).ready(function () {

  const DEFAULT_LOGO = "/images/logos/logo-light.png";
  const DEFAULT_DARK_LOGO = "/images/logos/logo-dark.png"; 
  const DEFAULT_FAVICON = "/images/logos/favicon.png";

  $.get("/getSettingjson", function (res) {

    // ===============================
    // DEFAULT (SAFE FALLBACK)
    // ===============================
    $(".logo-full").attr("src", DEFAULT_LOGO);      
    $(".dark-logo").attr("src", DEFAULT_DARK_LOGO); 
    $(".light-logo").attr("src", DEFAULT_LOGO);      

    $(".logo-mini").attr("src", DEFAULT_FAVICON);

    $(".responsive-light").attr("src", DEFAULT_LOGO);
    $(".responsive-dark").attr("src", DEFAULT_DARK_LOGO);

    $("#dynamic-favicon").attr("href", DEFAULT_FAVICON);
    $("#login-favicon").attr("href", DEFAULT_FAVICON);
    $("#dynamic-favicon-loader").attr("src", DEFAULT_FAVICON);
    $("#login-loader").attr("src", DEFAULT_FAVICON);

    if (!res.success || !res.data) return;

    const { logo, darkLogo, favicon } = res.data;

    // ===============================
    // LIGHT LOGO
    // ===============================
    if (logo && logo.trim() !== "") {
      $(".logo-full").attr("src", logo);
      $(".light-logo").attr("src", logo);
      $(".responsive-light").attr("src", logo);
    }

    // ===============================
    // DARK LOGO
    // ===============================
    if (darkLogo && darkLogo.trim() !== "") {
      $(".dark-logo").attr("src", darkLogo);
      $(".responsive-dark").attr("src", darkLogo);
    }

    // ===============================
    // FAVICON
    // ===============================
    if (favicon && favicon.trim() !== "") {
      $(".logo-mini").attr("src", favicon);
      $("#dynamic-favicon").attr("href", favicon);
      $("#login-favicon").attr("href", favicon);
      $("#dynamic-favicon-loader").attr("src", favicon);
      $("#login-loader").attr("src", favicon);
    }

  });

});
